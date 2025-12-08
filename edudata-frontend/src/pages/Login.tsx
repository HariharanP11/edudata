import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Users, Building2, Shield, Lock } from "lucide-react";
import { mockCredentials } from "@/data/mockData";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "student";

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const credentials = mockCredentials[selectedRole as keyof typeof mockCredentials];

    if (userId === credentials.id && password === credentials.password) {
      // Store auth state
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", selectedRole);
      localStorage.setItem("userId", userId);

      toast.success(`Welcome! Logging in as ${selectedRole}`);

      // Navigate to appropriate dashboard
      navigate(`/dashboard/${selectedRole}`);
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
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

          <Tabs value={selectedRole} onValueChange={setSelectedRole} className="w-full">
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

                  <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                    Login as {config.label}
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
