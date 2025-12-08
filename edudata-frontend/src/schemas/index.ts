import { z } from 'zod';

// Login form schema
export const loginSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'teacher', 'institution', 'government', 'admin'], {
    required_error: 'Please select a role',
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Student profile schema
export const studentProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  aadhaarLast4: z.string().length(4, 'Must be exactly 4 digits').regex(/^\d+$/, 'Must contain only numbers'),
  year: z.number().int().min(1).max(4),
  cgpa: z.number().min(0).max(10),
  attendance: z.number().min(0).max(100),
});

export type StudentProfileData = z.infer<typeof studentProfileSchema>;

// Teacher profile schema
export const teacherProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  aparId: z.string().min(1, 'APAR ID is required'),
  designation: z.enum(['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer']),
  experience: z.number().int().min(0),
  research: z.number().int().min(0),
  publications: z.number().int().min(0),
  trainingPrograms: z.number().int().min(0),
});

export type TeacherProfileData = z.infer<typeof teacherProfileSchema>;

// Institution profile schema
export const institutionProfileSchema = z.object({
  name: z.string().min(2, 'Institution name must be at least 2 characters'),
  aisheCode: z.string().min(1, 'AISHE code is required'),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['Government', 'Private', 'Autonomous']),
  establishedYear: z.number().int().min(1800).max(new Date().getFullYear()),
  nirfRank: z.number().int().min(1).optional(),
});

export type InstitutionProfileData = z.infer<typeof institutionProfileSchema>;

// Government scheme schema
export const schemeSchema = z.object({
  name: z.string().min(2, 'Scheme name must be at least 2 characters'),
  type: z.enum(['Merit-based', 'Need-based', 'Skill Development', 'Gender-based', 'Category-based']),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  eligibilityCriteria: z.string().min(10, 'Eligibility criteria must be at least 10 characters'),
  status: z.enum(['Active', 'Inactive', 'Draft', 'Completed']),
  launchDate: z.string().min(1, 'Launch date is required'),
});

export type SchemeData = z.infer<typeof schemeSchema>;

// Placement record schema
export const placementSchema = z.object({
  studentName: z.string().min(2, 'Student name is required'),
  institutionName: z.string().min(2, 'Institution name is required'),
  department: z.string().min(2, 'Department is required'),
  company: z.string().min(2, 'Company name is required'),
  package: z.number().min(0, 'Package must be a positive number'),
  date: z.string().min(1, 'Placement date is required'),
});

export type PlacementData = z.infer<typeof placementSchema>;

// Search filters schema
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  institutionType: z.enum(['All', 'Government', 'Private', 'Autonomous']).optional(),
  location: z.string().optional(),
  nirfRank: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  placementRate: z.object({
    min: z.number().min(0).max(100).optional(),
    max: z.number().min(0).max(100).optional(),
  }).optional(),
});

export type SearchFiltersData = z.infer<typeof searchFiltersSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  userType: z.enum(['student', 'teacher', 'institution', 'government', 'other']),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
  type: z.enum(['document', 'image', 'report', 'certificate']),
  description: z.string().optional(),
});

export type FileUploadData = z.infer<typeof fileUploadSchema>;

// Report generation schema
export const reportGenerationSchema = z.object({
  reportType: z.enum(['institutional', 'national', 'placement', 'scheme', 'financial']),
  dateRange: z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  }),
  format: z.enum(['pdf', 'excel', 'csv']),
  filters: z.object({
    institutionIds: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
  }).optional(),
});

export type ReportGenerationData = z.infer<typeof reportGenerationSchema>;