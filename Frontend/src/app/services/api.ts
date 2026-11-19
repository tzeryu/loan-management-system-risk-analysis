const API_BASE_URL = "https://localhost:7234/api";
const ML_API_BASE_URL = "http://127.0.0.1:8000";

export type LoanApplication = {
    id: number;

    age: number;
    occupationStatus: string;
    yearsEmployed: number;
    annualIncome: number;
    creditScore: number;
    creditHistoryYears: number;
    savingsAssets: number;
    currentDebt: number;
    defaultsOnFile: number;
    delinquenciesLast2Yrs: number;
    derogatoryMarks: number;
    productType: string;
    loanIntent: string;
    loanAmount: number;
    interestRate: number;
    debtToIncomeRatio: number;
    loanToIncomeRatio: number;
    paymentToIncomeRatio: number;

    modelType: string;
    analysisSessionId: string;

    status: string;
    createdAt: string;
    updatedAt: string;
};

export type RiskResult = {
    applicationId?: number;
    analysisSessionId: string;
    modelUsed: string;
    prediction: number;
    probability: number;
    riskLevel: string;
};

export type RiskComparisonResult = {
    id: number;
    loanApplicationId: number;
    prediction: number;
    probability: number;
    riskLevel: string;
    modelUsed: string;
    analysisSessionId: string;
    generatedAt: string;
};

export type RiskSummary = {
    analysisSessionId: string;
    totalModelsCompared: number;
    averageProbability: number;
    consensusRiskLevel: string;
    modelResults: {
        modelUsed: string;
        prediction: number;
        probability: number;
        riskLevel: string;
        generatedAt: string;
    }[];
};

export type LoanApplicationRequest = Omit<
    LoanApplication,
    "id" | "analysisSessionId" | "status" | "createdAt" | "updatedAt"
    >;

export const getAuthUser = () => {
    return {
        username: localStorage.getItem("username") || "",
        role: localStorage.getItem("role") || ""
    };
};

export const getAuthHeaders = () => {
    const { username, role } = getAuthUser();

    return {
        "X-Username": username,
        "X-Role": role
    };
};

export async function getLoanApplications(): Promise<LoanApplication[]> {
    const response = await fetch(`${API_BASE_URL}/LoanApplication`);

    if (!response.ok) {
        throw new Error("Failed to get loan applications");
    }

    return response.json();
}

export async function getLoanApplication(id: number): Promise<LoanApplication> {
    const response = await fetch(`${API_BASE_URL}/LoanApplication/${id}`);

    if (!response.ok) {
        throw new Error("Failed to get loan application");
    }

    return response.json();
}

export async function submitLoanApplication(payload: LoanApplicationRequest): Promise<RiskResult> {
    const response = await fetch(`${API_BASE_URL}/RiskAnalysis/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(payload),
        
    });

    if (!response.ok) {
        throw new Error("Failed to submit loan application");
    }

    return response.json();
}

export async function predictWithModel(
    applicationId: number,
    modelType: "catboost" | "lightgbm" | "xgboost"
): Promise<RiskResult> {
    const response = await fetch(
        `${API_BASE_URL}/RiskAnalysis/predict/${applicationId}/${modelType}`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to predict using ${modelType}`);
    }

    return response.json();
}

export async function getModelComparison(
    analysisSessionId: string
): Promise<RiskComparisonResult[]> {
    const response = await fetch(
        `${API_BASE_URL}/RiskAnalysis/compare/${analysisSessionId}`
    );

    if (!response.ok) {
        throw new Error("Failed to get model comparison");
    }

    return response.json();
}

export async function getModelComparisonSummary(
    analysisSessionId: string
): Promise<RiskSummary> {
    const response = await fetch(
        `${API_BASE_URL}/RiskAnalysis/compare/${analysisSessionId}/summary`
    );

    if (!response.ok) {
        throw new Error("Failed to get model comparison summary");
    }

    return response.json();
}

export type ShapExplanation = {
    feature: string;
    value: number;
    shap: number;
};

export async function getShapExplanation(
    modelType: "catboost" | "lightgbm" | "xgboost",
    payload: any
): Promise<ShapExplanation[]> {
    const response = await fetch(`${ML_API_BASE_URL}/shap/${modelType}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Failed to get SHAP explanation");
    }

    return response.json();
}

export async function forwardForReview(id: number): Promise<LoanApplication> {
    const response = await fetch(`${API_BASE_URL}/LoanApplication/${id}/forward-review`, {
        method: "POST",
        headers: {
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        throw new Error("Failed to forward application for review");
    }

    return response.json();
}

export async function approveApplication(
    id: number,
    decisionReason: string
): Promise<LoanApplication> {

    const response = await fetch(
        `${API_BASE_URL}/LoanApplication/${id}/approve`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
            body: JSON.stringify({
                decisionReason
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to approve application"
        );
    }

    return response.json();
}

export async function rejectApplication(
    id: number,
    decisionReason: string
): Promise<LoanApplication> {

    const response = await fetch(
        `${API_BASE_URL}/LoanApplication/${id}/reject`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
            body: JSON.stringify({
                decisionReason
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to reject application"
        );
    }

    return response.json();
}

export async function getFeatureImportance(modelType: string) {
    const response = await fetch(
        `${ML_API_BASE_URL}/feature-importance/${modelType}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to get feature importance");
    }

    return response.json();
}

export async function getRecommendedLoan(modelType: string, payload: any) {
    const response = await fetch(
        `${ML_API_BASE_URL}/recommend-loan/${modelType}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to get recommended loan");
    }

    return response.json();
}