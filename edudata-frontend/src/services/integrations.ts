// External API Integration Service for EduData Platform
// Integrates with existing education portals and government databases

import { apiService } from './api';

// External Portal Integration Endpoints
export const EXTERNAL_APIS = {
  NAD: 'https://nad.gov.in/api/v1', // National Academic Depository
  AISHE: 'https://aishe.gov.in/api/v1', // All India Survey on Higher Education  
  UGC: 'https://ugc.gov.in/api/v1', // University Grants Commission
  NIRF: 'https://nirfindia.org/api/v1', // National Institutional Ranking Framework
  DIGILOCKER: 'https://api.digilocker.gov.in/v1', // DigiLocker for certificates
  PFMS: 'https://pfms.nic.in/api/v1', // Public Financial Management System
  AADHAAR: 'https://uidai.gov.in/api/v1', // Aadhaar verification
  SCHOLARSHIP_PORTAL: 'https://scholarships.gov.in/api/v1'
};

// DigiLocker Integration for Document Verification
export class DigiLockerService {
  private static instance: DigiLockerService;
  
  static getInstance() {
    if (!DigiLockerService.instance) {
      DigiLockerService.instance = new DigiLockerService();
    }
    return DigiLockerService.instance;
  }

  async verifyDocument(documentId: string, studentId: string) {
    try {
      const response = await apiService.post('/verify-document', {
        documentId,
        studentId,
        source: 'digilocker'
      });
      return response.data;
    } catch (error) {
      console.error('Document verification failed:', error);
      return { verified: false, error: 'Verification failed' };
    }
  }

  async fetchAcademicRecords(studentId: string) {
    try {
      const response = await apiService.get(`/external/digilocker/academic-records/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch academic records:', error);
      return null;
    }
  }
}

// AISHE Data Integration Service
export class AISHEService {
  async syncInstitutionData(aisheCode: string) {
    try {
      const response = await apiService.get(`/external/aishe/institution/${aisheCode}`);
      return response.data;
    } catch (error) {
      console.error('AISHE sync failed:', error);
      return null;
    }
  }

  async validateAISHECode(code: string): Promise<boolean> {
    try {
      const response = await apiService.get(`/external/aishe/validate/${code}`);
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }
}

// NIRF Ranking Integration
export class NIRFService {
  async fetchRankingData(institutionId: string) {
    try {
      const response = await apiService.get(`/external/nirf/ranking/${institutionId}`);
      return response.data;
    } catch (error) {
      console.error('NIRF ranking fetch failed:', error);
      return null;
    }
  }

  async updateInstitutionalMetrics(institutionId: string, metrics: any) {
    try {
      const response = await apiService.post(`/external/nirf/metrics/${institutionId}`, metrics);
      return response.data;
    } catch (error) {
      console.error('NIRF metrics update failed:', error);
      return null;
    }
  }
}

// Scholarship Portal Integration
export class ScholarshipService {
  async checkEligibility(studentData: any, schemeId: string) {
    try {
      const response = await apiService.post('/external/scholarship/eligibility-check', {
        student: studentData,
        schemeId
      });
      return response.data;
    } catch (error) {
      console.error('Eligibility check failed:', error);
      return { eligible: false, error: 'Check failed' };
    }
  }

  async submitApplication(applicationData: any) {
    try {
      const response = await apiService.post('/external/scholarship/apply', applicationData);
      return response.data;
    } catch (error) {
      console.error('Application submission failed:', error);
      return { success: false, error: 'Submission failed' };
    }
  }

  async trackApplicationStatus(applicationId: string) {
    try {
      const response = await apiService.get(`/external/scholarship/status/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Status tracking failed:', error);
      return null;
    }
  }
}

// PFMS Integration for Financial Tracking
export class PFMSService {
  async trackDisbursement(beneficiaryId: string, schemeId: string) {
    try {
      const response = await apiService.get(`/external/pfms/disbursement/${beneficiaryId}/${schemeId}`);
      return response.data;
    } catch (error) {
      console.error('PFMS tracking failed:', error);
      return null;
    }
  }

