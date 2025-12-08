// Multi-language Support System for Indian Education Platform
// Supports 22 official Indian languages + English with cultural adaptations

import { useSyncExternalStore } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  script: 'latin' | 'devanagari' | 'bengali' | 'tamil' | 'telugu' | 'gujarati' | 'kannada' | 'malayalam' | 'punjabi' | 'odia' | 'assamese';
  direction: 'ltr' | 'rtl';
  region: string;
  isOfficial: boolean;
  speakers: number; // in millions
}

interface TranslationResource {
  [key: string]: string | TranslationResource;
}

interface CulturalAdaptation {
  dateFormat: string;
  numberFormat: string;
  currency: string;
  greetings: string[];
  formalityLevel: 'formal' | 'semi-formal' | 'informal';
  honorifics: string[];
  culturalPhrases: { [context: string]: string };
}

interface RegionalSettings {
  language: Language;
  culturalAdaptation: CulturalAdaptation;
  educationSystem: {
    gradingScale: string;
    academicYear: string;
    boardNames: string[];
    universityTypes: string[];
  };
  localHolidays: Array<{
    name: string;
    date: string;
    description: string;
  }>;
}

export class IndianMultiLanguageSystem {
  private static instance: IndianMultiLanguageSystem;
  private currentLanguage: Language;
  private translations: Map<string, TranslationResource> = new Map();
  private regionalSettings: Map<string, RegionalSettings> = new Map();

  static getInstance(): IndianMultiLanguageSystem {
    if (!IndianMultiLanguageSystem.instance) {
      IndianMultiLanguageSystem.instance = new IndianMultiLanguageSystem();
    }
    return IndianMultiLanguageSystem.instance;
  }

  // Public getter for current language
  public getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  constructor() {
    this.currentLanguage = this.getSupportedLanguages()[0]; // Default to English
    this.initializeLanguages();
    this.loadTranslations();
    this.setupRegionalSettings();

    // Apply initial cultural and UI settings on load
    this.applyCulturalAdaptations(this.currentLanguage.code);
    this.updateUIForLanguage(this.currentLanguage);
  }

