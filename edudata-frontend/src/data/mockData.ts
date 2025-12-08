// Mock data for EduData Platform demo

export interface Institution {
  id: string;
  name: string;
  aisheCode: string;
  location: string;
  type: string;
  nirfRank: number;
  establishedYear: number;
  studentsCount: number;
  teachersCount: number;
  performanceScore: number;
  complianceScore: number;
  graduationRate: number;
  placementRate: number;
  departments: Department[];
}

export interface Department {
  id: string;
  name: string;
  institutionId: string;
  studentsCount: number;
  teachersCount: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  aparId: string;
  departmentId: string;
  institutionId: string;
  designation: string;
  experience: number;
  research: number;
  publications: number;
  trainingPrograms: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  aadhaarLast4: string;
  departmentId: string;
  institutionId: string;
  year: number;
  cgpa: number;
  attendance: number;
  scholarships: string[];
  internships: string[];
  projects: number;
  placementStatus: string;
  placementCompany?: string;
  placementPackage?: number;
  // Enhanced lifecycle tracking
  academicHistory: AcademicRecord[];
  beneficiaryHistory: BeneficiaryRecord[];
  parentIncome: number;
  caste: string;
  gender: 'Male' | 'Female' | 'Other';
  ruralBackground: boolean;
  disability: boolean;
  permanentAddress: Address;
  emergencyContact: Contact;
}

export interface AcademicRecord {
  semester: number;
  year: number;
  cgpa: number;
  backlogs: number;
  subjects: SubjectGrade[];
}

export interface SubjectGrade {
  code: string;
  name: string;
  credits: number;
  grade: string;
}

export interface BeneficiaryRecord {
  schemeId: string;
  schemeName: string;
  applicationDate: string;
  approvalDate?: string;
  status: 'Applied' | 'Approved' | 'Rejected' | 'Under Review' | 'Disbursed';
  amountReceived: number;
  disbursementDate?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  district: string;
}