  async verifyBankAccount(accountDetails: any) {
    try {
      const response = await apiService.post('/external/pfms/verify-account', accountDetails);
      return response.data;
    } catch (error) {
      console.error('Bank account verification failed:', error);
      return { verified: false, error: 'Verification failed' };
    }
  }
}

// Aadhaar Verification Service
export class AadhaarService {
  async verifyAadhaar(aadhaarNumber: string, otp: string) {
    try {
      const response = await apiService.post('/external/aadhaar/verify', {
        aadhaar: aadhaarNumber,
        otp
      });
      return response.data;
    } catch (error) {
      console.error('Aadhaar verification failed:', error);
      return { verified: false, error: 'Verification failed' };
    }
  }

  async fetchAadhaarDetails(aadhaarNumber: string) {
    try {
      // Note: This would only fetch allowed demographic info, not full details
      const response = await apiService.post('/external/aadhaar/demographics', {
        aadhaar: aadhaarNumber
      });
      return response.data;
    } catch (error) {
      console.error('Aadhaar details fetch failed:', error);
      return null;
    }
  }
}

// Unified Integration Manager
export class IntegrationManager {
  private digiLocker: DigiLockerService;
  private aishe: AISHEService;
  private nirf: NIRFService;
  private scholarship: ScholarshipService;
  private pfms: PFMSService;
  private aadhaar: AadhaarService;

  constructor() {
    this.digiLocker = DigiLockerService.getInstance();
    this.aishe = new AISHEService();
    this.nirf = new NIRFService();
    this.scholarship = new ScholarshipService();
    this.pfms = new PFMSService();
    this.aadhaar = new AadhaarService();
  }

  // Complete student data sync from multiple sources
  async syncStudentData(studentId: string, aadhaarNumber?: string) {
    const syncResults = {
      academicRecords: null,
      verification: null,
      scholarshipStatus: null,
      disbursements: null
    };

    try {
      // Parallel data fetching
      const promises = [
        this.digiLocker.fetchAcademicRecords(studentId),
        aadhaarNumber ? this.aadhaar.fetchAadhaarDetails(aadhaarNumber) : null,
        this.scholarship.trackApplicationStatus(studentId),
        this.pfms.trackDisbursement(studentId, 'all-schemes')
      ];

      const results = await Promise.allSettled(promises);
      
      syncResults.academicRecords = results[0].status === 'fulfilled' ? results[0].value : null;
      syncResults.verification = results[1].status === 'fulfilled' ? results[1].value : null;
      syncResults.scholarshipStatus = results[2].status === 'fulfilled' ? results[2].value : null;
      syncResults.disbursements = results[3].status === 'fulfilled' ? results[3].value : null;

      return syncResults;
    } catch (error) {
      console.error('Student data sync failed:', error);
      return syncResults;
    }
  }

  // Real-time scheme eligibility check across multiple portals
  async comprehensiveEligibilityCheck(studentData: any) {
    try {
      // Check eligibility across multiple schemes and portals
      const eligibilityChecks = await Promise.allSettled([
        this.scholarship.checkEligibility(studentData, 'digital-india'),
        this.scholarship.checkEligibility(studentData, 'merit-scholarship'),
        this.scholarship.checkEligibility(studentData, 'minority-scholarship'),
        // Add more scheme checks as needed
      ]);

      const eligibleSchemes = eligibilityChecks
        .filter(result => result.status === 'fulfilled' && result.value?.eligible)
        .map(result => result.status === 'fulfilled' ? result.value : null);

      return eligibleSchemes;
    } catch (error) {
      console.error('Comprehensive eligibility check failed:', error);
      return [];
    }
  }
}

// Export singleton instance
export const integrationManager = new IntegrationManager();

// Utility functions for data synchronization
export const syncUtilities = {
  // Schedule regular data sync
  scheduleDataSync: (interval: number = 3600000) => { // 1 hour default
    setInterval(async () => {
      try {
        // Sync critical data periodically
        await integrationManager.syncStudentData('batch-sync');
        console.log('Scheduled data sync completed');
      } catch (error) {
        console.error('Scheduled sync failed:', error);
      }
    }, interval);
  },

  // Handle API rate limiting
  rateLimitedRequest: async (apiCall: Function, maxRetries: number = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error: any) {
        if (error.response?.status === 429 && attempt < maxRetries) {
          // Wait with exponential backoff
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw error;
      }
    }
  }
};