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
  Users,
  BookOpen,
  Award,
  TrendingUp,
  GraduationCap,
  FileText,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { teachers as initialTeachers, students as initialStudents, departments, institutions } from "@/data/mockData";
import { Student } from "@/data/mockData";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<any>(null);
  const [department, setDepartment] = useState<any>(null);
  const [institution, setInstitution] = useState<any>(null);
  const [deptStudents, setDeptStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  
  // Student Management States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({
    name: "",
    email: "",
    aadhaarLast4: "",
    year: 1,
    cgpa: 0,
    attendance: 0,
    projects: 0,
    placementStatus: "Not Placed",
    scholarships: [],
    internships: [],
  });

  // Load students from localStorage or use initial data
  const loadStudents = () => {
    const stored = localStorage.getItem("studentsData");
    const studentsData = stored ? JSON.parse(stored) : initialStudents;
    setAllStudents(studentsData);
    return studentsData;
  };

  // Save students to localStorage
  const saveStudents = (studentsList: Student[]) => {
    localStorage.setItem("studentsData", JSON.stringify(studentsList));
    setAllStudents(studentsList);
  };

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (!isAuth || role !== "teacher") {
      navigate("/login");
      return;
    }

    // Load teachers from localStorage or use initial data
    const storedTeachers = localStorage.getItem("teachersData");
    const teachersData = storedTeachers ? JSON.parse(storedTeachers) : initialTeachers;
    
    const teacherData = teachersData.find((t: any) => t.aparId === userId);
    if (teacherData) {
      setTeacher(teacherData);
      const dept = departments.find((d) => d.id === teacherData.departmentId);
      setDepartment(dept);
      const inst = institutions.find((i) => i.id === teacherData.institutionId);
      setInstitution(inst);
      
      const studentsData = loadStudents();
      const studentsInDept = studentsData.filter((s: Student) => s.departmentId === teacherData.departmentId);
      setDeptStudents(studentsInDept);
    }
  }, [navigate]);

  // Refresh department students when allStudents changes
  useEffect(() => {
    if (teacher) {
      const studentsInDept = allStudents.filter((s) => s.departmentId === teacher.departmentId);
      setDeptStudents(studentsInDept);
    }
  }, [allStudents, teacher]);

  if (!teacher || !department || !institution) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/");
  };

  // Student CRUD Operations
  const handleAddStudent = () => {
    setFormData({
      name: "",
      email: "",
      aadhaarLast4: "",
      year: 1,
      cgpa: 0,
      attendance: 0,
      projects: 0,
      placementStatus: "Not Placed",
      scholarships: [],
      internships: [],
      departmentId: teacher?.departmentId,
      institutionId: teacher?.institutionId,
    });
    setSelectedStudent(null);
    setIsAddDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      aadhaarLast4: student.aadhaarLast4,
      year: student.year,
      cgpa: student.cgpa,
      attendance: student.attendance,
      projects: student.projects,
      placementStatus: student.placementStatus,
      scholarships: student.scholarships || [],
      internships: student.internships || [],
      placementCompany: student.placementCompany,
      placementPackage: student.placementPackage,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const saveStudent = () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    const studentsList = [...allStudents];

    if (selectedStudent) {
      // Update existing student
      const index = studentsList.findIndex((s) => s.id === selectedStudent.id);
      if (index !== -1) {
        studentsList[index] = {
          ...selectedStudent,
          ...formData,
        } as Student;
        saveStudents(studentsList);
        toast.success("Student updated successfully");
        setIsEditDialogOpen(false);
      }
    } else {
      // Create new student
      const newStudent: Student = {
        id: `stud${Date.now()}`,
        ...formData,
        departmentId: teacher?.departmentId || "",
        institutionId: teacher?.institutionId || "",
      } as Student;
      studentsList.push(newStudent);
      saveStudents(studentsList);
      toast.success("Student added successfully");
      setIsAddDialogOpen(false);
    }

    setFormData({
      name: "",
      email: "",
      aadhaarLast4: "",
      year: 1,
      cgpa: 0,
      attendance: 0,
      projects: 0,
      placementStatus: "Not Placed",
      scholarships: [],
      internships: [],
    });
    setSelectedStudent(null);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      const studentsList = allStudents.filter((s) => s.id !== studentToDelete.id);
      saveStudents(studentsList);
      toast.success("Student deleted successfully");
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  // Student performance data
  const performanceData = [
    { cgpa: "9+", students: deptStudents.filter((s) => s.cgpa >= 9).length },
    { cgpa: "8-9", students: deptStudents.filter((s) => s.cgpa >= 8 && s.cgpa < 9).length },
    { cgpa: "7-8", students: deptStudents.filter((s) => s.cgpa >= 7 && s.cgpa < 8).length },
    { cgpa: "<7", students: deptStudents.filter((s) => s.cgpa < 7).length },
  ];

  // Attendance distribution
  const attendanceData = [
    {
      name: "Excellent (90+%)",
      value: deptStudents.filter((s) => s.attendance >= 90).length,
      color: "hsl(var(--accent))",
    },
    {
      name: "Good (80-90%)",
      value: deptStudents.filter((s) => s.attendance >= 80 && s.attendance < 90).length,
      color: "hsl(var(--primary))",
    },
    {
      name: "Average (<80%)",
      value: deptStudents.filter((s) => s.attendance < 80).length,
      color: "hsl(var(--destructive))",
    },
  ];

  const avgCGPA = (
    deptStudents.reduce((acc, s) => acc + s.cgpa, 0) / deptStudents.length
  ).toFixed(2);
  const avgAttendance = (
    deptStudents.reduce((acc, s) => acc + s.attendance, 0) / deptStudents.length
  ).toFixed(0);
  const placedStudents = deptStudents.filter((s) => s.placementStatus === "Placed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar
        isAuthenticated={true}
        userRole="teacher"
        userName={teacher.name}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your department and track student performance.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{teacher.name}</h2>
                <p className="text-muted-foreground">{teacher.email}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">APAR ID</p>
                  <p className="font-semibold text-foreground">{teacher.aparId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-semibold text-foreground">{teacher.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-semibold text-foreground">{department.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-semibold text-foreground">{teacher.experience} years</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Department Students"
            value={deptStudents.length}
            description="Total students"
            icon={Users}
          />
          <StatsCard
            title="Research Projects"
            value={teacher.research}
            description="Active projects"
            icon={BookOpen}
          />
          <StatsCard
            title="Publications"
            value={teacher.publications}
            description="Research papers"
            icon={FileText}
            trend="+5 this year"
            trendUp={true}
          />
          <StatsCard
            title="Training Programs"
            value={teacher.trainingPrograms}
            description="Conducted"
            icon={Award}
          />
        </div>

        {/* Department Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Average CGPA"
            value={avgCGPA}
            description="Department average"
            icon={GraduationCap}
            trend="+0.2 from last sem"
            trendUp={true}
          />
          <StatsCard
            title="Attendance Rate"
            value={`${avgAttendance}%`}
            description="Department average"
            icon={TrendingUp}
          />
          <StatsCard
            title="Placements"
            value={placedStudents}
            description={`${deptStudents.length} total students`}
            icon={Award}
            trend={`${((placedStudents / deptStudents.length) * 100).toFixed(0)}% placement rate`}
            trendUp={true}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <GraduationCap className="mr-2 h-5 w-5 text-primary" />
              Student Performance Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="cgpa" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="students" fill="hsl(var(--primary))" name="Number of Students" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-secondary" />
              Attendance Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
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
        </div>

        {/* Students Management Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Department Students Management</h3>
            <Button onClick={handleAddStudent} className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Year</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">CGPA</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Attendance</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Projects</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deptStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 text-foreground">{student.name}</td>
                    <td className="p-3 text-muted-foreground text-sm">{student.email}</td>
                    <td className="p-3 text-foreground">{student.year}</td>
                    <td className="p-3">
                      <span
                        className={`font-medium ${
                          student.cgpa >= 8.5
                            ? "text-accent"
                            : student.cgpa >= 7.5
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {student.cgpa}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-medium ${
                          student.attendance >= 90
                            ? "text-accent"
                            : student.attendance >= 80
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="p-3 text-foreground">{student.projects}</td>
                    <td className="p-3">
                      <Badge
                        className={
                          student.placementStatus === "Placed"
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {student.placementStatus}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {deptStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No students found. Click "Add Student" to add a new student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Student Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Fill in the student information. All fields marked with * are required.
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
                    placeholder="Enter student name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aadhaarLast4">Aadhaar (Last 4 digits)</Label>
                  <Input
                    id="aadhaarLast4"
                    value={formData.aadhaarLast4}
                    onChange={(e) => setFormData({ ...formData, aadhaarLast4: e.target.value })}
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1"
                    max="4"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA *</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance">Attendance (%) *</Label>
                  <Input
                    id="attendance"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.attendance}
                    onChange={(e) => setFormData({ ...formData, attendance: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projects">Projects</Label>
                  <Input
                    id="projects"
                    type="number"
                    min="0"
                    value={formData.projects}
                    onChange={(e) => setFormData({ ...formData, projects: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placementStatus">Placement Status</Label>
                  <select
                    id="placementStatus"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.placementStatus}
                    onChange={(e) => setFormData({ ...formData, placementStatus: e.target.value })}
                  >
                    <option value="Not Placed">Not Placed</option>
                    <option value="Placed">Placed</option>
                  </select>
                </div>
              </div>
              {formData.placementStatus === "Placed" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="placementCompany">Company</Label>
                    <Input
                      id="placementCompany"
                      value={formData.placementCompany || ""}
                      onChange={(e) => setFormData({ ...formData, placementCompany: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placementPackage">Package (LPA)</Label>
                    <Input
                      id="placementPackage"
                      type="number"
                      value={formData.placementPackage || ""}
                      onChange={(e) => setFormData({ ...formData, placementPackage: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveStudent} className="bg-gradient-primary">
                Add Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update the student information. All fields marked with * are required.
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
                    placeholder="Enter student name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-aadhaarLast4">Aadhaar (Last 4 digits)</Label>
                  <Input
                    id="edit-aadhaarLast4"
                    value={formData.aadhaarLast4}
                    onChange={(e) => setFormData({ ...formData, aadhaarLast4: e.target.value })}
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year *</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    min="1"
                    max="4"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cgpa">CGPA *</Label>
                  <Input
                    id="edit-cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-attendance">Attendance (%) *</Label>
                  <Input
                    id="edit-attendance"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.attendance}
                    onChange={(e) => setFormData({ ...formData, attendance: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-projects">Projects</Label>
                  <Input
                    id="edit-projects"
                    type="number"
                    min="0"
                    value={formData.projects}
                    onChange={(e) => setFormData({ ...formData, projects: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-placementStatus">Placement Status</Label>
                  <select
                    id="edit-placementStatus"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.placementStatus}
                    onChange={(e) => setFormData({ ...formData, placementStatus: e.target.value })}
                  >
                    <option value="Not Placed">Not Placed</option>
                    <option value="Placed">Placed</option>
                  </select>
                </div>
              </div>
              {formData.placementStatus === "Placed" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-placementCompany">Company</Label>
                    <Input
                      id="edit-placementCompany"
                      value={formData.placementCompany || ""}
                      onChange={(e) => setFormData({ ...formData, placementCompany: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-placementPackage">Package (LPA)</Label>
                    <Input
                      id="edit-placementPackage"
                      type="number"
                      value={formData.placementPackage || ""}
                      onChange={(e) => setFormData({ ...formData, placementPackage: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveStudent} className="bg-gradient-primary">
                Update Student
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
                This action cannot be undone. This will permanently delete the student
                <strong> {studentToDelete?.name}</strong> from the system.
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

export default TeacherDashboard;
