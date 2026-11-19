// Mock data for the Loan Management System

export interface InfluentialFactor {
  factorName: string;
  impactPercentage: number;
  direction: 'increases' | 'decreases';
}

export interface ModelPrediction {
  modelName: string;
  riskScore: number;
  approvalProbability: number;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  confidence: 'High' | 'Medium' | 'Low';
  topInfluentialFactors: InfluentialFactor[];
  recommendedMaxAmount: number;
}

export interface ConsensusResult {
  averageRiskScore: number;
  consensusRiskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  modelsAgree: boolean;
  recommendationMessage: string;
}

export interface MLAnalysis {
  analysisSessionId: string;
  selectedModel: 'catboost' | 'lightgbm' | 'xgboost';
  modelPredictions: {
    catboost: ModelPrediction;
    lightgbm: ModelPrediction;
    xgboost: ModelPrediction;
  };
  consensusResult: ConsensusResult;
}

export interface LoanApplication {
  id: string;
  applicantName: string;
  age: number;
  employmentStatus: string;
  monthlyIncome: number;
  dependents: number;
  existingLiabilities: number;
  creditHistory: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  loanAmount: number;
  loanTenure: number;
  loanPurpose: string;
  status: 'Submitted' | 'Under Review' | 'Risk Evaluated' | 'Approved' | 'Rejected';
  riskScore?: number;
  recommendedMaxAmount?: number;
  submittedDate: string;
  lastUpdated: string;
  mlAnalysis?: MLAnalysis;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: 'Loan Officer' | 'Administrator';
  userName: string;
  action: string;
  applicationId: string;
}

export interface SystemUser {
  id: string;
  username: string;
  role: 'Loan Officer' | 'Administrator';
  accountStatus: 'Active' | 'Inactive';
  createdDate: string;
}

// Helper function to generate ML analysis
const generateMLAnalysis = (
  baseScore: number,
  loanAmount: number,
  creditHistory: string,
  monthlyIncome: number,
  existingLiabilities: number,
  employmentStatus: string
): MLAnalysis => {
  const getRiskLevel = (score: number): 'Low Risk' | 'Moderate Risk' | 'High Risk' => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Moderate Risk';
    return 'High Risk';
  };

  const getConfidence = (score: number): 'High' | 'Medium' | 'Low' => {
    if (score >= 80 || score <= 45) return 'High';
    if (score >= 65 || score <= 55) return 'Medium';
    return 'Low';
  };

  const creditScore = creditHistory === 'Excellent' ? 95 : creditHistory === 'Good' ? 75 : creditHistory === 'Fair' ? 50 : 30;
  const dtiRatio = (existingLiabilities / monthlyIncome) * 100;

  const generateFactors = (): InfluentialFactor[] => [
    {
      factorName: 'Credit History',
      impactPercentage: creditScore > 70 ? 15 : 12,
      direction: creditScore > 70 ? 'decreases' : 'increases',
    },
    {
      factorName: 'Debt-to-Income Ratio',
      impactPercentage: dtiRatio > 40 ? 10 : 8,
      direction: dtiRatio > 40 ? 'increases' : 'decreases',
    },
    {
      factorName: 'Monthly Income',
      impactPercentage: monthlyIncome > 6000 ? 12 : 5,
      direction: monthlyIncome > 6000 ? 'decreases' : 'increases',
    },
    {
      factorName: 'Employment Status',
      impactPercentage: employmentStatus.includes('Full-Time') ? 10 : 8,
      direction: employmentStatus.includes('Full-Time') ? 'decreases' : 'increases',
    },
    {
      factorName: 'Loan Amount',
      impactPercentage: loanAmount > 70000 ? 7 : 5,
      direction: loanAmount > 70000 ? 'increases' : 'decreases',
    },
  ];

  const catboostScore = baseScore;
  const lightgbmScore = Math.min(100, Math.max(0, baseScore - 2));
  const xgboostScore = Math.min(100, Math.max(0, baseScore + 1));

  const avgScore = (catboostScore + lightgbmScore + xgboostScore) / 3;
  const consensusLevel = getRiskLevel(avgScore);
  const allAgree = getRiskLevel(catboostScore) === getRiskLevel(lightgbmScore) && getRiskLevel(lightgbmScore) === getRiskLevel(xgboostScore);

  return {
    analysisSessionId: `AS-${Math.random().toString(36).substr(2, 9)}`,
    selectedModel: 'catboost',
    modelPredictions: {
      catboost: {
        modelName: 'CatBoost',
        riskScore: catboostScore,
        approvalProbability: catboostScore / 100,
        riskLevel: getRiskLevel(catboostScore),
        confidence: getConfidence(catboostScore),
        topInfluentialFactors: generateFactors(),
        recommendedMaxAmount: loanAmount * 1.1,
      },
      lightgbm: {
        modelName: 'LightGBM',
        riskScore: lightgbmScore,
        approvalProbability: lightgbmScore / 100,
        riskLevel: getRiskLevel(lightgbmScore),
        confidence: getConfidence(lightgbmScore),
        topInfluentialFactors: generateFactors(),
        recommendedMaxAmount: loanAmount * 1.08,
      },
      xgboost: {
        modelName: 'XGBoost',
        riskScore: xgboostScore,
        approvalProbability: xgboostScore / 100,
        riskLevel: getRiskLevel(xgboostScore),
        confidence: getConfidence(xgboostScore),
        topInfluentialFactors: generateFactors(),
        recommendedMaxAmount: loanAmount * 1.12,
      },
    },
    consensusResult: {
      averageRiskScore: Math.round(avgScore),
      consensusRiskLevel: consensusLevel,
      modelsAgree: allAgree,
      recommendationMessage: allAgree
        ? 'All models agree → High confidence decision'
        : 'Models show variation → Additional review recommended',
    },
  };
};

