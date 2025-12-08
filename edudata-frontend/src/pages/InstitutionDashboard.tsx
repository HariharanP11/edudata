import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { institutions, students, teachers, departments } from "@/data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const [institution, setInstitution] = useState<any>(null);
  const [instStudents, setInstStudents] = useState<any[]>([]);
  const [instTeachers, setInstTeachers] = useState<any[]>([]);
  const [instDepartments, setInstDepartments] = useState<any[]>([]);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (!isAuth || role !== "institution") {
      navigate("/login");
      return;
    }

    const instData = institutions.find((i) => i.aisheCode === userId);
    if (instData) {
      setInstitution(instData);
      const studentsData = students.filter((s) => s.institutionId === instData.id);
      setInstStudents(studentsData);
      const teachersData = teachers.filter((t) => t.institutionId === instData.id);
      setInstTeachers(teachersData);
      const deptData = departments.filter((d) => d.institutionId === instData.id);
      setInstDepartments(deptData);
    }
  }, [navigate]);

  if (!institution) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/");
  };

  // Department-wise student distribution
  const deptDistribution = instDepartments.map((dept) => ({
    name: dept.name.split(" ")[0],
    students: instStudents.filter((s) => s.departmentId === dept.id).length,
  }));

  // Attendance trend
  const attendanceTrend = [
    { month: "Aug", attendance: 88 },
    { month: "Sep", attendance: 89 },
    { month: "Oct", attendance: 90 },
    { month: "Nov", attendance: 91 },
    { month: "Dec", attendance: 92 },
  ];

  const avgCGPA = (
    instStudents.reduce((acc, s) => acc + s.cgpa, 0) / instStudents.length
  ).toFixed(2);
  const placedCount = instStudents.filter((s) => s.placementStatus === "Placed").length;
  const placementRate = ((placedCount / instStudents.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar
        isAuthenticated={true}
        userRole="institution"
        userName={institution.name}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Institution Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor institutional performance, compliance, and analytics.
          </p>
        </div>

        {/* Institution Profile Card */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{institution.name}</h2>
                <p className="text-muted-foreground">{institution.location}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">AISHE Code</p>
                  <p className="font-semibold text-foreground">{institution.aisheCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIRF Rank</p>
                  <Badge className="bg-primary text-primary-foreground">
                    #{institution.nirfRank}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold text-foreground">{institution.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Established</p>
                  <p className="font-semibold text-foreground">{institution.establishedYear}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={instStudents.length}
            description="Enrolled students"
            icon={GraduationCap}
            trend="+12% from last year"
            trendUp={true}
          />
          <StatsCard
            title="Faculty Members"
            value={instTeachers.length}
            description="Teaching staff"
            icon={Users}
            trend="+5 this year"
            trendUp={true}
          />
          <StatsCard
            title="Departments"
            value={instDepartments.length}
            description="Active departments"
            icon={Building2}
          />
          <StatsCard
            title="Placement Rate"
            value={`${placementRate}%`}
            description="Current batch"
            icon={Briefcase}
            trend="+3% from last year"
            trendUp={true}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Performance Score</h3>
                <CheckCircle className="h-5 w-5 text-accent" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-3xl font-bold text-foreground">
                    {institution.performanceScore}%
                  </span>
                  <Badge className="bg-accent text-accent-foreground">Excellent</Badge>
                </div>
                <Progress value={institution.performanceScore} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Based on academic outcomes and research
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Compliance Score</h3>
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-3xl font-bold text-foreground">
                    {institution.complianceScore}%
                  </span>
                  <Badge className="bg-primary text-primary-foreground">Compliant</Badge>
                </div>
                <Progress value={institution.complianceScore} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Regulatory and accreditation standards
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Graduation Rate</h3>
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-3xl font-bold text-foreground">
                    {institution.graduationRate}%
                  </span>
                  <Badge className="bg-secondary text-secondary-foreground">Strong</Badge>
                </div>
                <Progress value={institution.graduationRate} className="h-2" />
                <p className="text-xs text-muted-foreground">Students completing on time</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-primary" />
              Department-wise Student Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="students" fill="hsl(var(--primary))" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-secondary" />
              Average Attendance Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[85, 95]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  name="Attendance %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Department Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Department Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Department</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Students</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Teachers</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Avg CGPA</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Placements</th>
                </tr>
              </thead>
              <tbody>
                {instDepartments.map((dept) => {
                  const deptStudents = instStudents.filter((s) => s.departmentId === dept.id);
                  const avgCGPA = deptStudents.length > 0
                    ? (deptStudents.reduce((acc, s) => acc + s.cgpa, 0) / deptStudents.length).toFixed(2)
                    : "N/A";
                  const placed = deptStudents.filter((s) => s.placementStatus === "Placed").length;
                  const placementPct = deptStudents.length > 0
                    ? ((placed / deptStudents.length) * 100).toFixed(0)
                    : "0";

                  return (
                    <tr key={dept.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3 text-foreground font-medium">{dept.name}</td>
                      <td className="p-3 text-foreground">{deptStudents.length}</td>
                      <td className="p-3 text-foreground">{dept.teachersCount}</td>
                      <td className="p-3">
                        <span className="font-medium text-accent">{avgCGPA}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-primary">
                          {placed} ({placementPct}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