  // Get all supported Indian languages
  getSupportedLanguages(): Language[] {
    return [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        script: 'latin',
        direction: 'ltr',
        region: 'India',
        isOfficial: true,
        speakers: 350
      },
      {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        script: 'devanagari',
        direction: 'ltr',
        region: 'North India',
        isOfficial: true,
        speakers: 600
      },
      {
        code: 'bn',
        name: 'Bengali',
        nativeName: 'বাংলা',
        script: 'bengali',
        direction: 'ltr',
        region: 'West Bengal, Tripura',
        isOfficial: true,
        speakers: 265
      },
      {
        code: 'ta',
        name: 'Tamil',
        nativeName: 'தமிழ்',
        script: 'tamil',
        direction: 'ltr',
        region: 'Tamil Nadu, Puducherry',
        isOfficial: true,
        speakers: 75
      },
      {
        code: 'te',
        name: 'Telugu',
        nativeName: 'తెలుగు',
        script: 'telugu',
        direction: 'ltr',
        region: 'Telangana, Andhra Pradesh',
        isOfficial: true,
        speakers: 82
      },
      {
        code: 'mr',
        name: 'Marathi',
        nativeName: 'मराठी',
        script: 'devanagari',
        direction: 'ltr',
        region: 'Maharashtra, Goa',
        isOfficial: true,
        speakers: 83
      },
      {
        code: 'gu',
        name: 'Gujarati',
        nativeName: 'ગુજરાતી',
        script: 'gujarati',
        direction: 'ltr',
        region: 'Gujarat, Dadra and Nagar Haveli',
        isOfficial: true,
        speakers: 56
      },
      {
        code: 'kn',
        name: 'Kannada',
        nativeName: 'ಕನ್ನಡ',
        script: 'kannada',
        direction: 'ltr',
        region: 'Karnataka',
        isOfficial: true,
        speakers: 44
      },
      {
        code: 'ml',
        name: 'Malayalam',
        nativeName: 'മലയാളം',
        script: 'malayalam',
        direction: 'ltr',
        region: 'Kerala, Lakshadweep',
        isOfficial: true,
        speakers: 35
      },
      {
        code: 'pa',
        name: 'Punjabi',
        nativeName: 'ਪੰਜਾਬੀ',
        script: 'punjabi',
        direction: 'ltr',
        region: 'Punjab, Chandigarh',
        isOfficial: true,
        speakers: 33
      },
      {
        code: 'or',
        name: 'Odia',
        nativeName: 'ଓଡ଼ିଆ',
        script: 'odia',
        direction: 'ltr',
        region: 'Odisha',
        isOfficial: true,
        speakers: 38
      },
      {
        code: 'as',
        name: 'Assamese',
        nativeName: 'অসমীয়া',
        script: 'assamese',
        direction: 'ltr',
        region: 'Assam',
        isOfficial: true,
        speakers: 15
      }
    ];
  }

  // Switch language and adapt UI
  async switchLanguage(languageCode: string): Promise<void> {
    console.log(`🌐 Switching to language: ${languageCode}`);

    const language = this.getSupportedLanguages().find(lang => lang.code === languageCode);
    if (!language) {
      console.warn(`Language ${languageCode} not supported`);
      return;
    }

    this.currentLanguage = language;

    // Load language-specific translations
    await this.loadLanguageTranslations(languageCode);

    // Apply cultural adaptations
    this.applyCulturalAdaptations(languageCode);

    // Update UI direction and fonts
    this.updateUIForLanguage(language);

    // Store preference
    localStorage.setItem('preferred_language', languageCode);

    // Trigger UI refresh event
    this.dispatchLanguageChangeEvent();
  }

  // Get translated text with context
  translate(key: string, context?: string, params?: { [key: string]: string | number }): string {
    const translation = this.getTranslationByKey(key, context);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${this.currentLanguage.code}`);
      return key; // Fallback to key
    }

    // Handle parameterized translations
    if (params) {
      return this.interpolateParameters(translation, params);
    }

    return translation;
  }

  // Get culturally adapted text
  getCulturalText(context: 'greeting' | 'formal_address' | 'education_term', subContext?: string): string {
    const regional = this.regionalSettings.get(this.currentLanguage.code);
    if (!regional) return '';

    switch (context) {
      case 'greeting':
        const greetings = regional.culturalAdaptation.greetings;
        const currentHour = new Date().getHours();
        if (currentHour < 12) return greetings[0] || 'Good Morning';
        if (currentHour < 17) return greetings[1] || 'Good Afternoon';
        return greetings[2] || 'Good Evening';

      case 'formal_address':
        const honorifics = regional.culturalAdaptation.honorifics;
        return honorifics[0] || 'Respected';

      case 'education_term':
        return regional.culturalAdaptation.culturalPhrases[subContext || 'general'] || '';

      default:
        return '';
    }
  }

  // Format numbers according to Indian system
  formatNumber(number: number, type: 'currency' | 'percentage' | 'decimal' = 'decimal'): string {
    const regional = this.regionalSettings.get(this.currentLanguage.code);
    const locale = this.getLocaleForLanguage(this.currentLanguage.code);

    switch (type) {
      case 'currency':
        // Indian number system (lakhs, crores)
        if (number >= 10000000) {
          return `₹${(number / 10000000).toFixed(2)} Cr`;
        } else if (number >= 100000) {
          return `₹${(number / 100000).toFixed(2)} L`;
        } else if (number >= 1000) {
          return `₹${(number / 1000).toFixed(1)}K`;
        }
        return `₹${number.toLocaleString(locale)}`;

      case 'percentage':
        return `${number.toFixed(1)}%`;

      case 'decimal':
        return number.toLocaleString(locale);

      default:
        return number.toString();
    }
  }

  // Format dates according to regional preferences
  formatDate(date: Date, format: 'short' | 'long' | 'relative' = 'short'): string {
    const regional = this.regionalSettings.get(this.currentLanguage.code);
    const locale = this.getLocaleForLanguage(this.currentLanguage.code);

    switch (format) {
      case 'long':
        return new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date);

      case 'relative':
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        const diffTime = date.getTime() - Date.now();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (Math.abs(diffDays) < 30) {
          return rtf.format(diffDays, 'day');
        } else {
          return this.formatDate(date, 'short');
        }

      case 'short':
      default:
        return new Intl.DateTimeFormat(locale).format(date);
    }
  }

  // Voice synthesis for accessibility
  async speakText(text: string, voice?: 'male' | 'female'): Promise<void> {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.getVoiceLanguageCode(this.currentLanguage.code);
    
    // Try to find language-specific voice
    const voices = speechSynthesis.getVoices();
    const languageVoices = voices.filter(v => v.lang.startsWith(this.currentLanguage.code));
    
    if (languageVoices.length > 0) {
      const preferredVoice = languageVoices.find(v => 
        voice === 'female' ? v.name.toLowerCase().includes('female') : 
        voice === 'male' ? v.name.toLowerCase().includes('male') : true
      );
      utterance.voice = preferredVoice || languageVoices[0];
    }

    speechSynthesis.speak(utterance);
  }

  // Regional education system integration
  getRegionalEducationTerms(category: string): string[] {
    const regional = this.regionalSettings.get(this.currentLanguage.code);
    if (!regional) return [];

    switch (category) {
      case 'boards':
        return regional.educationSystem.boardNames;
      case 'universities':
        return regional.educationSystem.universityTypes;
      case 'grades':
        return [regional.educationSystem.gradingScale];
      default:
        return [];
    }
  }

  // Smart language detection from user input
  detectLanguage(text: string): string {
    // Simple script-based detection
    const scripts = {
      devanagari: /[\u0900-\u097F]/,
      bengali: /[\u0980-\u09FF]/,
      tamil: /[\u0B80-\u0BFF]/,
      telugu: /[\u0C00-\u0C7F]/,
      gujarati: /[\u0A80-\u0AFF]/,
      kannada: /[\u0C80-\u0CFF]/,
      malayalam: /[\u0D00-\u0D7F]/,
      punjabi: /[\u0A00-\u0A7F]/,
      odia: /[\u0B00-\u0B7F]/
    };

    for (const [script, regex] of Object.entries(scripts)) {
      if (regex.test(text)) {
        const language = this.getSupportedLanguages().find(lang => lang.script === script);
        return language?.code || 'en';
      }
    }

    return 'en'; // Default to English
  }

  // Initialize language data
  private initializeLanguages(): void {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage) {
      const language = this.getSupportedLanguages().find(lang => lang.code === savedLanguage);
      if (language) {
        this.currentLanguage = language;
      }
    }
  }

  private loadTranslations(): void {
    // Sample translations - in production, load from API or files
    this.translations.set('en', {
      common: {
        welcome: 'Welcome',
        dashboard: 'Dashboard',
        student: 'Student',
        teacher: 'Teacher',
        institution: 'Institution',
        government: 'Government',
        profile: 'Profile',
        settings: 'Settings',
        login: 'Login',
        logout: 'Logout',
        close: 'Close'
      },
      app: {
        tagline: 'Unified Education Platform'
      },
      portal: {
        student: 'Student Portal',
        teacher: 'Teacher Portal',
        institution: 'Institution Portal'
      },
      demo: {
        sihButton: 'SIH Demo',
        sihTitle: 'EduData Platform - SIH Demo Flow',
        start: 'Start Demo Journey'
      },
      education: {
        cgpa: 'CGPA',
        attendance: 'Attendance',
        semester: 'Semester',
        department: 'Department',
        scholarship: 'Scholarship',
        placement: 'Placement'
      },
      search: {
        institutions: 'Search Institutions',
        placeholder: 'Search by institution name...'
      }
    });

    this.translations.set('hi', {
      common: {
        welcome: 'स्वागत है',
        dashboard: 'डैशबोर्ड',
        student: 'छात्र',
        teacher: 'शिक्षक',
        institution: 'संस्थान',
        government: 'सरकार',
        profile: 'प्रोफ़ाइल',
        settings: 'सेटिंग्स',
        login: 'लॉगिन',
        logout: 'लॉगआउट',
        close: 'बंद करें'
      },
      app: {
        tagline: 'एकीकृत शिक्षा मंच'
      },
      portal: {
        student: 'छात्र पोर्टल',
        teacher: 'शिक्षक पोर्टल',
        institution: 'संस्थान पोर्टल'
      },
      demo: {
        sihButton: 'एसआईएच डेमो',
        sihTitle: 'एडूडाटा प्लेटफ़ॉर्म - एसआईएच डेमो प्रवाह',
        start: 'डेमो यात्रा शुरू करें'
      },
      education: {
        cgpa: 'सीजीपीए',
        attendance: 'उपस्थिति',
        semester: 'सेमेस्टर',
        department: 'विभाग',
        scholarship: 'छात्रवृत्ति',
        placement: 'प्लेसमेंट'
      },
      search: {
        institutions: 'संस्थानों की खोज',
        placeholder: 'संस्थान के नाम से खोजें...'
      }
    });

    // Add more language translations...
  }

  private setupRegionalSettings(): void {
    // Hindi regional settings
    this.regionalSettings.set('hi', {
      language: this.getSupportedLanguages().find(l => l.code === 'hi')!,
      culturalAdaptation: {
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'hi-IN',
        currency: 'INR',
        greetings: ['सुप्रभात', 'नमस्ते', 'शुभ संध्या'],
        formalityLevel: 'formal',
        honorifics: ['आदरणीय', 'श्रीमान्', 'श्रीमती'],
        culturalPhrases: {
          respect: 'आपका सम्मान',
          blessing: 'आशीर्वाद',
          education: 'शिक्षा'
        }
      },
      educationSystem: {
        gradingScale: '10-point CGPA',
        academicYear: 'July-May',
        boardNames: ['CBSE', 'UP Board', 'Bihar Board', 'Haryana Board'],
        universityTypes: ['केंद्रीय विश्वविद्यालय', 'राज्य विश्वविद्यालय', 'डीम्ड विश्वविद्यालय']
      },
      localHolidays: [
        { name: 'होली', date: '2024-03-25', description: 'Festival of Colors' },
        { name: 'दिवाली', date: '2024-11-01', description: 'Festival of Lights' }
      ]
    });

    // English regional settings
    this.regionalSettings.set('en', {
      language: this.getSupportedLanguages().find(l => l.code === 'en')!,
      culturalAdaptation: {
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'en-IN',
        currency: 'INR',
        greetings: ['Good Morning', 'Good Afternoon', 'Good Evening'],
        formalityLevel: 'semi-formal',
        honorifics: ['Mr.', 'Ms.', 'Dr.', 'Prof.'],
        culturalPhrases: {
          respect: 'With respect',
          blessing: 'Best wishes',
          education: 'Education'
        }
      },
      educationSystem: {
        gradingScale: '10-point CGPA',
        academicYear: 'July-May',
        boardNames: ['CBSE', 'ICSE', 'State Boards'],
        universityTypes: ['Central University', 'State University', 'Deemed University', 'Private University']
      },
      localHolidays: [
        { name: 'Holi', date: '2024-03-25', description: 'Festival of Colors' },
        { name: 'Diwali', date: '2024-11-01', description: 'Festival of Lights' }
      ]
    });

    // Add more regional settings...
  }

  private async loadLanguageTranslations(languageCode: string): Promise<void> {
    // In production, load from API or translation files
    console.log(`Loading translations for ${languageCode}`);
  }

  private applyCulturalAdaptations(languageCode: string): void {
    const regional = this.regionalSettings.get(languageCode);
    if (!regional) return;

    // Apply cultural adaptations to the UI
    document.documentElement.setAttribute('data-culture', languageCode);
    document.documentElement.setAttribute('data-formality', regional.culturalAdaptation.formalityLevel);
  }

  private updateUIForLanguage(language: Language): void {
    // Update HTML attributes
    document.documentElement.setAttribute('lang', language.code);
    document.documentElement.setAttribute('dir', language.direction);
    document.documentElement.setAttribute('data-script', language.script);

    // Load appropriate fonts
    this.loadLanguageFonts(language);

    // Update CSS custom properties for spacing/layout
    this.updateLayoutForScript(language.script);
  }

  private loadLanguageFonts(language: Language): void {
    const fontMap = {
      devanagari: 'Noto Sans Devanagari, system-ui',
      bengali: 'Noto Sans Bengali, system-ui',
      tamil: 'Noto Sans Tamil, system-ui',
      telugu: 'Noto Sans Telugu, system-ui',
      gujarati: 'Noto Sans Gujarati, system-ui',
      kannada: 'Noto Sans Kannada, system-ui',
      malayalam: 'Noto Sans Malayalam, system-ui',
      punjabi: 'Noto Sans Gurmukhi, system-ui',
      odia: 'Noto Sans Oriya, system-ui',
      latin: 'Inter, system-ui'
    };

    const fontFamily = fontMap[language.script] || fontMap.latin;
    document.documentElement.style.setProperty('--font-family-primary', fontFamily);
  }

  private updateLayoutForScript(script: string): void {
    // Adjust line height and spacing for different scripts
    const scriptSettings = {
      devanagari: { lineHeight: '1.7', letterSpacing: '0.01em' },
      bengali: { lineHeight: '1.6', letterSpacing: '0.01em' },
      tamil: { lineHeight: '1.6', letterSpacing: '0.02em' },
      telugu: { lineHeight: '1.6', letterSpacing: '0.01em' },
      latin: { lineHeight: '1.5', letterSpacing: '0em' }
    };

    const settings = scriptSettings[script as keyof typeof scriptSettings] || scriptSettings.latin;
    document.documentElement.style.setProperty('--line-height-primary', settings.lineHeight);
    document.documentElement.style.setProperty('--letter-spacing-primary', settings.letterSpacing);
  }

  private getTranslationByKey(key: string, context?: string): string {
    const languageData = this.translations.get(this.currentLanguage.code);
    if (!languageData) return '';

    const keys = key.split('.');
    let current: any = languageData;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return '';
      }
    }

    return typeof current === 'string' ? current : '';
  }

  private interpolateParameters(text: string, params: { [key: string]: string | number }): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  private getLocaleForLanguage(languageCode: string): string {
    const localeMap: { [key: string]: string } = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
      'or': 'or-IN',
      'as': 'as-IN'
    };

    return localeMap[languageCode] || 'en-IN';
  }

  private getVoiceLanguageCode(languageCode: string): string {
    const voiceMap: { [key: string]: string } = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN'
    };

    return voiceMap[languageCode] || 'en-IN';
  }

  private dispatchLanguageChangeEvent(): void {
    const event = new CustomEvent('languageChanged', {
      detail: { language: this.currentLanguage }
    });
    window.dispatchEvent(event);
  }
}

// React hook for using translations
export const useTranslation = () => {
  const i18n = IndianMultiLanguageSystem.getInstance();

  // Subscribe to language change events to trigger re-render
  const subscribe = (onStoreChange: () => void) => {
    const handler = () => onStoreChange();
    window.addEventListener('languageChanged', handler);
    return () => window.removeEventListener('languageChanged', handler);
  };
  const getSnapshot = () => i18n.getCurrentLanguage().code;
  const getServerSnapshot = () => i18n.getCurrentLanguage().code;
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  return {
    t: (key: string, params?: { [key: string]: string | number }) => i18n.translate(key, undefined, params),
    cultural: (context: 'greeting' | 'formal_address' | 'education_term', subContext?: string) => 
      i18n.getCulturalText(context, subContext),
    formatNumber: (number: number, type?: 'currency' | 'percentage' | 'decimal') => 
      i18n.formatNumber(number, type),
    formatDate: (date: Date, format?: 'short' | 'long' | 'relative') => 
      i18n.formatDate(date, format),
    currentLanguage: i18n.getCurrentLanguage(),
    switchLanguage: (code: string) => i18n.switchLanguage(code),
    supportedLanguages: i18n.getSupportedLanguages(),
    speak: (text: string, voice?: 'male' | 'female') => i18n.speakText(text, voice)
  };
};

export const i18nService = IndianMultiLanguageSystem.getInstance();