export const mockApplications: LoanApplication[] = [
  {
    id: 'LA-2026-001',
    applicantName: 'John Smith',
    age: 35,
    employmentStatus: 'Employed Full-Time',
    monthlyIncome: 5500,
    dependents: 2,
    existingLiabilities: 15000,
    creditHistory: 'Good',
    loanAmount: 50000,
    loanTenure: 60,
    loanPurpose: 'Home Improvement',
    status: 'Risk Evaluated',
    riskScore: 72,
    recommendedMaxAmount: 55000,
    submittedDate: '2026-01-28',
    lastUpdated: '2026-02-01',
    mlAnalysis: generateMLAnalysis(72, 50000, 'Good', 5500, 15000, 'Employed Full-Time'),
  },
  {
    id: 'LA-2026-002',
    applicantName: 'Sarah Johnson',
    age: 28,
    employmentStatus: 'Employed Full-Time',
    monthlyIncome: 6200,
    dependents: 0,
    existingLiabilities: 8000,
    creditHistory: 'Excellent',
    loanAmount: 35000,
    loanTenure: 48,
    loanPurpose: 'Vehicle Purchase',
    status: 'Approved',
    riskScore: 85,
    recommendedMaxAmount: 45000,
    submittedDate: '2026-01-25',
    lastUpdated: '2026-01-30',
    mlAnalysis: generateMLAnalysis(85, 35000, 'Excellent', 6200, 8000, 'Employed Full-Time'),
  },
  {
    id: 'LA-2026-003',
    applicantName: 'Michael Davis',
    age: 42,
    employmentStatus: 'Self-Employed',
    monthlyIncome: 7800,
    dependents: 3,
    existingLiabilities: 25000,
    creditHistory: 'Fair',
    loanAmount: 75000,
    loanTenure: 84,
    loanPurpose: 'Business Expansion',
    status: 'Submitted',
    submittedDate: '2026-02-02',
    lastUpdated: '2026-02-02',
  },
  {
    id: 'LA-2026-004',
    applicantName: 'Emily Wilson',
    age: 31,
    employmentStatus: 'Employed Full-Time',
    monthlyIncome: 4800,
    dependents: 1,
    existingLiabilities: 12000,
    creditHistory: 'Good',
    loanAmount: 40000,
    loanTenure: 60,
    loanPurpose: 'Debt Consolidation',
    status: 'Under Review',
    riskScore: 68,
    recommendedMaxAmount: 38000,
    submittedDate: '2026-01-30',
    lastUpdated: '2026-02-01',
    mlAnalysis: generateMLAnalysis(68, 40000, 'Good', 4800, 12000, 'Employed Full-Time'),
  },
  {
    id: 'LA-2026-005',
    applicantName: 'Robert Martinez',
    age: 55,
    employmentStatus: 'Employed Full-Time',
    monthlyIncome: 9500,
    dependents: 2,
    existingLiabilities: 18000,
    creditHistory: 'Excellent',
    loanAmount: 100000,
    loanTenure: 120,
    loanPurpose: 'Home Purchase',
    status: 'Risk Evaluated',
    riskScore: 78,
    recommendedMaxAmount: 110000,
    submittedDate: '2026-01-22',
    lastUpdated: '2026-01-29',
    mlAnalysis: generateMLAnalysis(78, 100000, 'Excellent', 9500, 18000, 'Employed Full-Time'),
  },
  {
    id: 'LA-2026-006',
    applicantName: 'Jennifer Brown',
    age: 38,
    employmentStatus: 'Employed Part-Time',
    monthlyIncome: 3200,
    dependents: 2,
    existingLiabilities: 22000,
    creditHistory: 'Poor',
    loanAmount: 30000,
    loanTenure: 48,
    loanPurpose: 'Personal Use',
    status: 'Rejected',
    riskScore: 42,
    recommendedMaxAmount: 15000,
    submittedDate: '2026-01-20',
    lastUpdated: '2026-01-27',
    mlAnalysis: generateMLAnalysis(42, 30000, 'Poor', 3200, 22000, 'Employed Part-Time'),
  },
  {
    id: 'LA-2026-007',
    applicantName: 'David Lee',
    age: 45,
    employmentStatus: 'Employed Full-Time',
    monthlyIncome: 8200,
    dependents: 1,
    existingLiabilities: 10000,
    creditHistory: 'Excellent',
    loanAmount: 60000,
    loanTenure: 72,
    loanPurpose: 'Education',
    status: 'Approved',
    riskScore: 88,
    recommendedMaxAmount: 70000,
    submittedDate: '2026-01-18',
    lastUpdated: '2026-01-26',
    mlAnalysis: generateMLAnalysis(88, 60000, 'Excellent', 8200, 10000, 'Employed Full-Time'),
  },
  {
    id: 'LA-2026-008',
    applicantName: 'Amanda Taylor',
    age: 29,
    employmentStatus: 'Employed Full-Time',
    monthlyIncome: 5100,
    dependents: 0,
    existingLiabilities: 7000,
    creditHistory: 'Good',
    loanAmount: 25000,
    loanTenure: 36,
    loanPurpose: 'Home Improvement',
    status: 'Submitted',
    submittedDate: '2026-02-03',
    lastUpdated: '2026-02-03',
  },
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'AL-001',
    timestamp: '2026-02-03 10:15:23',
    userRole: 'Loan Officer',
    userName: 'Alice Cooper',
    action: 'Created Loan Application',
    applicationId: 'LA-2026-008',
  },
  {
    id: 'AL-002',
    timestamp: '2026-02-02 14:32:10',
    userRole: 'Loan Officer',
    userName: 'Bob Anderson',
    action: 'Created Loan Application',
    applicationId: 'LA-2026-003',
  },
  {
    id: 'AL-003',
    timestamp: '2026-02-01 16:45:55',
    userRole: 'Loan Officer',
    userName: 'Alice Cooper',
    action: 'Forwarded for Admin Review',
    applicationId: 'LA-2026-001',
  },
  {
    id: 'AL-004',
    timestamp: '2026-02-01 11:22:18',
    userRole: 'Loan Officer',
    userName: 'Charlie Wilson',
    action: 'Risk Analysis Completed',
    applicationId: 'LA-2026-004',
  },
  {
    id: 'AL-005',
    timestamp: '2026-01-30 09:18:42',
    userRole: 'Administrator',
    userName: 'Diana Ross',
    action: 'Approved Loan Application',
    applicationId: 'LA-2026-002',
  },
  {
    id: 'AL-006',
    timestamp: '2026-01-29 15:30:25',
    userRole: 'Loan Officer',
    userName: 'Alice Cooper',
    action: 'Risk Analysis Completed',
    applicationId: 'LA-2026-005',
  },
  {
    id: 'AL-007',
    timestamp: '2026-01-27 13:45:12',
    userRole: 'Administrator',
    userName: 'Edward Grant',
    action: 'Rejected Loan Application',
    applicationId: 'LA-2026-006',
  },
  {
    id: 'AL-008',
    timestamp: '2026-01-26 10:55:33',
    userRole: 'Administrator',
    userName: 'Diana Ross',
    action: 'Approved Loan Application',
    applicationId: 'LA-2026-007',
  },
  {
    id: 'AL-009',
    timestamp: '2026-01-25 14:20:45',
    userRole: 'Loan Officer',
    userName: 'Bob Anderson',
    action: 'Created Loan Application',
    applicationId: 'LA-2026-002',
  },
  {
    id: 'AL-010',
    timestamp: '2026-01-22 11:10:28',
    userRole: 'Loan Officer',
    userName: 'Charlie Wilson',
    action: 'Created Loan Application',
    applicationId: 'LA-2026-005',
  },
];

