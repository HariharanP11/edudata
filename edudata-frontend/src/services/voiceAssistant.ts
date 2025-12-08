// Voice-Based Query System with Natural Language Processing
// Revolutionary accessibility feature for Indian education platform

interface VoiceQuery {
  text: string;
  confidence: number;
  language: string;
  intent: string;
  entities: Entity[];
  timestamp: string;
}

interface Entity {
  type: 'student_id' | 'institution' | 'scheme' | 'subject' | 'date' | 'number' | 'percentage';
  value: string;
  confidence: number;
  position: { start: number; end: number };
}

interface VoiceResponse {
  text: string;
  ssml?: string; // Speech Synthesis Markup Language
  language: string;
  audioUrl?: string;
  visualData?: any;
  actions?: VoiceAction[];
}

interface VoiceAction {
  type: 'navigate' | 'display_chart' | 'export_data' | 'send_notification';
  parameters: { [key: string]: any };
  confirmationRequired: boolean;
}

interface VoiceCapabilities {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  multiLanguageSupport: string[];
  offlineMode: boolean;
  noiseReduction: boolean;
}

export class IndianVoiceAssistant {
  private static instance: IndianVoiceAssistant;
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private currentLanguage: string = 'en-IN';
  private isListening: boolean = false;
  private capabilities: VoiceCapabilities;
  private contextHistory: VoiceQuery[] = [];

