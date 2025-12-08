import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Award,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Plus,
} from "lucide-react";
import { schemes, institutions, students } from "@/data/mockData";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const GovernmentDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");

    if (!isAuth || role !== "government") {
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

  const totalBudget = schemes.reduce((acc, s) => acc + s.budget, 0);
  const totalBeneficiaries = schemes.reduce((acc, s) => acc + s.beneficiaries, 0);

  // Scheme distribution by type
  const schemeTypeData = [
    {
      name: "Merit-based",
      value: schemes.filter((s) => s.type === "Merit-based").length,
      color: "hsl(var(--primary))",
    },
    {
      name: "Need-based",
      value: schemes.filter((s) => s.type === "Need-based").length,
      color: "hsl(var(--secondary))",
    },
    {
      name: "Skill Development",
      value: schemes.filter((s) => s.type === "Skill Development").length,
      color: "hsl(var(--accent))",
    },
    {
      name: "Gender-based",
      value: schemes.filter((s) => s.type === "Gender-based").length,
      color: "hsl(var(--destructive))",
    },
  ];

  // Institution performance comparison
  const instPerformanceData = institutions.map((inst) => ({
    name: inst.name.split(" ")[0],
    performance: inst.performanceScore,
    placement: inst.placementRate,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar
        isAuthenticated={true}
        userRole="government"
        userName="Government Portal"
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Government Dashboard</h1>
            <p className="text-muted-foreground">
              Manage schemes, monitor institutional performance, and track impact.
            </p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Add New Scheme
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Schemes"
            value={schemes.length}
            description="Active programs"
            icon={Award}
          />
          <StatsCard
            title="Total Budget"
            value={`₹${(totalBudget / 10000000).toFixed(0)}Cr`}
            description="Allocated funds"
            icon={DollarSign}
          />
          <StatsCard
            title="Beneficiaries"
            value={totalBeneficiaries.toLocaleString()}
            description="Students helped"
            icon={Users}
            trend="+15% this year"
            trendUp={true}
          />
          <StatsCard
            title="Institutions"
            value={institutions.length}
            description="Registered institutes"
            icon={Building2}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <Award className="mr-2 h-5 w-5 text-primary" />
              Schemes by Type
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={schemeTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {schemeTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-secondary" />
              Institution Performance Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={instPerformanceData}>
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
                <Bar dataKey="performance" fill="hsl(var(--primary))" name="Performance Score" />
                <Bar dataKey="placement" fill="hsl(var(--accent))" name="Placement Rate" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Schemes Management */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Active Schemes</h3>
          <div className="space-y-4">
            {schemes.map((scheme) => {
              const progress = (scheme.beneficiaries / (scheme.budget / 4000)) * 100;
              return (
                <div
                  key={scheme.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{scheme.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {scheme.eligibilityCriteria}
                          </p>
                        </div>
                        <Badge className="bg-accent text-accent-foreground">{scheme.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">{scheme.type}</Badge>
                        <Badge variant="outline">
                          Launched: {new Date(scheme.launchDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-semibold text-foreground">
                        ₹{(scheme.budget / 10000000).toFixed(1)}Cr
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Beneficiaries</p>
                      <p className="font-semibold text-accent">
                        {scheme.beneficiaries.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Utilization</p>
                      <p className="font-semibold text-primary">{progress.toFixed(0)}%</p>
                    </div>
                  </div>

                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Institution Monitoring */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Institution Performance Monitor
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Institution</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">NIRF Rank</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Students</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Performance</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Compliance</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Placement</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst) => (
                  <tr key={inst.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-foreground">{inst.name}</p>
                        <p className="text-xs text-muted-foreground">{inst.location}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-primary text-primary-foreground">#{inst.nirfRank}</Badge>
                    </td>
                    <td className="p-3 text-foreground">{inst.studentsCount.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={inst.performanceScore} className="h-2 w-16" />
                        <span className="text-sm font-medium text-foreground">
                          {inst.performanceScore}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={inst.complianceScore} className="h-2 w-16" />
                        <span className="text-sm font-medium text-foreground">
                          {inst.complianceScore}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-accent">{inst.placementRate}%</span>
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

export default GovernmentDashboard;
