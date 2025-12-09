import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  Briefcase,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { institutions as initialInstitutions, students, teachers as initialTeachers, departments } from "@/data/mockData";
import { Teacher } from "@/data/mockData";
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

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const [institution, setInstitution] = useState<any>(null);
  const [instStudents, setInstStudents] = useState<any[]>([]);
  const [instTeachers, setInstTeachers] = useState<any[]>([]);
  const [instDepartments, setInstDepartments] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  
  // Teacher Management States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: "",
    email: "",
    aparId: "",
    designation: "",
    experience: 0,
    research: 0,
    publications: 0,
    trainingPrograms: 0,
  });

  // Load teachers from localStorage or use initial data
  const loadTeachers = () => {
    const stored = localStorage.getItem("teachersData");
    const teachersData = stored ? JSON.parse(stored) : initialTeachers;
    setAllTeachers(teachersData);
    return teachersData;
  };

  // Save teachers to localStorage
  const saveTeachers = (teachersList: Teacher[]) => {
    localStorage.setItem("teachersData", JSON.stringify(teachersList));
    setAllTeachers(teachersList);
  };

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (!isAuth || role !== "institution") {
      navigate("/login");
      return;
    }

    // Load institutions from localStorage or use initial data
    const storedInstitutions = localStorage.getItem("institutionsData");
    const institutionsData = storedInstitutions ? JSON.parse(storedInstitutions) : initialInstitutions;
    
    const instData = institutionsData.find((i: any) => i.aisheCode === userId);
    if (instData) {
      setInstitution(instData);
      const studentsData = students.filter((s) => s.institutionId === instData.id);
      setInstStudents(studentsData);
      
      const teachersData = loadTeachers();
      const teachersInInst = teachersData.filter((t: Teacher) => t.institutionId === instData.id);
      setInstTeachers(teachersInInst);
      
      const deptData = departments.filter((d) => d.institutionId === instData.id);
      setInstDepartments(deptData);
    }
  }, [navigate]);

  // Refresh institution teachers when allTeachers changes
  useEffect(() => {
    if (institution) {
      const teachersInInst = allTeachers.filter((t) => t.institutionId === institution.id);
      setInstTeachers(teachersInInst);
    }
  }, [allTeachers, institution]);

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

  const avgCGPA = instStudents.length > 0
    ? (instStudents.reduce((acc, s) => acc + s.cgpa, 0) / instStudents.length).toFixed(2)
    : "0.00";
  const placedCount = instStudents.filter((s) => s.placementStatus === "Placed").length;
  const placementRate = instStudents.length > 0
    ? ((placedCount / instStudents.length) * 100).toFixed(0)
    : "0";

  // Teacher CRUD Operations
  const handleAddTeacher = () => {
    setFormData({
      name: "",
      email: "",
      aparId: "",
      designation: "",
      experience: 0,
      research: 0,
      publications: 0,
      trainingPrograms: 0,
      departmentId: instDepartments[0]?.id || "",
      institutionId: institution?.id || "",
    });
    setSelectedTeacher(null);
    setIsAddDialogOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      aparId: teacher.aparId,
      designation: teacher.designation,
      experience: teacher.experience,
      research: teacher.research,
      publications: teacher.publications,
      trainingPrograms: teacher.trainingPrograms,
      departmentId: teacher.departmentId,
      institutionId: teacher.institutionId,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteDialogOpen(true);
  };

  const saveTeacher = () => {
    if (!formData.name || !formData.email || !formData.aparId || !formData.designation) {
      toast.error("Please fill in all required fields");
      return;
    }

    const teachersList = [...allTeachers];

    if (selectedTeacher) {
      // Update existing teacher
      const index = teachersList.findIndex((t) => t.id === selectedTeacher.id);
      if (index !== -1) {
        teachersList[index] = {
          ...selectedTeacher,
          ...formData,
        } as Teacher;
        saveTeachers(teachersList);
        toast.success("Teacher updated successfully");
        setIsEditDialogOpen(false);
      }
    } else {
      // Create new teacher
      const newTeacher: Teacher = {
        id: `teach${Date.now()}`,
        ...formData,
        departmentId: formData.departmentId || instDepartments[0]?.id || "",
        institutionId: institution?.id || "",
      } as Teacher;
      teachersList.push(newTeacher);
      saveTeachers(teachersList);
      toast.success("Teacher added successfully");
      setIsAddDialogOpen(false);
    }

    setFormData({
      name: "",
      email: "",
      aparId: "",
      designation: "",
      experience: 0,
      research: 0,
      publications: 0,
      trainingPrograms: 0,
    });
    setSelectedTeacher(null);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      const teachersList = allTeachers.filter((t) => t.id !== teacherToDelete.id);
      saveTeachers(teachersList);
      toast.success("Teacher deleted successfully");
      setIsDeleteDialogOpen(false);
      setTeacherToDelete(null);
    }
  };

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
        <Card className="p-6 mb-8">
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
                  const deptTeachers = instTeachers.filter((t) => t.departmentId === dept.id);
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
                      <td className="p-3 text-foreground">{deptTeachers.length}</td>
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

        {/* Teachers Management Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Faculty Management</h3>
            <Button onClick={handleAddTeacher} className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">APAR ID</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Designation</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Department</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Experience</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Research</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {instTeachers.map((teacher) => {
                  const dept = instDepartments.find((d) => d.id === teacher.departmentId);
                  return (
                    <tr key={teacher.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3 text-foreground font-medium">{teacher.name}</td>
                      <td className="p-3 text-muted-foreground text-sm">{teacher.email}</td>
                      <td className="p-3 text-foreground">{teacher.aparId}</td>
                      <td className="p-3 text-foreground">{teacher.designation}</td>
                      <td className="p-3 text-foreground">{dept?.name || "N/A"}</td>
                      <td className="p-3 text-foreground">{teacher.experience} years</td>
                      <td className="p-3 text-foreground">{teacher.research} projects</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTeacher(teacher)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTeacher(teacher)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {instTeachers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No teachers found. Click "Add Teacher" to add a new teacher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Teacher Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>
                Fill in the teacher information. All fields marked with * are required.
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
                    placeholder="Enter teacher name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aparId">APAR ID *</Label>
                  <Input
                    id="aparId"
                    value={formData.aparId}
                    onChange={(e) => setFormData({ ...formData, aparId: e.target.value })}
                    placeholder="APAR001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <select
                    id="designation"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  >
                    <option value="">Select designation</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department *</Label>
                  <select
                    id="departmentId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">Select department</option>
                    {instDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (years) *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="research">Research Projects</Label>
                  <Input
                    id="research"
                    type="number"
                    min="0"
                    value={formData.research}
                    onChange={(e) => setFormData({ ...formData, research: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publications">Publications</Label>
                  <Input
                    id="publications"
                    type="number"
                    min="0"
                    value={formData.publications}
                    onChange={(e) => setFormData({ ...formData, publications: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainingPrograms">Training Programs</Label>
                  <Input
                    id="trainingPrograms"
                    type="number"
                    min="0"
                    value={formData.trainingPrograms}
                    onChange={(e) => setFormData({ ...formData, trainingPrograms: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveTeacher} className="bg-gradient-primary">
                Add Teacher
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Teacher Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
              <DialogDescription>
                Update the teacher information. All fields marked with * are required.
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
                    placeholder="Enter teacher name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-aparId">APAR ID *</Label>
                  <Input
                    id="edit-aparId"
                    value={formData.aparId}
                    onChange={(e) => setFormData({ ...formData, aparId: e.target.value })}
                    placeholder="APAR001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-designation">Designation *</Label>
                  <select
                    id="edit-designation"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  >
                    <option value="">Select designation</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-departmentId">Department *</Label>
                  <select
                    id="edit-departmentId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">Select department</option>
                    {instDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-experience">Experience (years) *</Label>
                  <Input
                    id="edit-experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-research">Research Projects</Label>
                  <Input
                    id="edit-research"
                    type="number"
                    min="0"
                    value={formData.research}
                    onChange={(e) => setFormData({ ...formData, research: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-publications">Publications</Label>
                  <Input
                    id="edit-publications"
                    type="number"
                    min="0"
                    value={formData.publications}
                    onChange={(e) => setFormData({ ...formData, publications: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-trainingPrograms">Training Programs</Label>
                  <Input
                    id="edit-trainingPrograms"
                    type="number"
                    min="0"
                    value={formData.trainingPrograms}
                    onChange={(e) => setFormData({ ...formData, trainingPrograms: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveTeacher} className="bg-gradient-primary">
                Update Teacher
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
                This action cannot be undone. This will permanently delete the teacher
                <strong> {teacherToDelete?.name}</strong> from the system.
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

export default InstitutionDashboard;