  static getInstance(): IndianVoiceAssistant {
    if (!IndianVoiceAssistant.instance) {
      IndianVoiceAssistant.instance = new IndianVoiceAssistant();
    }
    return IndianVoiceAssistant.instance;
  }

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
    this.capabilities = this.detectCapabilities();
    this.setupVoiceCommands();
  }

  // Initialize speech recognition with Indian language support
  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;
      this.recognition.lang = this.currentLanguage;

      this.setupRecognitionEvents();
    }
  }

  // Setup recognition event listeners
  private setupRecognitionEvents(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.log('🎙️ Voice recognition started');
      this.isListening = true;
      this.onListeningStart();
    };

    this.recognition.onend = () => {
      console.log('🔇 Voice recognition ended');
      this.isListening = false;
      this.onListeningEnd();
    };

    this.recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results[0][0].transcript;
      const confidence = results[0][0].confidence;

      console.log('🎯 Voice query received:', transcript);
      this.processVoiceQuery(transcript, confidence);
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Voice recognition error:', event.error);
      this.handleRecognitionError(event.error);
    };
  }

  // Start listening for voice commands
  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      console.log('Already listening');
      return;
    }

    try {
      this.recognition.lang = this.currentLanguage;
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      throw error;
    }
  }

  // Stop listening
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Process natural language query
  async processVoiceQuery(text: string, confidence: number): Promise<VoiceResponse> {
    console.log(`🧠 Processing query: "${text}" (confidence: ${confidence})`);

    // Create voice query object
    const query: VoiceQuery = {
      text: text.toLowerCase().trim(),
      confidence,
      language: this.currentLanguage,
      intent: '',
      entities: [],
      timestamp: new Date().toISOString()
    };

    // Extract intent and entities
    query.intent = this.extractIntent(query.text);
    query.entities = this.extractEntities(query.text);

    // Add to context history
    this.contextHistory.push(query);

    // Generate response based on intent
    const response = await this.generateResponse(query);

    // Speak the response
    await this.speak(response.text, response.ssml);

    return response;
  }

  // Extract intent from natural language
  private extractIntent(text: string): string {
    const intents = {
      'student_info': [
        'show my profile', 'my details', 'student information', 'my cgpa', 'my attendance',
        'मेरी जानकारी', 'मेरा प्रोफाइल', 'छात्र विवरण', 'मेरा सीजीपीए'
      ],
      'scholarship_query': [
        'scholarship', 'schemes', 'financial aid', 'apply for scheme', 'eligible schemes',
        'छात्रवृत्ति', 'स्कीम', 'आर्थिक सहायता', 'योजना'
      ],
      'performance_analytics': [
        'show analytics', 'performance data', 'charts', 'statistics', 'trends',
        'एनालिटिक्स', 'प्रदर्शन डेटा', 'चार्ट', 'आंकड़े'
      ],
      'placement_info': [
        'placement', 'jobs', 'career', 'companies', 'salary', 'recruitment',
        'प्लेसमेंट', 'नौकरी', 'करियर', 'कंपनी'
      ],
      'institution_search': [
        'find college', 'search university', 'institution information', 'college details',
        'कॉलेज खोजें', 'विश्वविद्यालय', 'संस्थान की जानकारी'
      ],
      'help': [
        'help', 'how to', 'what can you do', 'commands', 'assistance',
        'मदद', 'सहायता', 'कैसे करें', 'कमांड'
      ],
      'navigation': [
        'go to', 'open', 'navigate to', 'show page', 'take me to',
        'जाओ', 'खोलो', 'पेज दिखाओ'
      ],
      'data_export': [
        'download', 'export', 'save data', 'generate report',
        'डाउनलोड', 'एक्सपोर्ट', 'रिपोर्ट बनाएं'
      ]
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        return intent;
      }
    }

    return 'unknown';
  }

  // Extract entities from text using NLP
  private extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];

    // Student ID patterns
    const studentIdRegex = /stud\d+|student\s+id\s+(\w+)/gi;
    let match = studentIdRegex.exec(text);
    while (match) {
      entities.push({
        type: 'student_id',
        value: match[0],
        confidence: 0.9,
        position: { start: match.index, end: match.index + match[0].length }
      });
      match = studentIdRegex.exec(text);
    }

    // CGPA/percentage patterns
    const gradeRegex = /(\d+\.?\d*)\s*(cgpa|percentage|percent|marks)/gi;
    match = gradeRegex.exec(text);
    while (match) {
      entities.push({
        type: 'percentage',
        value: match[1],
        confidence: 0.8,
        position: { start: match.index, end: match.index + match[0].length }
      });
      match = gradeRegex.exec(text);
    }

    // Institution names
    const institutionKeywords = ['nit', 'iit', 'university', 'college', 'institute'];
    institutionKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b\\w*${keyword}\\w*\\b`, 'gi');
      match = regex.exec(text);
      while (match) {
        entities.push({
          type: 'institution',
          value: match[0],
          confidence: 0.7,
          position: { start: match.index, end: match.index + match[0].length }
        });
        match = regex.exec(text);
      }
    });

    // Date patterns
    const dateRegex = /\b\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\b|\b(today|yesterday|tomorrow)\b/gi;
    match = dateRegex.exec(text);
    while (match) {
      entities.push({
        type: 'date',
        value: match[0],
        confidence: 0.8,
        position: { start: match.index, end: match.index + match[0].length }
      });
      match = dateRegex.exec(text);
    }

    return entities;
  }

  // Generate contextual response
  private async generateResponse(query: VoiceQuery): Promise<VoiceResponse> {
    console.log(`🎯 Generating response for intent: ${query.intent}`);

    switch (query.intent) {
      case 'student_info':
        return this.handleStudentInfoQuery(query);
      
      case 'scholarship_query':
        return this.handleScholarshipQuery(query);
      
      case 'performance_analytics':
        return this.handleAnalyticsQuery(query);
      
      case 'placement_info':
        return this.handlePlacementQuery(query);
      
      case 'institution_search':
        return this.handleInstitutionSearchQuery(query);
      
      case 'help':
        return this.handleHelpQuery(query);
      
      case 'navigation':
        return this.handleNavigationQuery(query);
      
      case 'data_export':
        return this.handleDataExportQuery(query);
      
      default:
        return this.handleUnknownQuery(query);
    }
  }

  // Handle student information queries
  private handleStudentInfoQuery(query: VoiceQuery): VoiceResponse {
    // Mock student data - in production, fetch from API
    const studentInfo = {
      name: 'Aarav Sharma',
      cgpa: 8.7,
      attendance: 92,
      semester: 5,
      department: 'Computer Science'
    };

    const responseText = this.currentLanguage.startsWith('hi') ?
      `आपकी जानकारी: नाम ${studentInfo.name}, सीजीपीए ${studentInfo.cgpa}, उपस्थिति ${studentInfo.attendance} प्रतिशत` :
      `Your information: Name ${studentInfo.name}, CGPA ${studentInfo.cgpa}, Attendance ${studentInfo.attendance}%`;

    return {
      text: responseText,
      language: this.currentLanguage,
      visualData: studentInfo,
      actions: [{
        type: 'navigate',
        parameters: { route: '/dashboard/student' },
        confirmationRequired: false
      }]
    };
  }

  // Handle scholarship queries
  private handleScholarshipQuery(query: VoiceQuery): VoiceResponse {
    const responseText = this.currentLanguage.startsWith('hi') ?
      `आपके लिए 3 छात्रवृत्ति उपलब्ध हैं। डिजिटल इंडिया स्कॉलरशिप, एआईसीटीई मेरिट ग्रांट, और महिला स्टेम स्कॉलरशिप।` :
      `You are eligible for 3 scholarships: Digital India Scholarship, AICTE Merit Grant, and Women in STEM Scholarship.`;

    return {
      text: responseText,
      language: this.currentLanguage,
      actions: [{
        type: 'display_chart',
        parameters: { chartType: 'eligibleSchemes' },
        confirmationRequired: false
      }]
    };
  }

  // Handle analytics queries
  private handleAnalyticsQuery(query: VoiceQuery): VoiceResponse {
    const responseText = this.currentLanguage.startsWith('hi') ?
      `यहां आपके प्रदर्शन एनालिटिक्स हैं। आपका सीजीपीए ट्रेंड बढ़ता हुआ है।` :
      `Here are your performance analytics. Your CGPA trend is improving.`;

    return {
      text: responseText,
      language: this.currentLanguage,
      actions: [{
        type: 'display_chart',
        parameters: { chartType: 'academicProgress' },
        confirmationRequired: false
      }]
    };
  }

  // Handle placement queries
  private handlePlacementQuery(query: VoiceQuery): VoiceResponse {
    const responseText = this.currentLanguage.startsWith('hi') ?
      `प्लेसमेंट की स्थिति: आपका स्टेटस प्लेसड है। माइक्रोसॉफ्ट कंपनी में 28 लाख का पैकेज मिला है।` :
      `Placement status: You are placed at Microsoft with a package of 28 LPA.`;

    return {
      text: responseText,
      language: this.currentLanguage,
      actions: [{
        type: 'navigate',
        parameters: { route: '/dashboard/student#placement' },
        confirmationRequired: false
      }]
    };
  }

  // Handle institution search
  private handleInstitutionSearchQuery(query: VoiceQuery): VoiceResponse {
    const responseText = this.currentLanguage.startsWith('hi') ?
      `मैंने 5 टॉप संस्थान खोजे हैं। आईआईटी बॉम्बे नंबर 3 पर, एनआईटी दिल्ली नंबर 45 पर है।` :
      `Found 5 top institutions. IIT Bombay ranked 3rd, NIT Delhi ranked 45th.`;

    return {
      text: responseText,
      language: this.currentLanguage,
      actions: [{
        type: 'display_chart',
        parameters: { chartType: 'institutionRankings' },
        confirmationRequired: false
      }]
    };
  }

  // Handle help queries
  private handleHelpQuery(query: VoiceQuery): VoiceResponse {
    const responseText = this.currentLanguage.startsWith('hi') ?
      `मैं आपकी शिक्षा संबंधी सभी जरूरतों में मदद कर सकता हूं। आप छात्र जानकारी, स्कॉलरशिप, प्लेसमेंट, और एनालिटिक्स के बारे में पूछ सकते हैं।` :
      `I can help with all your education needs. You can ask about student information, scholarships, placements, and analytics.`;

    return {
      text: responseText,
      language: this.currentLanguage
    };
  }

  // Handle navigation queries
  private handleNavigationQuery(query: VoiceQuery): VoiceResponse {
    // Extract page from query
    const pages = {
      'dashboard': '/dashboard/student',
      'profile': '/dashboard/student#profile',
      'analytics': '/dashboard/student#analytics',
      'scholarships': '/dashboard/student#scholarships'
    };

    const page = Object.keys(pages).find(p => query.text.includes(p)) || 'dashboard';
    
    const responseText = this.currentLanguage.startsWith('hi') ?
      `${page} पर जा रहे हैं।` :
      `Navigating to ${page}.`;

    return {
      text: responseText,
      language: this.currentLanguage,
      actions: [{
        type: 'navigate',
        parameters: { route: pages[page as keyof typeof pages] },
        confirmationRequired: false
      }]
    };
  }

  // Handle data export queries
  private handleDataExportQuery(query: VoiceQuery): VoiceResponse {
    const responseText = this.currentLanguage.startsWith('hi') ?
      `आपका डेटा एक्सपोर्ट हो रहा है। फाइल डाउनलोड फोल्डर में सेव होगी।` :
      `Exporting your data. File will be saved to downloads folder.`;

    return {
      text: responseText,
      language: this.currentLanguage,
      actions: [{
        type: 'export_data',
        parameters: { format: 'pdf', dataType: 'student_profile' },
        confirmationRequired: true
      }]
    };
  }

  // Handle unknown queries
  private handleUnknownQuery(query: VoiceQuery): VoiceResponse {
    const responseText = this.currentLanguage.startsWith('hi') ?
      `मुझे समझ नहीं आया। कृपया फिर से पूछें या 'मदद' कहें।` :
      `I didn't understand that. Please ask again or say 'help' for assistance.`;

    return {
      text: responseText,
      language: this.currentLanguage
    };
  }

  // Text-to-speech synthesis
  async speak(text: string, ssml?: string): Promise<void> {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.currentLanguage;
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Try to find appropriate voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang === this.currentLanguage || 
      voice.lang.startsWith(this.currentLanguage.split('-')[0])
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      
      this.synthesis.speak(utterance);
    });
  }

  // Change voice assistant language
  async changeLanguage(languageCode: string): Promise<void> {
    const supportedLanguages = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN'
    };

    const fullLangCode = supportedLanguages[languageCode as keyof typeof supportedLanguages] || 'en-IN';
    
    this.currentLanguage = fullLangCode;
    
    if (this.recognition) {
      this.recognition.lang = fullLangCode;
    }

    console.log(`🌐 Voice assistant language changed to: ${fullLangCode}`);
  }

  // Get voice capabilities
  getCapabilities(): VoiceCapabilities {
    return this.capabilities;
  }

  // Setup voice command shortcuts
  private setupVoiceCommands(): void {
    // Global keyboard shortcut for voice activation
    document.addEventListener('keydown', (event) => {
      // Ctrl + Shift + V to start voice
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyV') {
        event.preventDefault();
        this.startListening().catch(console.error);
      }
    });
  }

  // Detect device capabilities
  private detectCapabilities(): VoiceCapabilities {
    return {
      speechRecognition: !!this.recognition,
      speechSynthesis: !!this.synthesis,
      multiLanguageSupport: ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN'],
      offlineMode: false, // Future enhancement
      noiseReduction: true // Browser-dependent
    };
  }

  // Event handlers
  private onListeningStart(): void {
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('voiceListeningStart'));
  }

  private onListeningEnd(): void {
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('voiceListeningEnd'));
  }

  private handleRecognitionError(error: string): void {
    console.error('Voice recognition error:', error);
    
    let message = 'Voice recognition failed. ';
    switch (error) {
      case 'network':
        message += 'Please check your internet connection.';
        break;
      case 'not-allowed':
        message += 'Please allow microphone access.';
        break;
      case 'no-speech':
        message += 'No speech detected. Please try again.';
        break;
      default:
        message += 'Please try again.';
    }

    // Dispatch error event
    window.dispatchEvent(new CustomEvent('voiceRecognitionError', {
      detail: { error, message }
    }));
  }

  // Get conversation history
  getConversationHistory(): VoiceQuery[] {
    return this.contextHistory;
  }

  // Clear conversation history
  clearHistory(): void {
    this.contextHistory = [];
  }
}

// React hook for voice assistant
export const useVoiceAssistant = () => {
  const assistant = IndianVoiceAssistant.getInstance();
  
  return {
    startListening: () => assistant.startListening(),
    stopListening: () => assistant.stopListening(),
    processQuery: (text: string, confidence = 1.0) => assistant.processVoiceQuery(text, confidence),
    speak: (text: string, ssml?: string) => assistant.speak(text, ssml),
    changeLanguage: (lang: string) => assistant.changeLanguage(lang),
    capabilities: assistant.getCapabilities(),
    isListening: assistant.isListening,
    history: assistant.getConversationHistory(),
    clearHistory: () => assistant.clearHistory()
  };
};

export const voiceAssistant = IndianVoiceAssistant.getInstance();