// Real-time Performance Analytics System
// Live streaming analytics with WebSocket connections for instant data updates

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  unit: string;
  category: 'academic' | 'financial' | 'operational' | 'engagement';
}

interface StreamingData {
  type: 'metric_update' | 'alert' | 'event' | 'notification';
  payload: any;
  timestamp: string;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface DashboardConfig {
  userId: string;
  role: 'student' | 'teacher' | 'institution' | 'government' | 'admin';
  widgets: DashboardWidget[];
  refreshRate: number; // milliseconds
  filters: DataFilter[];
  notifications: NotificationSettings;
}

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'gauge' | 'alert';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  dataSource: string;
  config: WidgetConfig;
  isVisible: boolean;
}

interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d';
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  filters?: { [key: string]: any };
  threshold?: { warning: number; critical: number };
}

interface DataFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  thresholds: { [metricId: string]: number };
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  metric: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  recipients: string[];
  enabled: boolean;
}

interface RealTimeEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  source: string;
  affectedEntities: string[];
  metadata: { [key: string]: any };
}

export class RealTimeAnalytics {
  private static instance: RealTimeAnalytics;
  private websocket: WebSocket | null = null;
  private metrics: Map<string, RealTimeMetric> = new Map();
  private subscribers: Map<string, Set<Function>> = new Map();
  private dashboardConfigs: Map<string, DashboardConfig> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private eventStream: RealTimeEvent[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  static getInstance(): RealTimeAnalytics {
    if (!RealTimeAnalytics.instance) {
      RealTimeAnalytics.instance = new RealTimeAnalytics();
    }
    return RealTimeAnalytics.instance;
  }

  constructor() {
    this.initializeWebSocket();
    this.setupMockDataStream();
    this.initializeDefaultMetrics();
    this.setupAlertRules();
  }

  // Initialize WebSocket connection
  private initializeWebSocket(): void {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';
    
    try {
      this.websocket = new WebSocket(wsUrl);
      this.setupWebSocketEventHandlers();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.fallbackToPolling();
    }
  }

  // Setup WebSocket event handlers
  private setupWebSocketEventHandlers(): void {
    if (!this.websocket) return;

    this.websocket.onopen = () => {
      console.log('🔗 WebSocket connected for real-time analytics');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.sendAuth();
    };

    this.websocket.onmessage = (event) => {
      try {
        const data: StreamingData = JSON.parse(event.data);
        this.handleIncomingData(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.websocket.onclose = () => {
      console.log('🔌 WebSocket connection closed');
      this.isConnected = false;
      this.attemptReconnection();
    };

    this.websocket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.isConnected = false;
    };
  }

  // Send authentication token
  private sendAuth(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      const authToken = localStorage.getItem('authToken');
      this.websocket.send(JSON.stringify({
        type: 'auth',
        token: authToken
      }));
    }
  }

  // Handle incoming real-time data
  private handleIncomingData(data: StreamingData): void {
    switch (data.type) {
      case 'metric_update':
        this.updateMetric(data.payload);
        break;
      case 'alert':
        this.handleAlert(data.payload);
        break;
      case 'event':
        this.addEvent(data.payload);
        break;
      case 'notification':
        this.showNotification(data.payload);
        break;
    }

    // Notify subscribers
    this.notifySubscribers(data.type, data.payload);
  }

  // Update metric with real-time data
  private updateMetric(metricData: any): void {
    const existing = this.metrics.get(metricData.id);
    const previousValue = existing?.value;

    const metric: RealTimeMetric = {
      ...metricData,
      previousValue,
      changePercent: previousValue ? 
        ((metricData.value - previousValue) / previousValue) * 100 : 0,
      trend: this.calculateTrend(metricData.value, previousValue),
      timestamp: new Date().toISOString()
    };

    this.metrics.set(metric.id, metric);
    
    // Check alert rules
    this.checkAlertRules(metric);
  }

  // Calculate trend direction
  private calculateTrend(current: number, previous?: number): 'up' | 'down' | 'stable' {
    if (!previous || current === previous) return 'stable';
    return current > previous ? 'up' : 'down';
  }

  // Attempt WebSocket reconnection
  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Falling back to polling.');
      this.fallbackToPolling();
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

    setTimeout(() => {
      console.log(`🔄 Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.initializeWebSocket();
    }, delay);
  }

  // Fallback to polling if WebSocket fails
  private fallbackToPolling(): void {
    console.log('📡 Falling back to HTTP polling for real-time data');
    
    setInterval(() => {
      this.fetchLatestMetrics();
    }, 5000); // Poll every 5 seconds
  }

  // Fetch latest metrics via HTTP
  private async fetchLatestMetrics(): Promise<void> {
    try {
      // Mock API call - replace with actual endpoint
      const response = await fetch('/api/metrics/latest');
      if (response.ok) {
        const data = await response.json();
        data.metrics.forEach((metric: any) => {
          this.updateMetric(metric);
        });
      }
    } catch (error) {
      console.error('Failed to fetch latest metrics:', error);
    }
  }

  // Setup mock data stream for development
  private setupMockDataStream(): void {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        this.generateMockData();
      }, 2000);
    }
  }

  // Generate mock real-time data
  private generateMockData(): void {
    const mockMetrics = [
      {
        id: 'total_students_online',
        name: 'Students Online',
        value: 15000 + Math.floor(Math.random() * 2000),
        unit: 'count',
        category: 'engagement'
      },
      {
        id: 'active_sessions',
        name: 'Active Sessions',
        value: 8500 + Math.floor(Math.random() * 1000),
        unit: 'count',
        category: 'operational'
      },
      {
        id: 'scholarship_applications_today',
        name: 'Scholarship Applications Today',
        value: 150 + Math.floor(Math.random() * 50),
        unit: 'count',
        category: 'financial'
      },
      {
        id: 'system_performance',
        name: 'System Performance',
        value: 92 + Math.random() * 6,
        unit: 'percentage',
        category: 'operational'
      },
      {
        id: 'placement_offers',
        name: 'Placement Offers This Week',
        value: 245 + Math.floor(Math.random() * 30),
        unit: 'count',
        category: 'academic'
      }
    ];

    mockMetrics.forEach(metric => {
      this.updateMetric(metric);
    });

    // Generate mock events occasionally
    if (Math.random() < 0.3) {
      this.generateMockEvent();
    }
  }

  // Generate mock events
  private generateMockEvent(): void {
    const events = [
      {
        type: 'enrollment_spike',
        title: 'Enrollment Spike Detected',
        description: 'Unusual increase in enrollment applications',
        severity: 'info' as const
      },
      {
        type: 'system_alert',
        title: 'High Server Load',
        description: 'Server CPU usage above 80%',
        severity: 'warning' as const
      },
      {
        type: 'scholarship_milestone',
        title: 'Scholarship Milestone Reached',
        description: '10,000th scholarship application processed',
        severity: 'info' as const
      }
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    const event: RealTimeEvent = {
      id: `event_${Date.now()}`,
      ...randomEvent,
      timestamp: new Date().toISOString(),
      source: 'system',
      affectedEntities: ['platform'],
      metadata: { generated: true }
    };

    this.addEvent(event);
  }

  // Initialize default metrics
  private initializeDefaultMetrics(): void {
    const defaultMetrics: RealTimeMetric[] = [
      {
        id: 'total_institutions',
        name: 'Total Institutions',
        value: 850,
        timestamp: new Date().toISOString(),
        trend: 'stable',
        changePercent: 0,
        unit: 'count',
        category: 'operational'
      },
      {
        id: 'total_students',
        name: 'Total Students',
        value: 125000,
        timestamp: new Date().toISOString(),
        trend: 'up',
        changePercent: 2.3,
        unit: 'count',
        category: 'academic'
      },
      {
        id: 'active_schemes',
        name: 'Active Schemes',
        value: 45,
        timestamp: new Date().toISOString(),
        trend: 'up',
        changePercent: 12.5,
        unit: 'count',
        category: 'financial'
      }
    ];

    defaultMetrics.forEach(metric => {
      this.metrics.set(metric.id, metric);
    });
  }

  // Setup alert rules
  private setupAlertRules(): void {
    const rules: AlertRule[] = [
      {
        id: 'high_dropout_rate',
        name: 'High Dropout Rate Alert',
        condition: 'dropout_rate > threshold',
        threshold: 15,
        metric: 'dropout_rate',
        severity: 'warning',
        recipients: ['admin@university.edu'],
        enabled: true
      },
      {
        id: 'low_attendance',
        name: 'Low Attendance Alert',
        condition: 'average_attendance < threshold',
        threshold: 75,
        metric: 'average_attendance',
        severity: 'warning',
        recipients: ['dean@university.edu'],
        enabled: true
      },
      {
        id: 'scholarship_budget_exceeded',
        name: 'Scholarship Budget Alert',
        condition: 'scholarship_spending > threshold',
        threshold: 90,
        metric: 'scholarship_budget_usage',
        severity: 'critical',
        recipients: ['finance@ministry.gov'],
        enabled: true
      }
    ];

    rules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  // Check if metric triggers any alert rules
  private checkAlertRules(metric: RealTimeMetric): void {
    this.alertRules.forEach(rule => {
      if (rule.enabled && rule.metric === metric.id) {
        const triggered = this.evaluateAlertCondition(rule, metric.value);
        
        if (triggered) {
          this.triggerAlert(rule, metric);
        }
      }
    });
  }

  // Evaluate alert condition
  private evaluateAlertCondition(rule: AlertRule, value: number): boolean {
    // Simple condition evaluation - in production, use a proper expression parser
    if (rule.condition.includes('>')) {
      return value > rule.threshold;
    } else if (rule.condition.includes('<')) {
      return value < rule.threshold;
    }
    return false;
  }

  // Trigger alert
  private triggerAlert(rule: AlertRule, metric: RealTimeMetric): void {
    console.warn(`🚨 Alert triggered: ${rule.name}`);
    
    const alert = {
      id: `alert_${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      metric: metric,
      severity: rule.severity,
      timestamp: new Date().toISOString(),
      message: `${metric.name} is ${metric.value}${metric.unit}, exceeding threshold of ${rule.threshold}`
    };

    // Send notifications
    rule.recipients.forEach(recipient => {
      this.sendNotification(recipient, alert);
    });

    // Add to event stream
    this.addEvent({
      id: alert.id,
      type: 'alert',
      title: rule.name,
      description: alert.message,
      severity: rule.severity,
      timestamp: alert.timestamp,
      source: 'alert_system',
      affectedEntities: [metric.id],
      metadata: { rule: rule.id, threshold: rule.threshold }
    });
  }

  // Send notification
  private sendNotification(recipient: string, alert: any): void {
    console.log(`📧 Sending alert notification to ${recipient}:`, alert);
    
    // In production, integrate with email/SMS services
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(alert.ruleName, {
        body: alert.message,
        icon: '/alert-icon.png'
      });
    }
  }

  // Add event to stream
  private addEvent(event: RealTimeEvent): void {
    this.eventStream.unshift(event);
    
    // Keep only last 100 events
    if (this.eventStream.length > 100) {
      this.eventStream = this.eventStream.slice(0, 100);
    }

    this.notifySubscribers('event', event);
  }

  // Handle alerts from server
  private handleAlert(alertData: any): void {
    console.warn('🚨 Server alert received:', alertData);
    this.showNotification({
      type: 'alert',
      title: alertData.title,
      message: alertData.message,
      severity: alertData.severity
    });
  }

  // Show notification
  private showNotification(notification: any): void {
    console.log('🔔 Notification:', notification);
    
    // Dispatch custom event for UI components to handle
    window.dispatchEvent(new CustomEvent('realTimeNotification', {
      detail: notification
    }));
  }

  // Subscribe to real-time updates
  subscribe(eventType: string, callback: Function): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
    };
  }

  // Notify subscribers of updates
  private notifySubscribers(eventType: string, data: any): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  // Get current metrics
  getMetrics(category?: string): RealTimeMetric[] {
    const allMetrics = Array.from(this.metrics.values());
    return category ? 
      allMetrics.filter(metric => metric.category === category) : 
      allMetrics;
  }

  // Get specific metric
  getMetric(id: string): RealTimeMetric | undefined {
    return this.metrics.get(id);
  }

  // Get recent events
  getRecentEvents(limit: number = 20): RealTimeEvent[] {
    return this.eventStream.slice(0, limit);
  }

  // Get connection status
  getConnectionStatus(): { isConnected: boolean; type: string } {
    return {
      isConnected: this.isConnected,
      type: this.websocket ? 'websocket' : 'polling'
    };
  }

  // Create dashboard configuration
  createDashboardConfig(userId: string, role: string): DashboardConfig {
    const defaultWidgets = this.getDefaultWidgetsForRole(role);
    
    const config: DashboardConfig = {
      userId,
      role: role as any,
      widgets: defaultWidgets,
      refreshRate: 2000,
      filters: [],
      notifications: {
        email: true,
        sms: false,
        push: true,
        inApp: true,
        thresholds: {}
      }
    };

    this.dashboardConfigs.set(userId, config);
    return config;
  }

  // Get dashboard configuration
  getDashboardConfig(userId: string): DashboardConfig | undefined {
    return this.dashboardConfigs.get(userId);
  }

  // Get default widgets based on user role
  private getDefaultWidgetsForRole(role: string): DashboardWidget[] {
    const baseWidgets: DashboardWidget[] = [
      {
        id: 'active_users',
        type: 'metric',
        title: 'Active Users',
        position: { x: 0, y: 0, width: 4, height: 2 },
        dataSource: 'active_sessions',
        config: {},
        isVisible: true
      }
    ];

    switch (role) {
      case 'student':
        return [
          ...baseWidgets,
          {
            id: 'my_performance',
            type: 'chart',
            title: 'Academic Performance',
            position: { x: 4, y: 0, width: 8, height: 4 },
            dataSource: 'student_performance',
            config: { chartType: 'line', timeRange: '30d' },
            isVisible: true
          }
        ];
      
      case 'government':
        return [
          ...baseWidgets,
          {
            id: 'national_overview',
            type: 'chart',
            title: 'National Education Overview',
            position: { x: 0, y: 2, width: 12, height: 6 },
            dataSource: 'national_metrics',
            config: { chartType: 'area', timeRange: '90d' },
            isVisible: true
          }
        ];
      
      default:
        return baseWidgets;
    }
  }

  // Update widget configuration
  updateWidget(userId: string, widgetId: string, updates: Partial<DashboardWidget>): void {
    const config = this.dashboardConfigs.get(userId);
    if (config) {
      const widgetIndex = config.widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex >= 0) {
        config.widgets[widgetIndex] = { ...config.widgets[widgetIndex], ...updates };
        this.dashboardConfigs.set(userId, config);
      }
    }
  }

