// Security and Compliance Framework for EduData Platform
// Implements data privacy, audit logging, and security best practices

import CryptoJS from 'crypto-js';

// Data Privacy and GDPR Compliance
export class DataPrivacyManager {
  private static instance: DataPrivacyManager;
  
  static getInstance(): DataPrivacyManager {
    if (!DataPrivacyManager.instance) {
      DataPrivacyManager.instance = new DataPrivacyManager();
    }
    return DataPrivacyManager.instance;
  }

  // Data Classification and Masking
  classifyAndMaskData(data: any, userRole: string, dataOwner?: string): any {
    const classifications = this.classifyDataElements(data);
    return this.maskBasedOnRole(data, classifications, userRole, dataOwner);
  }

  private classifyDataElements(data: any): DataClassification {
    const classification: DataClassification = {
      publicData: [],
      restrictedData: [],
      confidentialData: [],
      piiData: []
    };

    for (const [key, value] of Object.entries(data)) {
      if (this.isPII(key)) {
        classification.piiData.push(key);
      } else if (this.isConfidential(key)) {
        classification.confidentialData.push(key);
      } else if (this.isRestricted(key)) {
        classification.restrictedData.push(key);
      } else {
        classification.publicData.push(key);
      }
    }

    return classification;
  }

  private maskBasedOnRole(data: any, classification: DataClassification, userRole: string, dataOwner?: string): any {
    const maskedData = { ...data };
    const permissions = this.getRolePermissions(userRole);

    // Mask PII data
    if (!permissions.canViewPII && !this.isDataOwner(dataOwner, userRole)) {
      classification.piiData.forEach(field => {
        maskedData[field] = this.maskPII(maskedData[field], field);
      });
    }

    // Mask confidential data
    if (!permissions.canViewConfidential) {
      classification.confidentialData.forEach(field => {
        maskedData[field] = '[CONFIDENTIAL]';
      });
    }

    // Mask restricted data
    if (!permissions.canViewRestricted) {
      classification.restrictedData.forEach(field => {
        maskedData[field] = '[RESTRICTED]';
      });
    }

    return maskedData;
  }

  private isPII(fieldName: string): boolean {
    const piiFields = ['aadhaar', 'email', 'phone', 'address', 'bankAccount', 'parentIncome'];
    return piiFields.some(pii => fieldName.toLowerCase().includes(pii.toLowerCase()));
  }

  private isConfidential(fieldName: string): boolean {
    const confidentialFields = ['salary', 'familyIncome', 'medicalRecords', 'disciplinaryActions'];
    return confidentialFields.some(conf => fieldName.toLowerCase().includes(conf.toLowerCase()));
  }

  private isRestricted(fieldName: string): boolean {
    const restrictedFields = ['internalNotes', 'assessmentScores', 'verificationStatus'];
    return restrictedFields.some(restr => fieldName.toLowerCase().includes(restr.toLowerCase()));
  }

  private maskPII(value: any, fieldType: string): string {
    if (!value) return value;
    
    switch (fieldType.toLowerCase()) {
      case 'aadhaar':
      case 'aadhaarLast4':
        return `XXXX-${value.toString().slice(-4)}`;
      case 'email':
        const [username, domain] = value.split('@');
        return `${username.slice(0, 2)}***@${domain}`;
      case 'phone':
        return `***-***-${value.toString().slice(-4)}`;
      case 'parentIncome':
        return '[MASKED]';
      default:
        return '***MASKED***';
    }
  }

  private getRolePermissions(role: string): RolePermissions {
    const permissionMatrix: { [key: string]: RolePermissions } = {
      'student': {
        canViewPII: true, // Only their own data
        canViewConfidential: false,
        canViewRestricted: false,
        canExportData: true,
        canModifyData: false
      },
      'teacher': {
        canViewPII: false, // Masked PII for students
        canViewConfidential: false,
        canViewRestricted: true,
        canExportData: true,
        canModifyData: true
      },
      'institution': {
        canViewPII: false,
        canViewConfidential: true,
        canViewRestricted: true,
        canExportData: true,
        canModifyData: true
      },
      'government': {
        canViewPII: false, // Aggregate data only
        canViewConfidential: true,
        canViewRestricted: true,
        canExportData: true,
        canModifyData: false
      },
      'admin': {
        canViewPII: true,
        canViewConfidential: true,
        canViewRestricted: true,
        canExportData: true,
        canModifyData: true
      }
    };

    return permissionMatrix[role] || permissionMatrix['student'];
  }