export interface Contact {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

export interface Scheme {
  id: string;
  name: string;
  type: string;
  budget: number;
  beneficiaries: number;
  eligibilityCriteria: string;
  status: string;
  launchDate: string;
  // Enhanced scheme tracking
  ministry: string;
  targetBeneficiaries: number;
  applicationDeadline: string;
  disbursementSchedule: DisbursementSchedule[];
  impactMetrics: SchemeImpact;
  eligibilityDetails: EligibilityDetails;
  applicationProcess: ApplicationStep[];
  fraudPrevention: FraudCheck[];
}

export interface DisbursementSchedule {
  phase: number;
  amount: number;
  scheduledDate: string;
  actualDate?: string;
  beneficiariesCovered: number;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface SchemeImpact {
  educationalOutcome: number; // 0-100 score
  employmentRate: number;
  dropoutReduction: number;
  genderParity: number;
  ruralReach: number;
  costEfficiency: number;
  beneficiarySatisfaction: number;
}

export interface EligibilityDetails {
  minCGPA?: number;
  maxIncome?: number;
  mandatoryDocuments: string[];
  preferredCategories: string[];
  geographicRestrictions?: string[];
  ageRange?: { min: number; max: number };
}

export interface ApplicationStep {
  stepNumber: number;
  title: string;
  description: string;
  requiredDocuments: string[];
  estimatedTime: string;
}

export interface FraudCheck {
  checkType: 'Income Verification' | 'Document Authenticity' | 'Duplicate Detection';
  method: string;
  accuracy: number;
  lastUpdated: string;
}

export interface Placement {
  id: string;
  studentName: string;
  institutionName: string;
  department: string;
  company: string;
  package: number;
  date: string;
}

// Institutions
export const institutions: Institution[] = [
  {
    id: "inst1",
    name: "NIT Delhi",
    aisheCode: "AISHE001",
    location: "New Delhi",
    type: "Government",
    nirfRank: 45,
    establishedYear: 1975,
    studentsCount: 2500,
    teachersCount: 180,
    performanceScore: 92,
    complianceScore: 95,
    graduationRate: 94,
    placementRate: 88,
    departments: []
  },
  {
    id: "inst2",
    name: "Anna University",
    aisheCode: "AISHE002",
    location: "Chennai",
    type: "Government",
    nirfRank: 38,
    establishedYear: 1978,
    studentsCount: 3200,
    teachersCount: 220,
    performanceScore: 94,
    complianceScore: 93,
    graduationRate: 96,
    placementRate: 91,
    departments: []
  },
  {
    id: "inst3",
    name: "IIT Bombay",
    aisheCode: "AISHE003",
    location: "Mumbai",
    type: "Government",
    nirfRank: 3,
    establishedYear: 1958,
    studentsCount: 4500,
    teachersCount: 350,
    performanceScore: 98,
    complianceScore: 99,
    graduationRate: 99,
    placementRate: 97,
    departments: []
  },
  {
    id: "inst4",
    name: "Jadavpur University",
    aisheCode: "AISHE004",
    location: "Kolkata",
    type: "Government",
    nirfRank: 52,
    establishedYear: 1955,
    studentsCount: 2800,
    teachersCount: 195,
    performanceScore: 90,
    complianceScore: 91,
    graduationRate: 92,
    placementRate: 85,
    departments: []
  },
  {
    id: "inst5",
    name: "Christ University",
    aisheCode: "AISHE005",
    location: "Bangalore",
    type: "Private",
    nirfRank: 67,
    establishedYear: 1969,
    studentsCount: 3500,
    teachersCount: 240,
    performanceScore: 89,
    complianceScore: 88,
    graduationRate: 91,
    placementRate: 86,
    departments: []
  }
];

// Departments
export const departments: Department[] = [
  { id: "dept1", name: "Computer Science & Engineering", institutionId: "inst1", studentsCount: 500, teachersCount: 35 },
  { id: "dept2", name: "Electronics & Communication", institutionId: "inst1", studentsCount: 400, teachersCount: 30 },
  { id: "dept3", name: "Mechanical Engineering", institutionId: "inst1", studentsCount: 350, teachersCount: 28 },
  { id: "dept4", name: "Civil Engineering", institutionId: "inst1", studentsCount: 300, teachersCount: 25 },
  { id: "dept5", name: "Management Studies", institutionId: "inst1", studentsCount: 200, teachersCount: 18 },
  { id: "dept6", name: "Computer Science & Engineering", institutionId: "inst2", studentsCount: 600, teachersCount: 40 },
  { id: "dept7", name: "Electronics & Communication", institutionId: "inst2", studentsCount: 500, teachersCount: 35 },
  { id: "dept8", name: "Computer Science & Engineering", institutionId: "inst3", studentsCount: 800, teachersCount: 60 },
  { id: "dept9", name: "Mechanical Engineering", institutionId: "inst3", studentsCount: 700, teachersCount: 50 },
  { id: "dept10", name: "Computer Science & Engineering", institutionId: "inst4", studentsCount: 550, teachersCount: 38 },
];

// Teachers
export const teachers: Teacher[] = [
  {
    id: "teach1",
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@nit.ac.in",
    aparId: "APAR001",
    departmentId: "dept1",
    institutionId: "inst1",
    designation: "Professor",
    experience: 15,
    research: 12,
    publications: 45,
    trainingPrograms: 8
  },
  {
    id: "teach2",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@nit.ac.in",
    aparId: "APAR002",
    departmentId: "dept2",
    institutionId: "inst1",
    designation: "Associate Professor",
    experience: 10,
    research: 8,
    publications: 32,
    trainingPrograms: 6
  },
  {
    id: "teach3",
    name: "Dr. Amit Patel",
    email: "amit.patel@nit.ac.in",
    aparId: "APAR003",
    departmentId: "dept3",
    institutionId: "inst1",
    designation: "Assistant Professor",
    experience: 7,
    research: 5,
    publications: 18,
    trainingPrograms: 4
  },
  {
    id: "teach4",
    name: "Dr. Sneha Reddy",
    email: "sneha.reddy@nit.ac.in",
    aparId: "APAR004",
    departmentId: "dept4",
    institutionId: "inst1",
    designation: "Associate Professor",
    experience: 12,
    research: 9,
    publications: 28,
    trainingPrograms: 7
  },
  {
    id: "teach5",
    name: "Prof. Vikram Singh",
    email: "vikram.singh@nit.ac.in",
    aparId: "APAR005",
    departmentId: "dept5",
    institutionId: "inst1",
    designation: "Professor",
    experience: 18,
    research: 14,
    publications: 52,
    trainingPrograms: 10
  },
];

// Students
export const students: Student[] = [
  {
    id: "stud1",
    name: "Aarav Sharma",
    email: "aarav.sharma@student.nit.ac.in",
    aadhaarLast4: "4567",
    departmentId: "dept1",
    institutionId: "inst1",
    year: 3,
    cgpa: 8.7,
    attendance: 92,
    scholarships: ["Digital India Scholarship"],
    internships: ["Tech Corp Internship"],
    projects: 3,
    placementStatus: "Placed",
    placementCompany: "Microsoft",
    placementPackage: 28
  },
  {
    id: "stud2",
    name: "Diya Patel",
    email: "diya.patel@student.nit.ac.in",
    aadhaarLast4: "7890",
    departmentId: "dept1",
    institutionId: "inst1",
    year: 4,
    cgpa: 9.2,
    attendance: 95,
    scholarships: ["AICTE Merit Grant", "Digital India Scholarship"],
    internships: ["Google Summer Internship", "Amazon Development"],
    projects: 5,
    placementStatus: "Placed",
    placementCompany: "Google",
    placementPackage: 42
  },
  {
    id: "stud3",
    name: "Rohan Verma",
    email: "rohan.verma@student.nit.ac.in",
    aadhaarLast4: "2345",
    departmentId: "dept1",
    institutionId: "inst1",
    year: 2,
    cgpa: 7.9,
    attendance: 88,
    scholarships: ["Rural Internship Program"],
    internships: [],
    projects: 2,
    placementStatus: "Not Placed",
  },
  {
    id: "stud4",
    name: "Ananya Singh",
    email: "ananya.singh@student.nit.ac.in",
    aadhaarLast4: "6789",
    departmentId: "dept1",
    institutionId: "inst1",
    year: 3,
    cgpa: 8.4,
    attendance: 90,
    scholarships: ["AICTE Merit Grant"],
    internships: ["Startup Dev Internship"],
    projects: 4,
    placementStatus: "Placed",
    placementCompany: "Infosys",
    placementPackage: 18
  },
  {
    id: "stud5",
    name: "Ishaan Khanna",
    email: "ishaan.khanna@student.nit.ac.in",
    aadhaarLast4: "3456",
    departmentId: "dept1",
    institutionId: "inst1",
    year: 4,
    cgpa: 8.9,
    attendance: 93,
    scholarships: ["Digital India Scholarship"],
    internships: ["IBM Research"],
    projects: 6,
    placementStatus: "Placed",
    placementCompany: "Amazon",
    placementPackage: 32
  },
  {
    id: "stud6",
    name: "Sanya Gupta",
    email: "sanya.gupta@student.nit.ac.in",
    aadhaarLast4: "8901",
    departmentId: "dept2",
    institutionId: "inst1",
    year: 3,
    cgpa: 8.6,
    attendance: 91,
    scholarships: ["AICTE Merit Grant"],
    internships: ["Intel Labs"],
    projects: 3,
    placementStatus: "Placed",
    placementCompany: "Intel",
    placementPackage: 24
  },
];

// Government Schemes
export const schemes: Scheme[] = [
  {
    id: "scheme1",
    name: "Digital India Scholarship",
    type: "Merit-based",
    budget: 50000000,
    beneficiaries: 12500,
    eligibilityCriteria: "CGPA > 7.5, Annual Income < 8 LPA",
    status: "Active",
    launchDate: "2023-01-15"
  },
  {
    id: "scheme2",
    name: "AICTE Merit Grant",
    type: "Need-based",
    budget: 75000000,
    beneficiaries: 18750,
    eligibilityCriteria: "CGPA > 8.0, Technical Stream",
    status: "Active",
    launchDate: "2022-07-01"
  },
  {
    id: "scheme3",
    name: "Rural Internship Program",
    type: "Skill Development",
    budget: 30000000,
    beneficiaries: 7500,
    eligibilityCriteria: "From Rural Background, Any Stream",
    status: "Active",
    launchDate: "2023-04-10"
  },
  {
    id: "scheme4",
    name: "Women in STEM Scholarship",
    type: "Gender-based",
    budget: 40000000,
    beneficiaries: 10000,
    eligibilityCriteria: "Female Students, STEM Stream, CGPA > 7.0",
    status: "Active",
    launchDate: "2023-08-01"
  },
];

// Recent Placements
export const recentPlacements: Placement[] = [
  {
    id: "place1",
    studentName: "Diya Patel",
    institutionName: "NIT Delhi",
    department: "Computer Science",
    company: "Google",
    package: 42,
    date: "2024-12-15"
  },
  {
    id: "place2",
    studentName: "Ishaan Khanna",
    institutionName: "NIT Delhi",
    department: "Computer Science",
    company: "Amazon",
    package: 32,
    date: "2024-12-10"
  },
  {
    id: "place3",
    studentName: "Aarav Sharma",
    institutionName: "NIT Delhi",
    department: "Computer Science",
    company: "Microsoft",
    package: 28,
    date: "2024-12-08"
  },
  {
    id: "place4",
    studentName: "Sanya Gupta",
    institutionName: "NIT Delhi",
    department: "Electronics & Communication",
    company: "Intel",
    package: 24,
    date: "2024-12-05"
  },
  {
    id: "place5",
    studentName: "Ananya Singh",
    institutionName: "NIT Delhi",
    department: "Computer Science",
    company: "Infosys",
    package: 18,
    date: "2024-12-01"
  },
];

// Update institutions with departments
institutions.forEach(inst => {
  inst.departments = departments.filter(dept => dept.institutionId === inst.id);
});

// Mock credentials for demo
export const mockCredentials = {
  student: { id: "stud1", password: "student123" },
  teacher: { id: "APAR001", password: "teacher123" },
  institution: { id: "AISHE001", password: "institution123" },
  government: { id: "gov123", password: "gov123" },
  admin: { id: "admin", password: "admin123" }
};
