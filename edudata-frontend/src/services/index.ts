import { apiService } from './api';
import { Student, Teacher, Institution, Scheme, Placement } from '@/data/mockData';

// Authentication Services
export const authService = {
  login: (credentials: { id: string; password: string; role: string }) =>
    apiService.post('/auth/login', credentials),
  logout: () => apiService.post('/auth/logout'),
  refresh: () => apiService.post('/auth/refresh'),
  validateToken: () => apiService.get('/auth/validate'),
};

// Student Services
export const studentService = {
  getProfile: (id: string) => apiService.get<Student>(`/students/${id}`),
  updateProfile: (id: string, data: Partial<Student>) => 
    apiService.put<Student>(`/students/${id}`, data),
  getAcademicProgress: (id: string) => apiService.get(`/students/${id}/progress`),
  getScholarships: (id: string) => apiService.get(`/students/${id}/scholarships`),
  applyForScheme: (studentId: string, schemeId: string) => 
    apiService.post(`/students/${studentId}/schemes/${schemeId}/apply`),
};

// Teacher Services
export const teacherService = {
  getProfile: (id: string) => apiService.get<Teacher>(`/teachers/${id}`),
  updateProfile: (id: string, data: Partial<Teacher>) => 
    apiService.put<Teacher>(`/teachers/${id}`, data),
  getStudents: (teacherId: string) => apiService.get(`/teachers/${teacherId}/students`),
  submitGrades: (teacherId: string, grades: any[]) => 
    apiService.post(`/teachers/${teacherId}/grades`, { grades }),
  getTrainingPrograms: (teacherId: string) => apiService.get(`/teachers/${teacherId}/training`),
};

// Institution Services
export const institutionService = {
  getProfile: (id: string) => apiService.get<Institution>(`/institutions/${id}`),
  updateProfile: (id: string, data: Partial<Institution>) => 
    apiService.put<Institution>(`/institutions/${id}`, data),
  getStudents: (institutionId: string, page = 1, limit = 10) => 
    apiService.get(`/institutions/${institutionId}/students?page=${page}&limit=${limit}`),
  getTeachers: (institutionId: string, page = 1, limit = 10) => 
    apiService.get(`/institutions/${institutionId}/teachers?page=${page}&limit=${limit}`),
  getPerformanceMetrics: (institutionId: string) => 
    apiService.get(`/institutions/${institutionId}/metrics`),
  getPlacements: (institutionId: string) => 
    apiService.get(`/institutions/${institutionId}/placements`),
};

// Government Services
export const governmentService = {
  getAllInstitutions: (page = 1, limit = 10) => 
    apiService.get(`/government/institutions?page=${page}&limit=${limit}`),
  getSchemes: () => apiService.get<Scheme[]>('/government/schemes'),
  createScheme: (scheme: Omit<Scheme, 'id'>) => 
    apiService.post<Scheme>('/government/schemes', scheme),
  updateScheme: (id: string, data: Partial<Scheme>) => 
    apiService.put<Scheme>(`/government/schemes/${id}`, data),
  getNationalStatistics: () => apiService.get('/government/statistics'),
  generateReports: (params: any) => apiService.post('/government/reports', params),
};

// Placement Services
export const placementService = {
  getRecentPlacements: (limit = 10) => 
    apiService.get<Placement[]>(`/placements/recent?limit=${limit}`),
  getPlacementStats: () => apiService.get('/placements/statistics'),
  addPlacement: (placement: Omit<Placement, 'id'>) => 
    apiService.post<Placement>('/placements', placement),
  updatePlacement: (id: string, data: Partial<Placement>) => 
    apiService.put<Placement>(`/placements/${id}`, data),
};

// Search Services
export const searchService = {
  searchInstitutions: (query: string, filters?: any) => 
    apiService.get(`/search/institutions?q=${encodeURIComponent(query)}`, { params: filters }),
  searchStudents: (query: string, filters?: any) => 
    apiService.get(`/search/students?q=${encodeURIComponent(query)}`, { params: filters }),
  searchTeachers: (query: string, filters?: any) => 
    apiService.get(`/search/teachers?q=${encodeURIComponent(query)}`, { params: filters }),
  searchSchemes: (query: string, filters?: any) => 
    apiService.get(`/search/schemes?q=${encodeURIComponent(query)}`, { params: filters }),
};

// File Services
export const fileService = {
  uploadDocument: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return apiService.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadDocument: (fileId: string) => apiService.get(`/files/download/${fileId}`),
  deleteDocument: (fileId: string) => apiService.delete(`/files/${fileId}`),
};