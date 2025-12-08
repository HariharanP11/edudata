import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  GraduationCap,
  FileText,
} from "lucide-react";
import { teachers, students, departments, institutions } from "@/data/mockData";
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
  const [deptStudents, setDeptStudents] = useState<any[]>([]);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (!isAuth || role !== "teacher") {
      navigate("/login");
      return;
    }

    const teacherData = teachers.find((t) => t.aparId === userId);
    if (teacherData) {
      setTeacher(teacherData);
      const dept = departments.find((d) => d.id === teacherData.departmentId);
      setDepartment(dept);
      const inst = institutions.find((i) => i.id === teacherData.institutionId);
      setInstitution(inst);
      const studentsInDept = students.filter((s) => s.departmentId === teacherData.departmentId);
      setDeptStudents(studentsInDept);
    }
  }, [navigate]);

  if (!teacher || !department || !institution) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/");
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

        {/* Students Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Department Students</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Year</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">CGPA</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Attendance</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Projects</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {deptStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 text-foreground">{student.name}</td>
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

export default TeacherDashboard;