  private isDataOwner(dataOwner: string | undefined, userRole: string): boolean {
    return dataOwner === userRole;
  }

  // Consent Management
  recordConsent(userId: string, dataTypes: string[], purpose: string): ConsentRecord {
    const consent: ConsentRecord = {
      id: this.generateConsentId(),
      userId,
      dataTypes,
      purpose,
      timestamp: new Date().toISOString(),
      status: 'active',
      expiryDate: this.calculateExpiryDate(),
      version: '1.0'
    };

    // Store consent record
    this.storeConsent(consent);
    
    // Log consent for audit
    auditLogger.logDataAccess({
      action: 'CONSENT_RECORDED',
      userId,
      resource: 'consent_management',
      details: { dataTypes, purpose },
      timestamp: new Date().toISOString()
    });

    return consent;
  }

  checkConsent(userId: string, dataTypes: string[], purpose: string): boolean {
    const userConsents = this.getUserConsents(userId);
    return userConsents.some(consent => 
      consent.status === 'active' &&
      dataTypes.every(type => consent.dataTypes.includes(type)) &&
      consent.purpose === purpose &&
      new Date(consent.expiryDate) > new Date()
    );
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateExpiryDate(): string {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // 1 year from now
    return expiry.toISOString();
  }

  private storeConsent(consent: ConsentRecord): void {
    // In production, store in secure database
    const existingConsents = JSON.parse(localStorage.getItem('user_consents') || '[]');
    existingConsents.push(consent);
    localStorage.setItem('user_consents', JSON.stringify(existingConsents));
  }

  private getUserConsents(userId: string): ConsentRecord[] {
    const allConsents = JSON.parse(localStorage.getItem('user_consents') || '[]');
    return allConsents.filter((consent: ConsentRecord) => consent.userId === userId);
  }
}

// Audit Logging System
export class AuditLogger {
  private static instance: AuditLogger;
  private logBuffer: AuditLogEntry[] = [];
  private batchSize = 100;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  logDataAccess(entry: Omit<AuditLogEntry, 'id' | 'severity'>): void {
    const auditEntry: AuditLogEntry = {
      id: this.generateLogId(),
      ...entry,
      severity: this.calculateSeverity(entry.action),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };

    this.addToBuffer(auditEntry);
    this.logToConsole(auditEntry);
  }

  logSecurityEvent(event: SecurityEvent): void {
    const auditEntry: AuditLogEntry = {
      id: this.generateLogId(),
      action: `SECURITY_${event.type}`,
      userId: event.userId,
      resource: event.resource,
      details: event.details,
      timestamp: new Date().toISOString(),
      severity: 'high',
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };

    this.addToBuffer(auditEntry);
    this.logToConsole(auditEntry);

    // Immediate alert for high-severity events
    if (event.type === 'UNAUTHORIZED_ACCESS' || event.type === 'DATA_BREACH') {
      this.sendSecurityAlert(auditEntry);
    }
  }

  private addToBuffer(entry: AuditLogEntry): void {
    this.logBuffer.push(entry);
    
    if (this.logBuffer.length >= this.batchSize) {
      this.flushBuffer();
    }
  }

  private flushBuffer(): void {
    if (this.logBuffer.length === 0) return;

    // In production, send to centralized logging service
    this.sendToLoggingService(this.logBuffer);
    this.storeLocally(this.logBuffer);
    
    this.logBuffer = [];
  }

  private sendToLoggingService(logs: AuditLogEntry[]): void {
    // Mock implementation - in production, send to ELK stack, Splunk, etc.
    console.log('Sending to logging service:', logs.length, 'entries');
  }

