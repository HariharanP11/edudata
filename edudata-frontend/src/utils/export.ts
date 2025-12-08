import { Student, Teacher, Institution, Scheme, Placement } from '@/data/mockData';

// CSV Export Functions
export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle arrays and objects
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        } else if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return `"${String(value).replace(/"/g, '""')}"`;
        }
      }).join(',')
    )
  ].join('\n');
  
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

// JSON Export
export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

// Excel-compatible CSV Export
export const exportToExcel = (data: any[], filename: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    // Add BOM for UTF-8 Excel compatibility
    '\ufeff' + headers.join('\t'),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (Array.isArray(value)) {
          return value.join('; ');
        } else if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        } else {
          return String(value);
        }
      }).join('\t')
    )
  ].join('\n');
  
  downloadFile(csvContent, `${filename}.xls`, 'application/vnd.ms-excel');
};

// Helper function to trigger download
const downloadFile = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Specific Export Functions for Different Data Types

export const exportStudentData = (students: Student[], format: 'csv' | 'excel' | 'json' = 'csv') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `students_export_${timestamp}`;
  
  // Flatten data for better CSV format
  const flattenedData = students.map(student => ({
    ...student,
    scholarships: student.scholarships.join('; '),
    internships: student.internships.join('; '),
    placementInfo: student.placementStatus === 'Placed' 
      ? `${student.placementCompany} - ₹${student.placementPackage}L`
      : student.placementStatus
  }));
  
  switch (format) {
    case 'excel':
      exportToExcel(flattenedData, filename);
      break;
    case 'json':
      exportToJSON(students, filename);
      break;
    default:
      exportToCSV(flattenedData, filename);
  }
};

export const exportTeacherData = (teachers: Teacher[], format: 'csv' | 'excel' | 'json' = 'csv') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `teachers_export_${timestamp}`;
  
  switch (format) {
    case 'excel':
      exportToExcel(teachers, filename);
      break;
    case 'json':
      exportToJSON(teachers, filename);
      break;
    default:
      exportToCSV(teachers, filename);
  }
};

export const exportInstitutionData = (institutions: Institution[], format: 'csv' | 'excel' | 'json' = 'csv') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `institutions_export_${timestamp}`;
  
  // Flatten departments data
  const flattenedData = institutions.map(inst => ({
    ...inst,
    departmentCount: inst.departments.length,
    departmentNames: inst.departments.map(d => d.name).join('; '),
    departments: undefined // Remove nested array for CSV
  }));
  
  switch (format) {
    case 'excel':
      exportToExcel(flattenedData, filename);
      break;
    case 'json':
      exportToJSON(institutions, filename);
      break;
    default:
      exportToCSV(flattenedData, filename);
  }
};

export const exportSchemeData = (schemes: Scheme[], format: 'csv' | 'excel' | 'json' = 'csv') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `schemes_export_${timestamp}`;
  
  // Add calculated fields
  const enrichedData = schemes.map(scheme => ({
    ...scheme,
    budgetInCrores: (scheme.budget / 10000000).toFixed(2),
    utilizationRate: ((scheme.beneficiaries / (scheme.budget / 4000)) * 100).toFixed(1),
    avgBenefitPerPerson: (scheme.budget / scheme.beneficiaries).toFixed(0)
  }));
  
  switch (format) {
    case 'excel':
      exportToExcel(enrichedData, filename);
      break;
    case 'json':
      exportToJSON(schemes, filename);
      break;
    default:
      exportToCSV(enrichedData, filename);
  }
};

export const exportPlacementData = (placements: Placement[], format: 'csv' | 'excel' | 'json' = 'csv') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `placements_export_${timestamp}`;
  
  switch (format) {
    case 'excel':
      exportToExcel(placements, filename);
      break;
    case 'json':
      exportToJSON(placements, filename);
      break;
    default:
      exportToCSV(placements, filename);
  }
};

// Combined Report Export
export const exportCompleteReport = (format: 'csv' | 'excel' | 'json' = 'json') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `edudata_complete_report_${timestamp}`;
  
  // This would typically fetch from API, using mock data for demo
  const reportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      reportType: 'Complete EduData Platform Report',
      version: '1.0'
    },
    summary: {
      totalInstitutions: 5,
      totalStudents: 12500,
      totalTeachers: 1850,
      totalSchemes: 4,
      totalPlacements: 5
    },
    // Add your actual data here
    // institutions: institutions,
    // students: students,
    // teachers: teachers,
    // schemes: schemes,
    // placements: recentPlacements
  };
  
  switch (format) {
    case 'csv':
      // For CSV, export summary only as main CSV doesn't handle nested well
      exportToCSV([reportData.summary], filename + '_summary');
      break;
    case 'excel':
      exportToExcel([reportData.summary], filename + '_summary');
      break;
    default:
      exportToJSON(reportData, filename);
  }
};

// Generate Report based on user role and permissions
export const generateRoleBasedReport = (
  role: string,
  data: any,
  format: 'csv' | 'excel' | 'json' = 'csv'
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (role) {
    case 'student':
      // Students can export their own data
      exportToJSON(data, `my_academic_record_${timestamp}`);
      break;
      
    case 'teacher':
      // Teachers can export their department data
      if (data.students) exportStudentData(data.students, format);
      break;
      
    case 'institution':
      // Institutions can export their complete data
      const instData = {
        institutionInfo: data.institution,
        students: data.students,
        teachers: data.teachers,
        performance: data.metrics
      };
      exportToJSON(instData, `institution_report_${timestamp}`);
      break;
      
    case 'government':
    case 'admin':
      // Government and admin can export everything
      exportCompleteReport(format);
      break;
      
    default:
      console.warn('Unknown role for report generation');
  }
};