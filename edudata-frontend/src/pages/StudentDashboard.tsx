// edudata-frontend/src/pages/StudentDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Award,
  Briefcase,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import apiService from "@/services/api"; // <-- uses apiService.get('/students/me')

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any | null>(null);
  const [institution, setInstitution] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // load profile from backend
  const loadProfile = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // server endpoint should be GET /api/students/me and return { profile: {...} }
      const res: any = await apiService.get("/students/me");
      // accept either { profile } or raw profile
      const profile = res?.profile ?? res;
      if (!profile) {
        setErrorMsg("No student profile found. Please ask a teacher to add your profile.");
        setStudent(null);
        setInstitution(null);
      } else {
        setStudent(profile);
        // if your frontend has static institutions data, find match, otherwise profile.institution maybe contain name
        if (profile.institutionId && Array.isArray((window as any).__EDU_INSTITUTIONS__ || [])) {
          const insts = (window as any).__EDU_INSTITUTIONS__;
          const inst = insts.find((i: any) => i.id === profile.institutionId);
          setInstitution(inst || null);
        } else if (profile.institution) {
          setInstitution(profile.institution);
        } else {
          setInstitution(null);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch profile", err);
      // If backend returns 401 it will redirect via interceptor; otherwise show message
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load profile";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ensure user is logged in as student
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    if (!isAuth || role !== "student") {
      navigate("/login");
      return;
    }

    loadProfile();

    // optional: poll for updates (same-tab)
    const interval = setInterval(() => {
      loadProfile();
    }, 15000); // every 15s

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) return <div className="p-8">Loading profile...</div>;
  if (errorMsg)
    return (
      <div className="min-h-screen">
        <Navbar isAuthenticated={true} userRole="student" userName={student?.name || ""} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Unable to load profile</h2>
            <p className="text-sm text-muted-foreground mt-2">{errorMsg}</p>
          </Card>
        </div>
      </div>
    );

  if (!student)
    return (
      <div className="min-h-screen">
        <Navbar isAuthenticated={true} userRole="student" userName="" onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">No profile found</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Ask your teacher to add your profile. Once created, refresh this page.
            </p>
          </Card>
        </div>
      </div>
    );

  // Academic progress data (use real profile CGPA for last entry)
  const progressData = [
    { semester: "Sem 1", cgpa: 7.8 },
    { semester: "Sem 2", cgpa: 8.1 },
    { semester: "Sem 3", cgpa: 8.4 },
    { semester: "Sem 4", cgpa: 8.6 },
    { semester: "Sem 5", cgpa: student.cgpa || 8.6 },
  ];

  // Attendance data (use profile attendance where available)
  const attendanceData = [
    { month: "Aug", attendance: 88 },
    { month: "Sep", attendance: 90 },
    { month: "Oct", attendance: student.attendance ?? 92 },
    { month: "Nov", attendance: 93 },
    { month: "Dec", attendance: student.attendance ?? 92 },
  ];

  const eligibleSchemes = (student.eligibleSchemes || []).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar isAuthenticated={true} userRole="student" userName={student.name} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {student.name}! Here's your academic overview.</p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
                <p className="text-muted-foreground">{student.email}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Aadhaar (Last 4)</p>
                  <p className="font-semibold text-foreground">XXXX-{student.aadhaarLast4}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-semibold text-foreground">{student.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-semibold text-foreground">{institution?.name ?? student.institution ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placement Status</p>
                  <Badge className={student.placementStatus === "Placed" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}>
                    {student.placementStatus ?? "Not Placed"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="CGPA" value={student.cgpa ?? "-"} description="Current Performance" icon={GraduationCap} trend="+0.3 from last sem" trendUp={true} />
          <StatsCard title="Attendance" value={`${student.attendance ?? "-"}%`} description="This semester" icon={Calendar} trend="+2% from last month" trendUp={true} />
          <StatsCard title="Scholarships" value={(student.scholarships || []).length} description="Active benefits" icon={Award} />
          <StatsCard title="Projects" value={student.projects ?? 0} description="Completed" icon={FileText} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Academic Progress
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="semester" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[7, 10]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="cgpa" stroke="hsl(var(--primary))" strokeWidth={2} name="CGPA" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-secondary" />
              Attendance Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[80, 100]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Bar dataKey="attendance" fill="hsl(var(--secondary))" name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Scholarships & Internships */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <Award className="mr-2 h-5 w-5 text-accent" />
              Active Scholarships
            </h3>
            <div className="space-y-3">
              {student.scholarships && student.scholarships.length > 0 ? (
                student.scholarships.map((scholarship: string, idx: number) => (
                  <div key={idx} className="p-3 border border-border rounded-lg flex items-center justify-between">
                    <span className="text-foreground">{scholarship}</span>
                    <Badge className="bg-accent text-accent-foreground">Active</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No active scholarships</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-secondary" />
              Internships
            </h3>
            <div className="space-y-3">
              {student.internships && student.internships.length > 0 ? (
                student.internships.map((internship: string, idx: number) => (
                  <div key={idx} className="p-3 border border-border rounded-lg flex items-center justify-between">
                    <span className="text-foreground">{internship}</span>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No internships yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Eligible Schemes */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Schemes You're Eligible For</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibleSchemes.length > 0 ? (
              eligibleSchemes.map((scheme: any) => (
                <div key={scheme.id} className="p-4 border border-border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-foreground">{scheme.name}</h4>
                    <Badge variant="outline">{scheme.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{scheme.eligibilityCriteria}</p>
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-muted-foreground">{scheme.beneficiaries.toLocaleString()} beneficiaries</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No eligible schemes at the moment</p>
            )}
          </div>
        </Card>

        {/* Placement Info */}
        {student.placementStatus === "Placed" && (
          <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">🎉 Congratulations on Your Placement!</h3>
                <p className="text-muted-foreground mb-4">You've been placed at a great company</p>
                <div className="space-y-2">
                  <p className="text-foreground"><strong>Company:</strong> {student.placementCompany}</p>
                  <p className="text-foreground"><strong>Package:</strong> ₹{student.placementPackage} LPA</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
