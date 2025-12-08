import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/services/i18n';
import { 
  Play, 
  Users, 
  GraduationCap, 
  Building2, 
  Shield,
  User,
  ChevronRight,
  Info
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  route: string;
  credentials?: {
    id: string;
    password: string;
    role: string;
  };
  icon: React.ReactNode;
  color: string;
}

const demoSteps: DemoStep[] = [
  {
    id: 'public',
    title: 'Public Dashboard',
    description: 'National overview of education statistics, recent placements, and institution search',
    route: '/',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  {
    id: 'student',
    title: 'Student Portal',
    description: 'Personal academic profile, scholarships, progress tracking, and placement status',
    route: '/dashboard/student',
    credentials: { id: 'stud1', password: 'student123', role: 'student' },
    icon: <GraduationCap className="h-5 w-5" />,
    color: 'bg-green-500'
  },
  {
    id: 'teacher',
    title: 'Teacher Portal',
    description: 'Department management, student performance analytics, and research tracking',
    route: '/dashboard/teacher',
    credentials: { id: 'APAR001', password: 'teacher123', role: 'teacher' },
    icon: <User className="h-5 w-5" />,
    color: 'bg-purple-500'
  },
  {
    id: 'institution',
    title: 'Institution Portal',
    description: 'Performance metrics, compliance tracking, and institutional analytics',
    route: '/dashboard/institution',
    credentials: { id: 'AISHE001', password: 'institution123', role: 'institution' },
    icon: <Building2 className="h-5 w-5" />,
    color: 'bg-orange-500'
  },
  {
    id: 'government',
    title: 'Government Portal',
    description: 'Scheme management, national statistics, and policy analytics',
    route: '/dashboard/government',
    credentials: { id: 'gov123', password: 'gov123', role: 'government' },
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-red-500'
  },
  {
    id: 'admin',
    title: 'Admin Portal',
    description: 'Complete system access, data export, and compliance monitoring',
    route: '/dashboard/admin',
    credentials: { id: 'admin', password: 'admin123', role: 'admin' },
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-gray-700'
  }
];

const SIHDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const startDemo = () => {
    setIsOpen(true);
    setCurrentStep(0);
  };

  const navigateToStep = async (step: DemoStep, stepIndex: number) => {
    setCurrentStep(stepIndex);
    
    // If step requires login, simulate login
    if (step.credentials) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', step.credentials.role);
      localStorage.setItem('userId', step.credentials.id);
      
      // Mock user data
      const userData = {
        id: step.credentials.id,
        role: step.credentials.role,
        name: `Demo ${step.credentials.role.charAt(0).toUpperCase() + step.credentials.role.slice(1)}`
      };
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    // Navigate to route
    navigate(step.route);
    setIsOpen(false);
    
    // Show step info
    setTimeout(() => {
      alert(`SIH Demo: Now viewing ${step.title}\n\n${step.description}\n\nCredentials used: ${step.credentials ? `${step.credentials.role.toUpperCase()} - ${step.credentials.id}` : 'No login required'}`);
    }, 500);
  };

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      const nextStepData = demoSteps[currentStep + 1];
      navigateToStep(nextStepData, currentStep + 1);
    }
  };

  const resetDemo = () => {
    // Clear all auth data
    localStorage.clear();
    setCurrentStep(-1);
    navigate('/');
    setIsOpen(false);
  };

  return (
    <>
      {/* Demo Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={startDemo}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 py-3"
        >
          <Play className="mr-2 h-4 w-4" />
          {t('demo.sihButton')}
        </Button>
      </div>

      {/* Demo Progress Indicator */}
      {currentStep >= 0 && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="p-3 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                Step {currentStep + 1} of {demoSteps.length}
              </Badge>
              <Button
                onClick={nextStep}
                disabled={currentStep >= demoSteps.length - 1}
                size="sm"
                variant="outline"
              >
                Next <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
              <Button
                onClick={resetDemo}
                size="sm"
                variant="ghost"
              >
                Reset
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Demo Flow Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>{t('demo.sihTitle')}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-lg mb-2">🎯 Problem Statement</h3>
              <p className="text-sm text-muted-foreground">
                <strong>"One Nation, One Education Data"</strong> - Creating a unified platform to consolidate 
                scattered educational data across institutions, teachers, students, and government schemes 
                into a single transparent interface.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-lg mb-2 text-green-800">✨ Our Solution</h3>
              <p className="text-sm text-green-700">
                Role-based unified platform with real-time analytics, scheme recommendations, 
                and comprehensive data tracking from admission to placement.
              </p>
            </div>

            <div className="grid gap-3">
              <h3 className="font-semibold text-lg">Demo Journey</h3>
              {demoSteps.map((step, index) => (
                <Card 
                  key={step.id} 
                  className={`p-4 cursor-pointer hover:shadow-md transition-all ${
                    currentStep === index ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => navigateToStep(step, index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${step.color} text-white p-2 rounded-lg`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{step.title}</h4>
                        <Badge variant="outline">{index + 1}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      {step.credentials && (
                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Demo ID: {step.credentials.id} | Role: {step.credentials.role.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">📊 Key Highlights for Judges</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• <strong>Unified Data Access:</strong> Single platform for all stakeholders</li>
                <li>• <strong>Real-time Analytics:</strong> Interactive charts and performance metrics</li>
                <li>• <strong>Automated Eligibility:</strong> AI-based scheme recommendations</li>
                <li>• <strong>Transparency:</strong> End-to-end tracking and compliance monitoring</li>
                <li>• <strong>Scalability:</strong> Modern tech stack ready for national deployment</li>
              </ul>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {t('common.close')}
              </Button>
              <Button 
                onClick={() => navigateToStep(demoSteps[0], 0)}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {t('demo.start')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SIHDemo;