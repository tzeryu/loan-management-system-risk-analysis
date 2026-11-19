import { useEffect, useState } from 'react';
import {
    getLoanApplication,
    approveApplication,
    rejectApplication,
    getModelComparison,
    getModelComparisonSummary,
    LoanApplication,
    RiskComparisonResult,
    RiskSummary,
    getShapExplanation,
    getRecommendedLoan
} from '@/app/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, DollarSign, User, FileText, Brain, TrendingUp, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

type ModelType = 'random_forest' | 'catboost' | 'lightgbm' | 'xgboost';

const MODEL_LABELS: Record<ModelType, string> = {
    random_forest: 'Random Forest',
    catboost: 'CatBoost',
    lightgbm: 'LightGBM',
    xgboost: 'XGBoost'
};
interface FeatureInfluence {
    name: string;
    impact: number;
    direction: 'positive' | 'negative';
}

export function ReviewApplication() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [decisionReason, setDecisionReason] = useState('');
    const [selectedModel, setSelectedModel] = useState<ModelType>('random_forest');

    const [application, setApplication] = useState<LoanApplication | null>(null);
    const [comparisonResults, setComparisonResults] = useState<RiskComparisonResult[]>([]);
    const [summary, setSummary] = useState<RiskSummary | null>(null);
    const [recommendedLoan, setRecommendedLoan] = useState<any>(null);
    const modelPredictions = comparisonResults.map((r) => ({
        model: r.modelUsed.toLowerCase() as ModelType,
        modelName: MODEL_LABELS[r.modelUsed] || r.modelUsed,
        probability: r.probability,
        riskScore: r.probability,
        riskLevel: r.riskLevel,
        confidence: "High",
        recommendedMaxAmount: application?.loanAmount ?? 0,
    }));

    const currentPrediction =
        modelPredictions.find(p => p.model === selectedModel);

    const averageScore = summary?.averageProbability || 0;

    const allAgree =
        summary?.modelResults?.length
            ? summary.modelResults.every(r => r.riskLevel === summary.consensusRiskLevel)
            : false;

    const getRiskLevel = (score: number) => {
        if (score >= 80) return { label: 'Low Risk', color: 'bg-green-500', icon: CheckCircle, textColor: 'text-green-700', bgLight: 'bg-green-50' };
        if (score >= 60) return { label: 'Moderate Risk', color: 'bg-yellow-500', icon: AlertTriangle, textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' };
        return { label: 'High Risk', color: 'bg-red-500', icon: XCircle, textColor: 'text-red-700', bgLight: 'bg-red-50' };
    };

    const riskLevel = getRiskLevel(currentPrediction?.riskScore ?? 0);
    const RiskIcon = riskLevel.icon;
    const consensusLevel = getRiskLevel(averageScore);

    

    useEffect(() => {
        const loadApplication = async () => {
            if (!id) return;

            try {
                const data = await getLoanApplication(Number(id));
                setApplication(data);
                const sessionId = data.analysisSessionId;

                const comparison = await getModelComparison(sessionId);
                setComparisonResults(comparison);

                const summaryData = await getModelComparisonSummary(sessionId);
                setSummary(summaryData);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load application");
            }
        };

        loadApplication();
    }, [id]);

    const loadRecommendedLoan = async () => {
        try {
            const payload = {
                age: application.age,
                occupation_status: application.occupationStatus,
                years_employed: application.yearsEmployed,
                annual_income: application.annualIncome,
                credit_score: application.creditScore,
                credit_history_years: application.creditHistoryYears,
                savings_assets: application.savingsAssets,
                current_debt: application.currentDebt,
                defaults_on_file: application.defaultsOnFile,
                delinquencies_last_2yrs: application.delinquenciesLast2Yrs,
                derogatory_marks: application.derogatoryMarks,
                product_type: application.productType,
                loan_intent: application.loanIntent,
                loan_amount: application.loanAmount,
                interest_rate: application.interestRate,
                debt_to_income_ratio: application.debtToIncomeRatio,
                loan_to_income_ratio: application.loanToIncomeRatio,
                payment_to_income_ratio: application.paymentToIncomeRatio
            };

            const res = await getRecommendedLoan(selectedModel, payload);
            setRecommendedLoan(res);

        } catch (err) {
            console.error("Recommended loan error:", err);
        }
    };

    useEffect(() => {
        if (application) {
            loadRecommendedLoan();
        }
    }, [application, selectedModel]);

    const [shapData, setShapData] = useState<any[]>([]);

    useEffect(() => {
        const loadShap = async () => {
            if (!application || !selectedModel) return;

            try {
                const payload = {
                    age: application.age,
                    occupation_status: application.occupationStatus,
                    years_employed: application.yearsEmployed,
                    annual_income: application.annualIncome,
                    credit_score: application.creditScore,
                    credit_history_years: application.creditHistoryYears,
                    savings_assets: application.savingsAssets,
                    current_debt: application.currentDebt,
                    defaults_on_file: application.defaultsOnFile,
                    delinquencies_last_2yrs: application.delinquenciesLast2Yrs,
                    derogatory_marks: application.derogatoryMarks,
                    product_type: application.productType,
                    loan_intent: application.loanIntent,
                    loan_amount: application.loanAmount,
                    interest_rate: application.interestRate,
                    debt_to_income_ratio: application.debtToIncomeRatio,
                    loan_to_income_ratio: application.loanToIncomeRatio,
                    payment_to_income_ratio: application.paymentToIncomeRatio
                };

                const data = await getShapExplanation(selectedModel, payload);
                setShapData(data);
            } catch (error) {
                console.error("SHAP failed:", error);
                setShapData([]);
            }
        };

        loadShap();
    }, [application, selectedModel]);

    if (!application) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading application...</p>
                    <p className="text-xs text-gray-400 mt-2">Application ID: {id}</p>
                    <Button onClick={() => navigate('/admin/dashboard')} className="mt-4">
                        Back to Dashboard
                    </Button>
                </div>
            </Layout>
        );
    }

    const canDecide = application.status === "Pending Admin Review";

    const handleApprove = async () => {
        if (!decisionReason.trim()) {
            toast.error('Please provide a reason for your decision');
            return;
        }

        try {
            await approveApplication(
                Number(id),
                decisionReason
            );
            toast.success('Loan application approved');

            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error("Failed to approve application");
        }
    };

    const handleReject = async () => {
        if (!decisionReason.trim()) {
            toast.error('Please provide a reason for your decision');
            return;
        }

        try {
            await rejectApplication(
                Number(id),
                decisionReason
            );
            toast.success('Loan application rejected');

            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject application");
        }
    };
    

    // Get feature influences from ML analysis
    const totalImpact = shapData.reduce((sum, f) => sum + Math.abs(f.shap), 0);

    const featureInfluences = shapData.map(f => ({
        name: f.feature,
        impact: totalImpact ? (Math.abs(f.shap) / totalImpact) * 50 : 0,
        effect: f.shap > 0 ? "decreases_risk" : "increases_risk"
    }));

    const getTimelineSteps = (status: string) => {
        const isApprovedOrRejected = status === "Approved" || status === "Rejected";

        return [
            {
                label: "Application Submitted",
                completed: true,
                date: application.createdAt ?? "-"
            },
            {
                label: "Risk Analysis Completed",
                completed: ["Risk Evaluated", "Pending Admin Review", "Approved", "Rejected"].includes(status),
                date: application.updatedAt ?? "-"
            },
            {
                label: "Forwarded for Admin Review",
                completed: ["Pending Admin Review", "Approved", "Rejected"].includes(status),
                date: application.updatedAt ?? "-"
            },
            {
                label: isApprovedOrRejected ? `Final Decision: ${status}` : "Final Decision",
                completed: isApprovedOrRejected,
                date: isApprovedOrRejected ? application.updatedAt ?? "-" : "-"
            }
        ];
    };


    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/admin/dashboard')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-semibold text-gray-900">Review Loan Application</h1>
                        <p className="text-gray-500 mt-1">
                            Application ID: {application.id}
                            {comparisonResults.length > 0 && ' • Multi-Model Risk Analysis Available'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Applicant Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Applicant Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Applicant</span>
                                        <p className="font-medium text-gray-900 mt-1">{application.name}</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Age</span>
                                        <p className="font-medium text-gray-900 mt-1">{application.age}</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Occupation Status</span>
                                        <p className="font-medium text-gray-900 mt-1">{application.occupationStatus}</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Years Employed</span>
                                        <p className="font-medium text-gray-900 mt-1">{application.yearsEmployed}</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Annual Income</span>
                                        <p className="font-medium text-gray-900 mt-1">${application.annualIncome.toLocaleString()}</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Credit Score</span>
                                        <p className="font-medium text-gray-900 mt-1">{application.creditScore}</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Credit History</span>
                                        <p className="font-medium text-gray-900 mt-1">{application.creditHistoryYears} years</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Savings Assets</span>
                                        <p className="font-medium text-gray-900 mt-1">${application.savingsAssets.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Loan Request Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Loan Request Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Requested Amount</span>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1">
                                            ${application.loanAmount.toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Product Type</span>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1">
                                            {application.productType}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Loan Intent</span>
                                        <p className="font-medium text-gray-900 mt-1">{application.loanIntent}</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Interest Rate</span>
                                        <p className="font-medium text-gray-900 mt-1">{application.interestRate}%</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Current Debt</span>
                                        <p className="font-medium text-gray-900 mt-1">${application.currentDebt.toLocaleString()}</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Payment-to-Income Ratio</span>
                                        <p className="font-medium text-gray-900 mt-1">
                                            {(application.paymentToIncomeRatio * 100).toFixed(1)}%
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Submitted Date</span>
                                        <p className="font-medium text-gray-900 mt-1">{application.createdAt ?? "-"}</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Last Updated</span>
                                        <p className="font-medium text-gray-900 mt-1">{application.updatedAt ?? "-"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Multi-Model Risk Analysis */}
                        {comparisonResults.length > 0 && currentPrediction && (
                            <>
                                {/* Model Selection */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Brain className="h-5 w-5 text-blue-600" />
                                            Multi-Model Risk Analysis
                                        </CardTitle>
                                        <CardDescription>ML-based risk assessment from three ensemble models</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs value={selectedModel} onValueChange={(value) => setSelectedModel(value as ModelType)}>
                                            <TabsList className="grid w-full grid-cols-4">
                                                <TabsTrigger value="random_forest">Random Forest</TabsTrigger>
                                                <TabsTrigger value="catboost">CatBoost</TabsTrigger>
                                                <TabsTrigger value="lightgbm">LightGBM</TabsTrigger>
                                                <TabsTrigger value="xgboost">XGBoost</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </CardContent>
                                </Card>

                                {/* Current Model Result */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{currentPrediction?.modelName} Prediction</CardTitle>
                                        <CardDescription>Risk assessment from {currentPrediction?.modelName} model</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Risk Score */}
                                            <div className="space-y-3">
                                                <p className="text-sm text-gray-600">Risk Score</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-semibold text-gray-900">
                                                        {Math.round(currentPrediction?.riskScore || 0)}
                                                    </span>
                                                    <span className="text-2xl text-gray-400">/100</span>
                                                </div>
                                                <Progress value={currentPrediction?.riskScore || 0} className="h-3" />
                                            </div>

                                            {/* Risk Level & Probability */}
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                                                    <Badge className={`${riskLevel.color} text-white px-4 py-2 text-base flex items-center gap-2 w-fit`}>
                                                        <RiskIcon className="h-4 w-4" />
                                                        {currentPrediction?.riskLevel}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">Approval Probability</p>
                                                    <p className="text-2xl font-semibold text-gray-900">
                                                        {currentPrediction?.probability.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Confidence */}
                                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                            <Info className="h-5 w-5 text-blue-600" />
                                            <span className="text-sm text-blue-900">
                                                Prediction Confidence: <strong>{currentPrediction?.confidence}</strong>
                                            </span>
                                        </div>

                                        {/* Recommended Amount */}
                                        {recommendedLoan && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Recommended Maximum Loan</CardTitle>
                                                    <CardDescription>
                                                        AI-based risk-adjusted lending limit
                                                    </CardDescription>
                                                </CardHeader>

                                                <CardContent>
                                                    {recommendedLoan.status === "REJECTED" ? (
                                                        <div className="text-red-600 font-semibold">
                                                            {recommendedLoan.reason}
                                                        </div>
                                                    ) : recommendedLoan.status === "NO_ADJUSTMENT_NEEDED" ? (
                                                        <div className="text-gray-500 text-2xl font-semibold">
                                                            -
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="text-3xl font-bold text-green-700">
                                                                ${Math.round(recommendedLoan.recommended_max_loan).toLocaleString()}
                                                            </div>

                                                            <div className="text-sm text-gray-600">
                                                                Requested: ${application.loanAmount.toLocaleString()}
                                                            </div>

                                                            <div className="text-sm font-medium text-gray-500">
                                                                {recommendedLoan.reason}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Feature Influence Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-blue-600" />
                                            SHAP Feature Explanation
                                        </CardTitle>
                                        <CardDescription>How each factor impacts the risk prediction</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {featureInfluences.length === 0 && (
                                            <p className="text-sm text-gray-500">
                                                SHAP explanation is not available for this model yet.
                                            </p>
                                        )}
                                        {featureInfluences.map((feature, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-700">{feature.name}</span>
                                                    <span className={`text-sm font-semibold ${feature.effect === "increases_risk" ? "text-red-600" : "text-green-600"
                                                        }`}>
                                                        {feature.effect === "increases_risk" ? "↑" : "↓"} {Math.abs(feature.impact).toFixed(1)}% impact
                                                    </span>
                                                </div>
                                                <div className="relative h-6 bg-gray-100 rounded">
                                                    <div
                                                        className={`absolute h-full rounded ${feature.effect === "increases_risk" ? "bg-red-500" : "bg-green-500"
                                                            }`}
                                                        style={{
                                                            width: `${Math.min(Math.abs(feature.impact), 50)}%`,
                                                            left: feature.effect === "increases_risk" ? "50%" : "auto",
                                                            right: feature.effect === "decreases_risk" ? "50%" : "auto",
                                                        }}
                                                    />
                                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400" />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-green-500 rounded" />
                                                <span>Decreases risk</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-red-500 rounded" />
                                                <span>Increases risk</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Model Comparison */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Compare All Models</CardTitle>
                                        <CardDescription>Side-by-side comparison of all ML model predictions</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {modelPredictions.map((currentPrediction) => (
                                                <div
                                                    key={currentPrediction.model}
                                                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedModel === currentPrediction.model
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="min-w-[100px]">
                                                            <p className="font-semibold text-gray-900">{currentPrediction.modelName}</p>
                                                            <p className="text-xs text-gray-500">Confidence: {currentPrediction.confidence}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <Badge
                                                                className={`${getRiskLevel(currentPrediction.riskScore).color} text-white px-3 py-1`}
                                                            >
                                                                {currentPrediction.riskLevel}
                                                            </Badge>
                                                            <span className="text-sm text-gray-600">
                                                                Score: <strong>{Math.round(currentPrediction.riskScore)}</strong>
                                                            </span>
                                                            <span className="text-sm text-gray-600">
                                                                Probability: <strong>{currentPrediction.probability.toFixed(2)}%</strong>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {selectedModel === currentPrediction.model && (
                                                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Consensus Result */}
                                <Card className={`border-2 ${allAgree ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {allAgree ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                            )}
                                            Consensus Analysis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Average Risk Score</p>
                                                <p className="text-3xl font-semibold text-gray-900">
                                                    {Math.round(averageScore)}<span className="text-lg text-gray-400">/100</span>
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Consensus Decision</p>
                                                <Badge className={`${consensusLevel.color} text-white px-3 py-1 text-base flex items-center gap-2 w-fit`}>
                                                    {consensusLevel.label}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-lg ${allAgree ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                            <p className={`text-sm font-medium ${allAgree ? 'text-green-900' : 'text-yellow-900'}`}>
                                                {allAgree
                                                    ? '✓ All models agree → High confidence decision'
                                                    : '⚠ Models show variation → Additional review recommended'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        
                        {/* Decision Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Decision & Reasoning</CardTitle>
                                <CardDescription>
                                    Review the multi-model analysis above to inform your decision
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* ML Analysis Summary for Decision Support */}                                
                                {comparisonResults.length > 0 && currentPrediction && (
                                    <div className={`p-4 rounded-lg border-2 ${allAgree && consensusLevel.label === 'Low Risk' ? 'border-green-300 bg-green-50' :
                                            allAgree && consensusLevel.label === 'High Risk' ? 'border-red-300 bg-red-50' :
                                                'border-yellow-300 bg-yellow-50'
                                        }`}>
                                        <p className="text-sm font-semibold text-gray-900 mb-2">ML Analysis Recommendation:</p>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-gray-700">
                                                • Consensus: <strong>{consensusLevel.label}</strong> (Avg Score: {Math.round(averageScore)}/100)
                                            </p>
                                            <p className="text-gray-700">
                                                • Models Agreement: <strong>{allAgree ? 'Yes' : 'No'}</strong> ({allAgree ? 'High confidence' : 'Review recommended'})
                                            </p>
                                            <p className="text-gray-700">
                                                • Selected Model ({currentPrediction?.modelName}): <strong>{currentPrediction?.probability.toFixed(2)}%</strong> approval probability
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {!canDecide && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        {application.status === "Approved" || application.status === "Rejected"
                                            ? "This application has already received a final decision and can no longer be modified."
                                            : "This application must be forwarded by a loan officer before approval or rejection."}
                                    </p>
                                )}
                                {canDecide && (
                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Decision Reason *</Label>
                                        <Textarea
                                            id="reason"
                                            placeholder="Enter the reason for your decision..."
                                            value={decisionReason}
                                            onChange={(e) => setDecisionReason(e.target.value)}
                                            rows={4}
                                            className="resize-none"
                                        />
                                    </div>
                                )}

                                {canDecide && (
                                    <>
                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={handleApprove}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve Loan
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={handleReject}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject Loan
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Current Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Current Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge
                                    variant="outline"
                                    className={`${application.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                            application.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-purple-50 text-purple-700 border-purple-200'
                                        } px-3 py-1`}
                                >
                                    {application.status}
                                </Badge>
                            </CardContent>
                        </Card>
                        {application.decisionReason && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Decision Reason</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                        <p className="text-sm text-gray-700">
                                            {application.decisionReason}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Quick Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Debt-to-Income Ratio</span>
                                    <span className="font-medium">
                                        {(application.debtToIncomeRatio * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Loan-to-Income Ratio</span>
                                    <span className="font-medium">
                                        {(application.loanToIncomeRatio * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Total Financial Burden</span>
                                    <span className="font-medium">
                                        ${(application.currentDebt + application.loanAmount).toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                                               
                        {/* Action History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Application Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                {getTimelineSteps(application.status).map((step, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div
                                            className={`rounded-full h-2 w-2 mt-1.5 flex-shrink-0 ${step.completed ? "bg-green-500" : "bg-gray-300"
                                                }`}
                                        />
                                        <div>
                                            <p className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-500"}`}>
                                                {step.label}
                                            </p>
                                            <p className="text-gray-500">{step.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
