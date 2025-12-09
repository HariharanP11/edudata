import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Lock,
  Users,
  GraduationCap,
  Building2,
  Award,
  TrendingUp,
  Download,
  Activity,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { institutions as initialInstitutions, students, teachers, schemes } from "@/data/mockData";
import { Institution } from "@/data/mockData";
import { toast } from "sonner";
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
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
  
  // Institution Management States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [institutionToDelete, setInstitutionToDelete] = useState<Institution | null>(null);
  const [formData, setFormData] = useState<Partial<Institution>>({
    name: "",
    aisheCode: "",
    location: "",
    type: "",
    nirfRank: 0,
    establishedYear: new Date().getFullYear(),
    studentsCount: 0,
    teachersCount: 0,
    performanceScore: 0,
    complianceScore: 0,
    graduationRate: 0,
    placementRate: 0,
    departments: [],
  });

  // Load institutions from localStorage or use initial data
  const loadInstitutions = () => {
    const stored = localStorage.getItem("institutionsData");
    const institutionsData = stored ? JSON.parse(stored) : initialInstitutions;
    setAllInstitutions(institutionsData);
    return institutionsData;
  };

  // Save institutions to localStorage
  const saveInstitutions = (institutionsList: Institution[]) => {
    localStorage.setItem("institutionsData", JSON.stringify(institutionsList));
    setAllInstitutions(institutionsList);
  };

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");

    if (!isAuth || role !== "admin") {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    loadInstitutions();
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

  // Institution CRUD Operations
  const handleAddInstitution = () => {
    setFormData({
      name: "",
      aisheCode: "",
      location: "",
      type: "",
      nirfRank: 0,
      establishedYear: new Date().getFullYear(),
      studentsCount: 0,
      teachersCount: 0,
      performanceScore: 0,
      complianceScore: 0,
      graduationRate: 0,
      placementRate: 0,
      departments: [],
    });
    setSelectedInstitution(null);
    setIsAddDialogOpen(true);
  };

  const handleEditInstitution = (institution: Institution) => {
    setSelectedInstitution(institution);
    setFormData({
      name: institution.name,
      aisheCode: institution.aisheCode,
      location: institution.location,
      type: institution.type,
      nirfRank: institution.nirfRank,
      establishedYear: institution.establishedYear,
      studentsCount: institution.studentsCount,
      teachersCount: institution.teachersCount,
      performanceScore: institution.performanceScore,
      complianceScore: institution.complianceScore,
      graduationRate: institution.graduationRate,
      placementRate: institution.placementRate,
      departments: institution.departments || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteInstitution = (institution: Institution) => {
    setInstitutionToDelete(institution);
    setIsDeleteDialogOpen(true);
  };

  const saveInstitution = () => {
    if (!formData.name || !formData.aisheCode || !formData.location || !formData.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    const institutionsList = [...allInstitutions];

    if (selectedInstitution) {
      // Update existing institution
      const index = institutionsList.findIndex((i) => i.id === selectedInstitution.id);
      if (index !== -1) {
        institutionsList[index] = {
          ...selectedInstitution,
          ...formData,
        } as Institution;
        saveInstitutions(institutionsList);
        toast.success("Institution updated successfully");
        setIsEditDialogOpen(false);
      }
    } else {
      // Create new institution
      const newInstitution: Institution = {
        id: `inst${Date.now()}`,
        ...formData,
        departments: [],
      } as Institution;
      institutionsList.push(newInstitution);
      saveInstitutions(institutionsList);
      toast.success("Institution added successfully");
      setIsAddDialogOpen(false);
    }

    setFormData({
      name: "",
      aisheCode: "",
      location: "",
      type: "",
      nirfRank: 0,
      establishedYear: new Date().getFullYear(),
      studentsCount: 0,
      teachersCount: 0,
      performanceScore: 0,
      complianceScore: 0,
      graduationRate: 0,
      placementRate: 0,
      departments: [],
    });
    setSelectedInstitution(null);
  };

  const confirmDelete = () => {
    if (institutionToDelete) {
      const institutionsList = allInstitutions.filter((i) => i.id !== institutionToDelete.id);
      saveInstitutions(institutionsList);
      toast.success("Institution deleted successfully");
      setIsDeleteDialogOpen(false);
      setInstitutionToDelete(null);
    }
  };

  const totalStudents = allInstitutions.length > 0
    ? allInstitutions.reduce((acc, inst) => acc + inst.studentsCount, 0)
    : 0;
  const totalTeachers = allInstitutions.length > 0
    ? allInstitutions.reduce((acc, inst) => acc + inst.teachersCount, 0)
    : 0;
  const avgPerformance = allInstitutions.length > 0
    ? (allInstitutions.reduce((acc, inst) => acc + inst.performanceScore, 0) / allInstitutions.length).toFixed(0)
    : "0";
  const avgCompliance = allInstitutions.length > 0
    ? (allInstitutions.reduce((acc, inst) => acc + inst.complianceScore, 0) / allInstitutions.length).toFixed(0)
    : "0";

  // Growth trend data
  const growthData = [
    { year: "2020", students: 12500, institutions: 3 },
    { year: "2021", students: 14200, institutions: 4 },
    { year: "2022", students: 15800, institutions: 4 },
    { year: "2023", students: 17300, institutions: 5 },
    { year: "2024", students: totalStudents, institutions: allInstitutions.length },
  ];

  // Institution comparison
  const instComparisonData = allInstitutions.map((inst) => ({
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
            value={allInstitutions.length}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">All Institutions</h3>
            <Button onClick={handleAddInstitution} className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Add Institution
            </Button>
          </div>
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
                  <th className="text-left p-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allInstitutions.map((inst) => (
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
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditInstitution(inst)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInstitution(inst)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {allInstitutions.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      No institutions found. Click "Add Institution" to add a new institution.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Institution Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Institution</DialogTitle>
              <DialogDescription>
                Fill in the institution information. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter institution name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aisheCode">AISHE Code *</Label>
                  <Input
                    id="aisheCode"
                    value={formData.aisheCode}
                    onChange={(e) => setFormData({ ...formData, aisheCode: e.target.value })}
                    placeholder="AISHE001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="">Select type</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nirfRank">NIRF Rank</Label>
                  <Input
                    id="nirfRank"
                    type="number"
                    min="1"
                    value={formData.nirfRank}
                    onChange={(e) => setFormData({ ...formData, nirfRank: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) || new Date().getFullYear() })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentsCount">Students Count</Label>
                  <Input
                    id="studentsCount"
                    type="number"
                    min="0"
                    value={formData.studentsCount}
                    onChange={(e) => setFormData({ ...formData, studentsCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teachersCount">Teachers Count</Label>
                  <Input
                    id="teachersCount"
                    type="number"
                    min="0"
                    value={formData.teachersCount}
                    onChange={(e) => setFormData({ ...formData, teachersCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="performanceScore">Performance Score (%)</Label>
                  <Input
                    id="performanceScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.performanceScore}
                    onChange={(e) => setFormData({ ...formData, performanceScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complianceScore">Compliance Score (%)</Label>
                  <Input
                    id="complianceScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.complianceScore}
                    onChange={(e) => setFormData({ ...formData, complianceScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="graduationRate">Graduation Rate (%)</Label>
                  <Input
                    id="graduationRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.graduationRate}
                    onChange={(e) => setFormData({ ...formData, graduationRate: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placementRate">Placement Rate (%)</Label>
                  <Input
                    id="placementRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.placementRate}
                    onChange={(e) => setFormData({ ...formData, placementRate: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveInstitution} className="bg-gradient-primary">
                Add Institution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Institution Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Institution</DialogTitle>
              <DialogDescription>
                Update the institution information. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter institution name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-aisheCode">AISHE Code *</Label>
                  <Input
                    id="edit-aisheCode"
                    value={formData.aisheCode}
                    onChange={(e) => setFormData({ ...formData, aisheCode: e.target.value })}
                    placeholder="AISHE001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location *</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type *</Label>
                  <select
                    id="edit-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="">Select type</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nirfRank">NIRF Rank</Label>
                  <Input
                    id="edit-nirfRank"
                    type="number"
                    min="1"
                    value={formData.nirfRank}
                    onChange={(e) => setFormData({ ...formData, nirfRank: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-establishedYear">Established Year</Label>
                  <Input
                    id="edit-establishedYear"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) || new Date().getFullYear() })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-studentsCount">Students Count</Label>
                  <Input
                    id="edit-studentsCount"
                    type="number"
                    min="0"
                    value={formData.studentsCount}
                    onChange={(e) => setFormData({ ...formData, studentsCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-teachersCount">Teachers Count</Label>
                  <Input
                    id="edit-teachersCount"
                    type="number"
                    min="0"
                    value={formData.teachersCount}
                    onChange={(e) => setFormData({ ...formData, teachersCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-performanceScore">Performance Score (%)</Label>
                  <Input
                    id="edit-performanceScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.performanceScore}
                    onChange={(e) => setFormData({ ...formData, performanceScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-complianceScore">Compliance Score (%)</Label>
                  <Input
                    id="edit-complianceScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.complianceScore}
                    onChange={(e) => setFormData({ ...formData, complianceScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-graduationRate">Graduation Rate (%)</Label>
                  <Input
                    id="edit-graduationRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.graduationRate}
                    onChange={(e) => setFormData({ ...formData, graduationRate: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-placementRate">Placement Rate (%)</Label>
                  <Input
                    id="edit-placementRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.placementRate}
                    onChange={(e) => setFormData({ ...formData, placementRate: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveInstitution} className="bg-gradient-primary">
                Update Institution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the institution
                <strong> {institutionToDelete?.name}</strong> from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