  private storeLocally(logs: AuditLogEntry[]): void {
    const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const updatedLogs = [...existingLogs, ...logs];
    
    // Keep only last 1000 entries locally
    const trimmedLogs = updatedLogs.slice(-1000);
    localStorage.setItem('audit_logs', JSON.stringify(trimmedLogs));
  }

  private logToConsole(entry: AuditLogEntry): void {
    const logLevel = entry.severity === 'high' ? 'warn' : 'info';
    console[logLevel]('AUDIT:', entry);
  }

  private generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSeverity(action: string): 'low' | 'medium' | 'high' {
    const highSeverityActions = ['LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'DATA_EXPORT', 'DATA_MODIFICATION'];
    const mediumSeverityActions = ['DATA_ACCESS', 'REPORT_GENERATION', 'USER_CREATION'];
    
    if (highSeverityActions.some(a => action.includes(a))) return 'high';
    if (mediumSeverityActions.some(a => action.includes(a))) return 'medium';
    return 'low';
  }

  private getClientIP(): string {
    // In production, get from server headers
    return 'MOCK_IP';
  }

  private getSessionId(): string {
    return localStorage.getItem('sessionId') || 'UNKNOWN_SESSION';
  }

  private sendSecurityAlert(entry: AuditLogEntry): void {
    // Mock implementation - in production, integrate with security team alerts
    console.error('SECURITY ALERT:', entry);
  }

  // Audit Report Generation
  generateAuditReport(filters: AuditReportFilters): AuditReport {
    const logs = this.getFilteredLogs(filters);
    
    return {
      summary: this.generateSummary(logs),
      timeline: this.generateTimeline(logs),
      userActivity: this.generateUserActivity(logs),
      securityEvents: this.getSecurityEvents(logs),
      complianceStatus: this.assessCompliance(logs)
    };
  }

  private getFilteredLogs(filters: AuditReportFilters): AuditLogEntry[] {
    const allLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    
    return allLogs.filter((log: AuditLogEntry) => {
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.actions && !filters.actions.includes(log.action)) return false;
      if (filters.severity && log.severity !== filters.severity) return false;
      
      return true;
    });
  }

  private generateSummary(logs: AuditLogEntry[]): AuditSummary {
    const summary: AuditSummary = {
      totalEvents: logs.length,
      highSeverityEvents: logs.filter(l => l.severity === 'high').length,
      mediumSeverityEvents: logs.filter(l => l.severity === 'medium').length,
      lowSeverityEvents: logs.filter(l => l.severity === 'low').length,
      uniqueUsers: new Set(logs.map(l => l.userId).filter(Boolean)).size,
      timeRange: {
        start: logs.length > 0 ? logs[0].timestamp : '',
        end: logs.length > 0 ? logs[logs.length - 1].timestamp : ''
      }
    };

    return summary;
  }

  private generateTimeline(logs: AuditLogEntry[]): TimelineEntry[] {
    // Group logs by hour for timeline visualization
    const timeline: { [key: string]: number } = {};
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
      timeline[hour] = (timeline[hour] || 0) + 1;
    });

