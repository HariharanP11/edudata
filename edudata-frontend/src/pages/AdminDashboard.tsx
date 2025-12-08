import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Users,
  GraduationCap,
  Building2,
  Award,
  TrendingUp,
  Download,
  Activity,
} from "lucide-react";
import { institutions, students, teachers, schemes } from "@/data/mockData";
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");

    if (!isAuth || role !== "admin") {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
  }, [navigate]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const totalStudents = institutions.reduce((acc, inst) => acc + inst.studentsCount, 0);
  const totalTeachers = institutions.reduce((acc, inst) => acc + inst.teachersCount, 0);
  const avgPerformance = (
    institutions.reduce((acc, inst) => acc + inst.performanceScore, 0) / institutions.length
  ).toFixed(0);
  const avgCompliance = (
    institutions.reduce((acc, inst) => acc + inst.complianceScore, 0) / institutions.length
  ).toFixed(0);

  // Growth trend data
  const growthData = [
    { year: "2020", students: 12500, institutions: 3 },
    { year: "2021", students: 14200, institutions: 4 },
    { year: "2022", students: 15800, institutions: 4 },
    { year: "2023", students: 17300, institutions: 5 },
    { year: "2024", students: totalStudents, institutions: institutions.length },
  ];

  // Institution comparison
  const instComparisonData = institutions.map((inst) => ({
    name: inst.name.split(" ")[0],
    students: inst.studentsCount,
    teachers: inst.teachersCount,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar
        isAuthenticated={true}
        userRole="admin"
        userName="System Administrator"
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Complete system overview with access to all data and analytics.
            </p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* System-wide Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={totalStudents.toLocaleString()}
            description="Across all institutions"
            icon={GraduationCap}
            trend="+18% from last year"
            trendUp={true}
          />
          <StatsCard
            title="Total Teachers"
            value={totalTeachers.toLocaleString()}
            description="Faculty members"
            icon={Users}
            trend="+12% from last year"
            trendUp={true}
          />
          <StatsCard
            title="Institutions"
            value={institutions.length}
            description="Registered institutes"
            icon={Building2}
            trend="+1 this year"
            trendUp={true}
          />
          <StatsCard
            title="Active Schemes"
            value={schemes.length}
            description="Government programs"
            icon={Award}
          />
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">System Performance</h3>
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Average Performance Score</span>
                    <span className="text-sm font-medium text-foreground">{avgPerformance}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary"
                      style={{ width: `${avgPerformance}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Average Compliance Score</span>
                    <span className="text-sm font-medium text-foreground">{avgCompliance}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary"
                      style={{ width: `${avgCompliance}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Access</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/dashboard/student">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Student View
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/dashboard/teacher">
                  <Users className="mr-2 h-4 w-4" />
                  Teacher View
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/dashboard/institution">
                  <Building2 className="mr-2 h-4 w-4" />
                  Institution View
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/dashboard/government">
                  <Award className="mr-2 h-4 w-4" />
                  Government View
                </a>
              </Button>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              System Growth Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Students"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="institutions"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  name="Institutions"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-secondary" />
              Institution Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={instComparisonData}>
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
                <Bar dataKey="teachers" fill="hsl(var(--accent))" name="Teachers" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* All Institutions Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">All Institutions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Institution</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Location</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">NIRF Rank</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Students</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Teachers</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Performance</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Compliance</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst) => (
                  <tr key={inst.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-foreground">{inst.name}</p>
                        <p className="text-xs text-muted-foreground">{inst.aisheCode}</p>
                      </div>
                    </td>
                    <td className="p-3 text-foreground">{inst.location}</td>
                    <td className="p-3">
                      <Badge className="bg-primary text-primary-foreground">#{inst.nirfRank}</Badge>
                    </td>
                    <td className="p-3 text-foreground">{inst.studentsCount.toLocaleString()}</td>
                    <td className="p-3 text-foreground">{inst.teachersCount}</td>
                    <td className="p-3">
                      <span
                        className={`font-medium ${
                          inst.performanceScore >= 95
                            ? "text-accent"
                            : inst.performanceScore >= 90
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {inst.performanceScore}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-medium ${
                          inst.complianceScore >= 95
                            ? "text-accent"
                            : inst.complianceScore >= 90
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {inst.complianceScore}%
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-accent text-accent-foreground">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
