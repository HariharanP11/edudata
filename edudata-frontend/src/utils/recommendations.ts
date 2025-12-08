import { Student, Scheme } from '@/data/mockData';

export interface SchemeRecommendation {
  scheme: Scheme;
  eligibilityScore: number;
  matchingCriteria: string[];
  missingCriteria: string[];
  recommendation: 'highly_recommended' | 'recommended' | 'partially_eligible' | 'not_eligible';
  reasonsToApply: string[];
  actionItems: string[];
}

export interface RecommendationFilters {
  includeApplied?: boolean;
  minEligibilityScore?: number;
  schemeTypes?: string[];
  maxRecommendations?: number;
}

// Main recommendation engine
export const getSchemeRecommendations = (
  student: Student,
  allSchemes: Scheme[],
  filters: RecommendationFilters = {}
): SchemeRecommendation[] => {
  const {
    includeApplied = false,
    minEligibilityScore = 0.3,
    schemeTypes = [],
    maxRecommendations = 10
  } = filters;

  // Filter out schemes student has already applied to (if not including applied)
  let relevantSchemes = allSchemes;
  if (!includeApplied && student.scholarships) {
    relevantSchemes = allSchemes.filter(scheme => 
      !student.scholarships.includes(scheme.name)
    );
  }

  // Filter by scheme types if specified
  if (schemeTypes.length > 0) {
    relevantSchemes = relevantSchemes.filter(scheme =>
      schemeTypes.includes(scheme.type)
    );
  }

  // Generate recommendations for each scheme
  const recommendations = relevantSchemes
    .map(scheme => generateSchemeRecommendation(student, scheme))
    .filter(rec => rec.eligibilityScore >= minEligibilityScore)
    .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
    .slice(0, maxRecommendations);

  return recommendations;
};

// Generate recommendation for a single scheme
const generateSchemeRecommendation = (
  student: Student,
  scheme: Scheme
): SchemeRecommendation => {
  const matchingCriteria: string[] = [];
  const missingCriteria: string[] = [];
  const reasonsToApply: string[] = [];
  const actionItems: string[] = [];

  let eligibilityScore = 0;
  const criteria = parseEligibilityCriteria(scheme.eligibilityCriteria);

  // Check CGPA requirements
  if (criteria.minCgpa !== null) {
    if (student.cgpa >= criteria.minCgpa) {
      matchingCriteria.push(`CGPA requirement (${criteria.minCgpa}+)`);
      eligibilityScore += 0.3;
      reasonsToApply.push(`Your CGPA of ${student.cgpa} meets the requirement`);
    } else {
      missingCriteria.push(`CGPA below ${criteria.minCgpa} (current: ${student.cgpa})`);
      actionItems.push(`Improve CGPA to at least ${criteria.minCgpa}`);
    }
  }

  // Check stream requirements
  if (criteria.requiredStream) {
    // Simple stream matching based on department
    const studentStream = inferStreamFromStudent(student);
    if (studentStream === criteria.requiredStream || criteria.requiredStream === 'Any Stream') {
      matchingCriteria.push(`Stream requirement (${criteria.requiredStream})`);
      eligibilityScore += 0.2;
    } else {
      missingCriteria.push(`Stream mismatch (required: ${criteria.requiredStream})`);
    }
  }

  // Check gender requirements
  if (criteria.genderRequirement) {
    // In a real app, you'd have gender in student data
    // For demo, we'll assume some students are female based on name
    const assumedGender = inferGenderFromName(student.name);
    if (assumedGender === criteria.genderRequirement || criteria.genderRequirement === 'Any') {
      matchingCriteria.push(`Gender eligibility`);
      eligibilityScore += 0.2;
    } else {
      missingCriteria.push(`Gender requirement not met`);
    }
  }

  // Check income criteria (simulated)
  if (criteria.maxIncome !== null) {
    // Simulate income eligibility - in real app this would be from student profile
    const simulatedIncomeEligible = student.cgpa < 8.5; // Lower CGPA might indicate need-based eligibility
    if (simulatedIncomeEligible) {
      matchingCriteria.push(`Income criteria likely met`);
      eligibilityScore += 0.15;
    } else {
      actionItems.push(`Verify family income eligibility (< ₹${criteria.maxIncome})`);
    }
  }

  // Check rural background (simulated)
  if (criteria.ruralBackground) {
    // Simulate based on some criteria
    const ruralEligible = student.id.includes('rural') || student.attendance < 85; // Demo logic
    if (ruralEligible) {
      matchingCriteria.push('Rural background');
      eligibilityScore += 0.15;
    } else {
      missingCriteria.push('Rural background required');
    }
  }

  // Bonus factors
  if (student.attendance >= 90) {
    eligibilityScore += 0.05;
    reasonsToApply.push('Excellent attendance record');
  }

  if (student.projects >= 3) {
    eligibilityScore += 0.05;
    reasonsToApply.push('Strong project portfolio');
  }

  if (student.internships && student.internships.length > 0) {
    eligibilityScore += 0.05;
    reasonsToApply.push('Relevant internship experience');
  }

  // Scheme-specific benefits
  if (scheme.type === 'Merit-based' && student.cgpa >= 8.0) {
    reasonsToApply.push('High CGPA qualifies for merit-based benefits');
  }

  if (scheme.type === 'Skill Development') {
    reasonsToApply.push('Valuable for career skill enhancement');
  }

  // Action items for improvement
  if (eligibilityScore < 0.7) {
    actionItems.push('Consider improving overall academic profile');
  }

  if (student.attendance < 85) {
    actionItems.push('Improve attendance to strengthen application');
  }

  // Determine recommendation level
  let recommendation: SchemeRecommendation['recommendation'];
  if (eligibilityScore >= 0.8) {
    recommendation = 'highly_recommended';
  } else if (eligibilityScore >= 0.6) {
    recommendation = 'recommended';
  } else if (eligibilityScore >= 0.3) {
    recommendation = 'partially_eligible';
  } else {
    recommendation = 'not_eligible';
  }

  return {
    scheme,
    eligibilityScore: Math.min(1, eligibilityScore),
    matchingCriteria,
    missingCriteria,
    recommendation,
    reasonsToApply,
    actionItems
  };
};

