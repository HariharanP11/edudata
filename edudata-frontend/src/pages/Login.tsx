import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Users, Building2, Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import apiClient from "@/services/api";

const dashboardRouteByRole: Record<string, string> = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  institution: "/dashboard/institution",
  government: "/dashboard/government",
  admin: "/dashboard/admin",
};

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "student";

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedRole(initialRole);
    setStep("credentials");
    setSessionToken("");
    setOtpCode("");
  }, [initialRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Backend expects either email or loginId; we map the UI ID field to loginId.
      const response = await apiClient.post("/auth/login", {
        loginId: userId,
        password,
      });

      const data = response.data as any;

      // If OTP is enabled (default), backend responds with sessionToken and otpRequired.
      if (data.otpRequired) {
        if (!data.sessionToken) {
          throw new Error("Missing sessionToken in OTP response");
        }
        setSessionToken(data.sessionToken);
        setStep("otp");
        setOtpCode("");
        toast.success("OTP sent to your registered contact");
        return;
      }

      // Fallback: if OTP is disabled, login returns JWT + user directly.
      const { token, user } = data;
      if (!token || !user) {
        throw new Error("Unexpected login response from server");
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userId", user.loginId || user.email || "");

      const path = dashboardRouteByRole[user.role] || "/";
      toast.success(`Welcome! Logging in as ${user.role}`);
      navigate(path);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.response?.data?.error || err.message || "Login failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) {
      toast.error("Missing OTP session. Please login again.");
      setStep("credentials");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/auth/verify-otp", {
        sessionToken,
        code: otpCode,
      });

      const data = response.data as any;
      const { token, user } = data;
      if (!token || !user) {
        throw new Error("Unexpected verify-otp response from server");
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userId", user.loginId || user.email || "");

      const path = dashboardRouteByRole[user.role] || "/";
      toast.success("OTP verified successfully");
      navigate(path);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.response?.data?.error || err.message || "OTP verification failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setSessionToken("");
    setOtpCode("");
  };

  const roleConfig = {
    student: {
      icon: GraduationCap,
      label: "Student",
      idLabel: "Student ID / Aadhaar",
      idPlaceholder: "Enter your Student ID",
      hint: "Demo: stud1 / student123",
    },
    teacher: {
      icon: Users,
      label: "Teacher",
      idLabel: "APAR ID",
      idPlaceholder: "Enter your APAR ID",
      hint: "Demo: APAR001 / teacher123",
    },
    institution: {
      icon: Building2,
      label: "Institution",
      idLabel: "AISHE Code",
      idPlaceholder: "Enter your AISHE Code",
      hint: "Demo: AISHE001 / institution123",
    },
    government: {
      icon: Shield,
      label: "Government",
      idLabel: "Government ID",
      idPlaceholder: "Enter your Government ID",
      hint: "Demo: gov123 / gov123",
    },
    admin: {
      icon: Lock,
      label: "Admin",
      idLabel: "Admin ID",
      idPlaceholder: "Enter Admin ID",
      hint: "Demo: admin / admin123",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />

      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-2xl p-8 shadow-elevated">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome to EduData</h1>
            <p className="text-muted-foreground mt-2">
              Select your role and login to access your dashboard
            </p>
          </div>

          <Tabs
            value={selectedRole}
            onValueChange={(value) => {
              setSelectedRole(value);
              setStep("credentials");
              setSessionToken("");
              setOtpCode("");
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(roleConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{config.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(roleConfig).map(([key, config]) => (
              <TabsContent key={key} value={key}>
                {step === "credentials" ? (
                  <form onSubmit={handleLogin} className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="userId">{config.idLabel}</Label>
                      <Input
                        id="userId"
                        type="text"
                        placeholder={config.idPlaceholder}
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Demo Credentials:</strong> {config.hint}
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending OTP..." : `Login as ${config.label}`}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter the OTP you received"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                      />
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        We have sent a one-time password to your registered contact (phone/email).
                        <br />
                        For development mode without SMS, check the server logs for the OTP code.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-primary hover:opacity-90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Verifying..." : "Verify OTP"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        disabled={isSubmitting}
                        onClick={handleBackToCredentials}
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