    return Object.entries(timeline).map(([timestamp, count]) => ({
      timestamp,
      eventCount: count
    }));
  }

  private generateUserActivity(logs: AuditLogEntry[]): UserActivitySummary[] {
    const userActivity: { [key: string]: UserActivitySummary } = {};

    logs.forEach(log => {
      if (!log.userId) return;
      
      if (!userActivity[log.userId]) {
        userActivity[log.userId] = {
          userId: log.userId,
          totalActions: 0,
          lastActivity: log.timestamp,
          actionBreakdown: {}
        };
      }

      userActivity[log.userId].totalActions++;
      userActivity[log.userId].actionBreakdown[log.action] = 
        (userActivity[log.userId].actionBreakdown[log.action] || 0) + 1;
      
      if (new Date(log.timestamp) > new Date(userActivity[log.userId].lastActivity)) {
        userActivity[log.userId].lastActivity = log.timestamp;
      }
    });

    return Object.values(userActivity);
  }

  private getSecurityEvents(logs: AuditLogEntry[]): AuditLogEntry[] {
    return logs.filter(log => log.action.startsWith('SECURITY_') || log.severity === 'high');
  }

  private assessCompliance(logs: AuditLogEntry[]): ComplianceStatus {
    const dataAccessLogs = logs.filter(log => log.action.includes('DATA_ACCESS'));
    const exportLogs = logs.filter(log => log.action.includes('EXPORT'));
    
    return {
      gdprCompliant: this.checkGDPRCompliance(dataAccessLogs),
      auditTrailComplete: logs.length > 0,
      dataRetentionCompliant: this.checkDataRetention(logs),
      accessControlCompliant: this.checkAccessControl(logs)
    };
  }

  private checkGDPRCompliance(logs: AuditLogEntry[]): boolean {
    // Check if all data access has proper consent records
    return logs.every(log => this.hasValidConsent(log.userId, log.timestamp));
  }

  private checkDataRetention(logs: AuditLogEntry[]): boolean {
    // Check if logs are within retention period
    const retentionPeriod = 365 * 24 * 60 * 60 * 1000; // 1 year
    const cutoffDate = Date.now() - retentionPeriod;
    
    return logs.every(log => new Date(log.timestamp).getTime() > cutoffDate);
  }

  private checkAccessControl(logs: AuditLogEntry[]): boolean {
    // Check for unauthorized access attempts
    const unauthorizedAttempts = logs.filter(log => 
      log.action.includes('UNAUTHORIZED') || log.action.includes('FAILED')
    );
    
    return unauthorizedAttempts.length < logs.length * 0.05; // Less than 5% failure rate
  }

  private hasValidConsent(userId: string | undefined, timestamp: string): boolean {
    if (!userId) return true; // System actions don't require consent
    
    const privacyManager = DataPrivacyManager.getInstance();
    return privacyManager.checkConsent(userId, ['basic_data'], 'platform_access');
  }
}

// Data Encryption Service
export class EncryptionService {
  private static instance: EncryptionService;
  private secretKey = process.env.REACT_APP_ENCRYPTION_KEY || 'default-secret-key';

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  encryptSensitiveData(data: any): string {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.secretKey).toString();
  }

  decryptSensitiveData(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  }

  hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  generateSecureToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }
}

// Export singleton instances
export const dataPrivacyManager = DataPrivacyManager.getInstance();
export const auditLogger = AuditLogger.getInstance();
export const encryptionService = EncryptionService.getInstance();

// Type Definitions
interface DataClassification {
  publicData: string[];
  restrictedData: string[];
  confidentialData: string[];
  piiData: string[];
}

interface RolePermissions {
  canViewPII: boolean;
  canViewConfidential: boolean;
  canViewRestricted: boolean;
  canExportData: boolean;
  canModifyData: boolean;
}

interface ConsentRecord {
  id: string;
  userId: string;
  dataTypes: string[];
  purpose: string;
  timestamp: string;
  status: 'active' | 'revoked' | 'expired';
  expiryDate: string;
  version: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  userId?: string;
  resource: string;
  details: any;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

interface SecurityEvent {
  type: 'UNAUTHORIZED_ACCESS' | 'DATA_BREACH' | 'LOGIN_ANOMALY' | 'SUSPICIOUS_ACTIVITY';
  userId?: string;
  resource: string;
  details: any;
}

interface AuditReportFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  actions?: string[];
  severity?: 'low' | 'medium' | 'high';
}

interface AuditReport {
  summary: AuditSummary;
  timeline: TimelineEntry[];
  userActivity: UserActivitySummary[];
  securityEvents: AuditLogEntry[];
  complianceStatus: ComplianceStatus;
}

interface AuditSummary {
  totalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
  uniqueUsers: number;
  timeRange: {
    start: string;
    end: string;
  };
}

interface TimelineEntry {
  timestamp: string;
  eventCount: number;
}

interface UserActivitySummary {
  userId: string;
  totalActions: number;
  lastActivity: string;
  actionBreakdown: { [action: string]: number };
}

interface ComplianceStatus {
  gdprCompliant: boolean;
  auditTrailComplete: boolean;
  dataRetentionCompliant: boolean;
  accessControlCompliant: boolean;
}