// Parse eligibility criteria string
const parseEligibilityCriteria = (criteria: string): {
  minCgpa: number | null;
  maxIncome: number | null;
  requiredStream: string | null;
  genderRequirement: string | null;
  ruralBackground: boolean;
} => {
  const result = {
    minCgpa: null as number | null,
    maxIncome: null as number | null,
    requiredStream: null as string | null,
    genderRequirement: null as string | null,
    ruralBackground: false
  };

  // Parse CGPA requirement
  const cgpaMatch = criteria.match(/CGPA\s*>\s*(\d+\.?\d*)/i);
  if (cgpaMatch) {
    result.minCgpa = parseFloat(cgpaMatch[1]);
  }

  // Parse income requirement
  const incomeMatch = criteria.match(/(\d+)\s*LPA/i);
  if (incomeMatch) {
    result.maxIncome = parseInt(incomeMatch[1]);
  }

  // Parse stream requirement
  if (criteria.includes('Technical Stream')) {
    result.requiredStream = 'Technical';
  } else if (criteria.includes('STEM')) {
    result.requiredStream = 'STEM';
  } else if (criteria.includes('Any Stream')) {
    result.requiredStream = 'Any Stream';
  }

  // Parse gender requirement
  if (criteria.includes('Female Students')) {
    result.genderRequirement = 'Female';
  }

  // Parse rural requirement
  if (criteria.includes('Rural Background')) {
    result.ruralBackground = true;
  }

  return result;
};

// Helper functions
const inferStreamFromStudent = (student: Student): string => {
  // In a real app, this would be in the student's department data
  return 'Technical'; // Default for demo
};

const inferGenderFromName = (name: string): 'Male' | 'Female' => {
  // Simple gender inference based on common names (for demo only)
  const femaleNames = ['Diya', 'Priya', 'Ananya', 'Sanya', 'Sneha'];
  const firstName = name.split(' ')[0];
  return femaleNames.includes(firstName) ? 'Female' : 'Male';
};

// Get trending schemes based on application patterns
export const getTrendingSchemes = (schemes: Scheme[]): Scheme[] => {
  return schemes
    .filter(scheme => scheme.status === 'Active')
    .sort((a, b) => {
      // Sort by utilization rate and recent activity
      const aUtilization = (a.beneficiaries / (a.budget / 4000)) * 100;
      const bUtilization = (b.beneficiaries / (b.budget / 4000)) * 100;
      return bUtilization - aUtilization;
    })
    .slice(0, 3);
};

// Get schemes by category for better organization
export const getSchemesByCategory = (schemes: Scheme[]) => {
  const categories = schemes.reduce((acc, scheme) => {
    if (!acc[scheme.type]) {
      acc[scheme.type] = [];
    }
    acc[scheme.type].push(scheme);
    return acc;
  }, {} as Record<string, Scheme[]>);

  return categories;
};

// Calculate scheme impact score
export const calculateSchemeImpact = (scheme: Scheme): {
  impactScore: number;
  utilizationRate: number;
  costPerBeneficiary: number;
  efficiency: 'high' | 'medium' | 'low';
} => {
  const utilizationRate = (scheme.beneficiaries / (scheme.budget / 4000)) * 100;
  const costPerBeneficiary = scheme.budget / scheme.beneficiaries;
  
  let impactScore = 0;
  
  // Factor in utilization rate (0-40 points)
  impactScore += Math.min(40, utilizationRate * 0.4);
  
  // Factor in number of beneficiaries (0-30 points)
  impactScore += Math.min(30, (scheme.beneficiaries / 1000) * 3);
  
  // Factor in cost efficiency (0-30 points)
  const avgCostPerBeneficiary = 50000; // Assumed average
  const efficiencyBonus = Math.max(0, 30 - ((costPerBeneficiary - avgCostPerBeneficiary) / avgCostPerBeneficiary) * 30);
  impactScore += efficiencyBonus;
  
  let efficiency: 'high' | 'medium' | 'low';
  if (impactScore >= 80) efficiency = 'high';
  else if (impactScore >= 60) efficiency = 'medium';
  else efficiency = 'low';

  return {
    impactScore: Math.round(impactScore),
    utilizationRate: Math.round(utilizationRate * 10) / 10,
    costPerBeneficiary: Math.round(costPerBeneficiary),
    efficiency
  };
};