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
import { students, institutions, schemes } from "@/data/mockData";
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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [institution, setInstitution] = useState<any>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (!isAuth || role !== "student") {
      navigate("/login");
      return;
    }

    const studentData = students.find((s) => s.id === userId);
    if (studentData) {
      setStudent(studentData);
      const inst = institutions.find((i) => i.id === studentData.institutionId);
      setInstitution(inst);
    }
  }, [navigate]);

  if (!student || !institution) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/");
  };

  // Academic progress data
  const progressData = [
    { semester: "Sem 1", cgpa: 7.8 },
    { semester: "Sem 2", cgpa: 8.1 },
    { semester: "Sem 3", cgpa: 8.4 },
    { semester: "Sem 4", cgpa: 8.6 },
    { semester: "Sem 5", cgpa: student.cgpa },
  ];

  // Attendance data
  const attendanceData = [
    { month: "Aug", attendance: 88 },
    { month: "Sep", attendance: 90 },
    { month: "Oct", attendance: student.attendance },
    { month: "Nov", attendance: 93 },
    { month: "Dec", attendance: student.attendance },
  ];

  const eligibleSchemes = schemes.filter((scheme) => {
    if (scheme.eligibilityCriteria.includes("CGPA > 7.5") && student.cgpa >= 7.5) return true;
    if (scheme.eligibilityCriteria.includes("CGPA > 8.0") && student.cgpa >= 8.0) return true;
    if (scheme.eligibilityCriteria.includes("CGPA > 7.0") && student.cgpa >= 7.0) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar
        isAuthenticated={true}
        userRole="student"
        userName={student.name}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {student.name}! Here's your academic overview.
          </p>
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
                  <p className="font-semibold text-foreground">{institution.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placement Status</p>
                  <Badge
                    className={
                      student.placementStatus === "Placed"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {student.placementStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="CGPA"
            value={student.cgpa}
            description="Current Performance"
            icon={GraduationCap}
            trend="+0.3 from last sem"
            trendUp={true}
          />
          <StatsCard
            title="Attendance"
            value={`${student.attendance}%`}
            description="This semester"
            icon={Calendar}
            trend="+2% from last month"
            trendUp={true}
          />
          <StatsCard
            title="Scholarships"
            value={student.scholarships.length}
            description="Active benefits"
            icon={Award}
          />
          <StatsCard
            title="Projects"
            value={student.projects}
            description="Completed"
            icon={FileText}
          />
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cgpa"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="CGPA"
                />
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
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
              {student.scholarships.length > 0 ? (
                student.scholarships.map((scholarship: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 border border-border rounded-lg flex items-center justify-between"
                  >
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
              {student.internships.length > 0 ? (
                student.internships.map((internship: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 border border-border rounded-lg flex items-center justify-between"
                  >
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
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Schemes You're Eligible For
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibleSchemes.map((scheme) => (
              <div key={scheme.id} className="p-4 border border-border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-foreground">{scheme.name}</h4>
                  <Badge variant="outline">{scheme.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{scheme.eligibilityCriteria}</p>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {scheme.beneficiaries.toLocaleString()} beneficiaries
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Placement Info */}
        {student.placementStatus === "Placed" && (
          <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  🎉 Congratulations on Your Placement!
                </h3>
                <p className="text-muted-foreground mb-4">You've been placed at a great company</p>
                <div className="space-y-2">
                  <p className="text-foreground">
                    <strong>Company:</strong> {student.placementCompany}
                  </p>
                  <p className="text-foreground">
                    <strong>Package:</strong> ₹{student.placementPackage} LPA
                  </p>
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