  // Get historical data for charts
  async getHistoricalData(metricId: string, timeRange: string): Promise<any[]> {
    // Mock historical data - in production, fetch from time series database
    const now = Date.now();
    const points = this.getPointsForTimeRange(timeRange);
    const data = [];
    
    for (let i = points; i >= 0; i--) {
      const timestamp = new Date(now - (i * this.getIntervalForTimeRange(timeRange)));
      const baseValue = this.metrics.get(metricId)?.value || 100;
      const value = baseValue * (0.8 + Math.random() * 0.4); // ±20% variation
      
      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.round(value * 100) / 100
      });
    }
    
    return data;
  }

  private getPointsForTimeRange(timeRange: string): number {
    switch (timeRange) {
      case '1h': return 60; // 1 point per minute
      case '24h': return 24; // 1 point per hour
      case '7d': return 168; // 1 point per hour
      case '30d': return 30; // 1 point per day
      case '90d': return 90; // 1 point per day
      default: return 24;
    }
  }

  private getIntervalForTimeRange(timeRange: string): number {
    switch (timeRange) {
      case '1h': return 60 * 1000; // 1 minute
      case '24h': return 60 * 60 * 1000; // 1 hour
      case '7d': return 60 * 60 * 1000; // 1 hour
      case '30d': return 24 * 60 * 60 * 1000; // 1 day
      case '90d': return 24 * 60 * 60 * 1000; // 1 day
      default: return 60 * 60 * 1000;
    }
  }

  // Export metrics data
  exportMetricsData(format: 'csv' | 'json' | 'excel' = 'csv'): string {
    const metrics = this.getMetrics();
    
    if (format === 'json') {
      return JSON.stringify(metrics, null, 2);
    }
    
    if (format === 'csv') {
      const headers = ['ID', 'Name', 'Value', 'Unit', 'Category', 'Trend', 'Change%', 'Timestamp'];
      const rows = metrics.map(metric => [
        metric.id,
        metric.name,
        metric.value,
        metric.unit,
        metric.category,
        metric.trend,
        metric.changePercent,
        metric.timestamp
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(metrics);
  }

  // Cleanup resources
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.subscribers.clear();
    this.isConnected = false;
  }
}

// React hook for real-time analytics
export const useRealTimeAnalytics = (eventTypes: string[] = []) => {
  const analytics = RealTimeAnalytics.getInstance();
  
  const subscribe = (eventType: string, callback: Function) => {
    return analytics.subscribe(eventType, callback);
  };
  
  return {
    metrics: analytics.getMetrics(),
    getMetric: (id: string) => analytics.getMetric(id),
    getMetricsByCategory: (category: string) => analytics.getMetrics(category),
    recentEvents: analytics.getRecentEvents(),
    connectionStatus: analytics.getConnectionStatus(),
    subscribe,
    getHistoricalData: (metricId: string, timeRange: string) => 
      analytics.getHistoricalData(metricId, timeRange),
    exportData: (format?: 'csv' | 'json' | 'excel') => 
      analytics.exportMetricsData(format)
  };
};

export const realTimeAnalytics = RealTimeAnalytics.getInstance();