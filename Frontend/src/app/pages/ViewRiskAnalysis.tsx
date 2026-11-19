import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { ArrowLeft, AlertTriangle, TrendingUp, DollarSign, User, Brain, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import {
    predictWithModel,
    getModelComparison,
    getModelComparisonSummary,
    getLoanApplication,
    RiskComparisonResult,
    RiskSummary,
    LoanApplication,
    forwardForReview,
    getShapExplanation,
    getRecommendedLoan
} from '@/app/services/api';

type ModelType = 'random_forest' | 'catboost' | 'lightgbm' | 'xgboost';

interface ModelPrediction {
    model: ModelType;
    modelName: string;
    riskScore: number;
    riskLevel: string;
    probability: number;
    confidence: 'High' | 'Medium' | 'Low';
    recommendedAmount: number;
}

interface FeatureInfluence {
    name: string;
    impact: number;
    direction: 'positive' | 'negative';
}

type RecommendedLoanResponse = {
    recommended_max_loan: number;
    original_requested: number;
    status: "ADJUSTED" | "REJECTED" | "NO_ADJUSTMENT_NEEDED";
    reason: string;
    reduction_amount?: number;
    reduction_percent?: number;
};
export function ViewRiskAnalysis() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedModel, setSelectedModel] = useState<ModelType>('random_forest');
    const [comparisonResults, setComparisonResults] = useState<RiskComparisonResult[]>([]);
    const [summary, setSummary] = useState<RiskSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [application, setApplication] = useState<LoanApplication | null>(null);
    const [recommendedLoan, setRecommendedLoan] =
        useState<RecommendedLoanResponse | null>(null);
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);

    const applicationId = Number(id);
    const analysisSessionId = application?.analysisSessionId;


    const loadComparison = async (sessionId: string) => {
        const comparison = await getModelComparison(sessionId);
        setComparisonResults(comparison);

        const summaryData = await getModelComparisonSummary(sessionId);
        setSummary(summaryData);
    };

    useEffect(() => {
        const init = async () => {
            if (!id) return;

            try {
                setLoading(true);

                // Step 1: Load the real application first
                const applicationData = await getLoanApplication(Number(id));
                setApplication(applicationData);

                const sessionId = applicationData.analysisSessionId;

                // Step 2: Run all models for THIS application
                await Promise.all([
                    predictWithModel(Number(id), "random_forest"),
                    predictWithModel(Number(id), "catboost"),
                    predictWithModel(Number(id), "lightgbm"),
                    predictWithModel(Number(id), "xgboost"),
                ]);

                // Step 3: Load comparison for THIS application session
                await loadComparison(sessionId);

                setSelectedModel("random_forest");
            } catch (error) {
                console.error(error);
                toast.error("Failed to load risk analysis");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [id]);

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

    useEffect(() => {
        const fetchRecommendedLoan = async () => {
            if (!application || !selectedModel) return;

            try {
                setLoadingRecommendation(true);

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

                const result = await getRecommendedLoan(selectedModel, payload);

                setRecommendedLoan(result);
            } catch (error) {
                console.error("Recommended loan error:", error);
            } finally {
                setLoadingRecommendation(false);
            }
        };

        fetchRecommendedLoan();
    }, [application, selectedModel]);

    const handleForwardForReview = async () => {
        try {
            await forwardForReview(applicationId);
            toast.success("Application forwarded for admin review");

            setApplication(prev =>
                prev ? { ...prev, status: "Pending Admin Review" } : prev
            );

            setTimeout(() => {
                navigate("/loan-officer/dashboard");
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error("Failed to forward application for review");
        }
    };

    const getRiskLevel = (score: number) => {
        if (score >= 80) return { label: 'Low Risk', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' };
        if (score >= 60) return { label: 'Moderate Risk', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' };
        return { label: 'High Risk', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' };
    };

    const modelNameMap: Record<ModelType, string> = {
        random_forest: "RandomForest",
        catboost: "CatBoost",
        lightgbm: "LightGBM",
        xgboost: "XGBoost",
    };

    const modelOrder: Record<ModelType, number> = {
        random_forest: 1,
        catboost: 2,
        lightgbm: 3,
        xgboost: 4,
    };

    const modelPredictions: ModelPrediction[] = comparisonResults.map((r) => {
        const model = r.modelUsed.toLowerCase() as ModelType;

        return {
            model,
            modelName: modelNameMap[model],
            riskScore: r.probability,
            riskLevel: r.riskLevel,
            probability: r.probability,
            confidence: "High",
            recommendedAmount: application?.loanAmount ?? 0,
        };
    })
    .sort((a, b) => (modelOrder[a.model] || 99) - (modelOrder[b.model] || 99));

    const currentPrediction =
        modelPredictions.find(p => p.model === selectedModel);

    const averageScore = summary?.averageProbability || 0;

    const allAgree =
        summary?.modelResults?.length
            ? summary.modelResults.every(r => r.riskLevel === summary.consensusRiskLevel)
            : false;

    const consensusLevel = getRiskLevel(averageScore);

    const expectedModels = ["random_forest", "catboost", "lightgbm", "xgboost"];

    const hasAllModels = expectedModels.every(model =>
        comparisonResults.some(r => r.modelUsed.toLowerCase() === model)
    );



    if (loading || comparisonResults.length < 4) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Running ML models...</p>
                </div>
            </Layout>
        );
    }

    if (!application || !currentPrediction) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading application details...</p>
                </div>
            </Layout>
        );
    }

    // Get feature influences from ML analysis
    const totalImpact = shapData.reduce((sum, f) => sum + Math.abs(f.shap), 0);

    const featureInfluences = shapData.map(f => ({
        name: f.feature,
        impact: totalImpact ? (Math.abs(f.shap) / totalImpact) * 50 : 0,
        effect: f.shap > 0 ? "decreases_risk" : "increases_risk"
    }));

    const maxImpact = Math.max(...featureInfluences.map(f => Math.abs(f.impact)));

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/loan-officer/dashboard')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-semibold text-gray-900">Multi-Model Risk Analysis</h1>
                        <p className="text-gray-500 mt-1">Application ID: {application?.id ?? id} • Powered by Machine Learning Models</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Risk Analysis */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Model Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-blue-600" />
                                    Model Selection
                                </CardTitle>
                                <CardDescription>Choose an ML model to view detailed predictions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs
                                    value={selectedModel}
                                    onValueChange={async (value) => {
                                        const model = value as ModelType;
                                        setSelectedModel(model);

                                        if (!applicationId) {
                                            toast.error("No application ID found.");
                                            return;
                                        }

                                        try {
                                            setLoading(true);
                                            const result = await predictWithModel(applicationId, model);
                                            await loadComparison(result.analysisSessionId);
                                            toast.success(`${model.toUpperCase()} prediction completed`);
                                        } catch (error) {
                                            console.error(error);
                                            toast.error(`Failed to predict with ${model}`);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                >
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="random_forest" className="gap-2">
                                            Random Forest
                                            {selectedModel === 'random_forest' && <CheckCircle2 className="h-4 w-4" />}
                                        </TabsTrigger>
                                        <TabsTrigger value="catboost" className="gap-2">
                                            CatBoost
                                            {selectedModel === 'catboost' && <CheckCircle2 className="h-4 w-4" />}
                                        </TabsTrigger>
                                        <TabsTrigger value="lightgbm" className="gap-2">
                                            LightGBM
                                            {selectedModel === 'lightgbm' && <CheckCircle2 className="h-4 w-4" />}
                                        </TabsTrigger>
                                        <TabsTrigger value="xgboost" className="gap-2">
                                            XGBoost
                                            {selectedModel === 'xgboost' && <CheckCircle2 className="h-4 w-4" />}
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Current Model Result */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{currentPrediction.modelName} Prediction</CardTitle>
                                <CardDescription>Risk assessment from {currentPrediction.modelName} model</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Risk Score */}
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-600">Risk Score</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-semibold text-gray-900">
                                                {Math.round(currentPrediction.riskScore)}
                                            </span>
                                            <span className="text-2xl text-gray-400">/100</span>
                                        </div>
                                        <Progress value={currentPrediction.riskScore} className="h-3" />
                                    </div>

                                    {/* Risk Level & Probability */}
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                                            <Badge className={`${getRiskLevel(currentPrediction.riskScore).color} text-white px-4 py-2 text-base`}>
                                                {currentPrediction.riskLevel}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Approval Probability</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {currentPrediction.probability.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Confidence */}
                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                    <Info className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm text-blue-900">
                                        Prediction Confidence: <strong>{currentPrediction.confidence}</strong>
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recommended Amount */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommended Maximum Loan</CardTitle>
                                <CardDescription>
                                    {recommendedLoan?.status === "ADJUSTED"
                                        ? "Adjusted for risk control"
                                        : "Not applicable for this applicant"}
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {!recommendedLoan ? (
                                    <p className="text-sm text-gray-500">Loading...</p>
                                ) : recommendedLoan.status === "NO_ADJUSTMENT_NEEDED" ? (
                                    <div className="text-2xl font-semibold text-gray-500">
                                        -
                                    </div>
                                ) : recommendedLoan.status === "REJECTED" ? (
                                    <div className="space-y-1">
                                        <div className="text-red-600 font-semibold text-lg">
                                            No safe loan possible
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {recommendedLoan.reason}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">

                                        {/* MAIN AMOUNT */}
                                        <div className="text-3xl font-semibold text-green-700">
                                            $ {Math.round(recommendedLoan.recommended_max_loan).toLocaleString()}
                                        </div>

                                        {/* INFO ROW */}
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">

                                            <div>
                                                <div className="text-gray-400 text-xs">Requested Loan</div>
                                                <div className="font-medium text-gray-900">
                                                    $ {(application?.loanAmount ?? 0).toLocaleString()}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-gray-400 text-xs">Adjustment</div>
                                                <div
                                                    className={
                                                        recommendedLoan.recommended_max_loan <
                                                            (application?.loanAmount ?? 0)
                                                            ? "text-red-500 font-medium"
                                                            : "text-green-600 font-medium"
                                                    }
                                                >
                                                    {(
                                                        recommendedLoan.recommended_max_loan -
                                                        (application?.loanAmount ?? 0)
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* REASON */}
                                        <div className="text-xs text-gray-500 border-t pt-2">
                                            {recommendedLoan.reason ?? "Based on ML risk simulation"}
                                        </div>

                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        

                        {/* Feature Explanation (SHAP) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    SHAP Feature Explanation
                                </CardTitle>
                                <CardDescription>Understand how each feature influences the prediction, improving transparency and supporting informed loan decisions.</CardDescription>
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
                                    {modelPredictions.map((prediction) => (
                                        <div
                                            key={prediction.model}
                                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedModel === prediction.model
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="min-w-[100px]">
                                                    <p className="font-semibold text-gray-900">{prediction.modelName}</p>
                                                    <p className="text-xs text-gray-500">Confidence: {prediction.confidence}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        className={`${getRiskLevel(prediction.riskScore).color} text-white px-3 py-1`}
                                                    >
                                                        {prediction.riskLevel}
                                                    </Badge>
                                                    <span className="text-sm text-gray-600">
                                                        Score: <strong>{Math.round(prediction.riskScore)}</strong>
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        Probability: <strong>{prediction.probability.toFixed(2)}%</strong>
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedModel === prediction.model && (
                                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
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
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
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
                                        <Badge className={`${consensusLevel.color} text-white px-3 py-1 text-base`}>
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
                    </div>

                    {/* Sidebar - Application Details */}
                    <div className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Application Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                                    {application?.status ?? "Risk Evaluated"}
                                </Badge>
                            </CardContent>
                        </Card>
                        {application.decisionReason && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-blue-600" />
                                        Administrative Decision
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-2">

                                        <Badge
                                            className={
                                                application.status === "Approved"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-red-500 text-white"
                                            }
                                        >
                                            {application.status}
                                        </Badge>

                                        <div className="p-4 rounded-lg bg-gray-50 border">
                                            <p className="text-sm text-gray-700">
                                                {application.decisionReason}
                                            </p>
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Applicant Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Applicant Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Applicant:</span>
                                    <span className="font-medium">{application.name}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Age:</span>
                                    <span className="font-medium">{application.age}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Occupation:</span>
                                    <span className="font-medium">{application.occupationStatus}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Years Employed:</span>
                                    <span className="font-medium">{application.yearsEmployed}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Annual Income:</span>
                                    <span className="font-medium">${application.annualIncome.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Credit Score:</span>
                                    <span className="font-medium">{application.creditScore}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Credit History:</span>
                                    <span className="font-medium">{application.creditHistoryYears} years</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Loan Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Loan Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Savings Assets:</span>
                                    <span className="font-medium">${application.savingsAssets.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Debt:</span>
                                    <span className="font-medium">${application.currentDebt.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Loan Amount:</span>
                                    <span className="font-medium">${application.loanAmount.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Product Type:</span>
                                    <span className="font-medium">{application.productType}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Loan Intent:</span>
                                    <span className="font-medium">{application.loanIntent}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Interest Rate:</span>
                                    <span className="font-medium">{application.interestRate}%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Risk Ratio Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Debt-to-Income:</span>
                                    <span className="font-medium">{(application.debtToIncomeRatio * 100).toFixed(1)}%</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Loan-to-Income:</span>
                                    <span className="font-medium">{(application.loanToIncomeRatio * 100).toFixed(1)}%</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment-to-Income:</span>
                                    <span className="font-medium">{(application.paymentToIncomeRatio * 100).toFixed(1)}%</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Defaults:</span>
                                    <span className="font-medium">{application.defaultsOnFile}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delinquencies:</span>
                                    <span className="font-medium">{application.delinquenciesLast2Yrs}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Derogatory Marks:</span>
                                    <span className="font-medium">{application.derogatoryMarks}</span>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Action */}
                        {application?.status === "Risk Evaluated" && (
                            <Button className="w-full" onClick={handleForwardForReview}>
                                Forward for Admin Review
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