export const mockUsers: SystemUser[] = [
  {
    id: 'USR-001',
    username: 'alice.cooper',
    role: 'Loan Officer',
    accountStatus: 'Active',
    createdDate: '2025-01-15',
  },
  {
    id: 'USR-002',
    username: 'bob.anderson',
    role: 'Loan Officer',
    accountStatus: 'Active',
    createdDate: '2025-02-10',
  },
  {
    id: 'USR-003',
    username: 'charlie.wilson',
    role: 'Loan Officer',
    accountStatus: 'Active',
    createdDate: '2025-03-05',
  },
  {
    id: 'USR-004',
    username: 'diana.ross',
    role: 'Administrator',
    accountStatus: 'Active',
    createdDate: '2024-11-20',
  },
  {
    id: 'USR-005',
    username: 'edward.grant',
    role: 'Administrator',
    accountStatus: 'Active',
    createdDate: '2024-12-01',
  },
  {
    id: 'USR-006',
    username: 'frank.miller',
    role: 'Loan Officer',
    accountStatus: 'Inactive',
    createdDate: '2025-01-08',
  },
  {
    id: 'USR-007',
    username: 'grace.hopper',
    role: 'Loan Officer',
    accountStatus: 'Active',
    createdDate: '2025-04-12',
  },
  {
    id: 'USR-008',
    username: 'henry.ford',
    role: 'Administrator',
    accountStatus: 'Inactive',
    createdDate: '2024-10-15',
  },
];