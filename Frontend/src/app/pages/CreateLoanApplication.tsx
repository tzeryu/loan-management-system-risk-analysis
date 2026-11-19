import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import { submitLoanApplication } from "../services/api";

export function CreateLoanApplication() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        occupationStatus: "",
        yearsEmployed: "",
        annualIncome: "",
        creditScore: "",
        creditHistoryYears: "",
        savingsAssets: "",
        currentDebt: "",
        defaultsOnFile: "",
        delinquenciesLast2Yrs: "",
        derogatoryMarks: "",
        productType: "",
        loanIntent: "",
        loanAmount: "",
        interestRate: "",
        paymentToIncomeRatio: "",
        modelType: "catboost",
    });
    const annualIncome = Number(formData.annualIncome);
    const currentDebt = Number(formData.currentDebt);
    const loanAmount = Number(formData.loanAmount);

    const debtToIncomeRatio = annualIncome > 0 ? currentDebt / annualIncome : 0;
    const loanToIncomeRatio = annualIncome > 0 ? loanAmount / annualIncome : 0;

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                name: formData.name,
                age: Number(formData.age),
                occupationStatus: formData.occupationStatus,
                yearsEmployed: Number(formData.yearsEmployed),
                annualIncome: Number(formData.annualIncome),
                creditScore: Number(formData.creditScore),
                creditHistoryYears: Number(formData.creditHistoryYears),
                savingsAssets: Number(formData.savingsAssets),
                currentDebt: Number(formData.currentDebt),
                defaultsOnFile: Number(formData.defaultsOnFile),
                delinquenciesLast2Yrs: Number(formData.delinquenciesLast2Yrs),
                derogatoryMarks: Number(formData.derogatoryMarks),
                productType: formData.productType,
                loanIntent: formData.loanIntent,
                loanAmount: Number(formData.loanAmount),
                interestRate: Number(formData.interestRate),
                debtToIncomeRatio,
                loanToIncomeRatio,
                paymentToIncomeRatio: Number(formData.paymentToIncomeRatio),
                modelType: formData.modelType,
            };

            const result = await submitLoanApplication(payload);

            localStorage.setItem("latestApplicationId", String(result.applicationId));
            localStorage.setItem("latestAnalysisSessionId", result.analysisSessionId);

            toast.success("Loan application submitted successfully");

            navigate(`/loan-officer/view-risk/${result.applicationId}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit loan application");
        }
    };

    const handleCancel = () => {
        navigate('/loan-officer/dashboard');
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Create Loan Application</h1>
                    <p className="text-gray-500 mt-1">Fill in the applicant details to create a new loan application</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Applicant Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Applicant Information</CardTitle>
                                <CardDescription>Personal details of the loan applicant</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="space-y-2">
                                        <Label>Name *</Label>
                                        <Input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Age *</Label>
                                        <Input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => handleInputChange('age', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Occupation Status *</Label>
                                        <Select
                                            value={formData.occupationStatus}
                                            onValueChange={(value) => handleInputChange('occupationStatus', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select occupation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Employed">Employed</SelectItem>
                                                <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                                                <SelectItem value="Student">Student</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Years Employed *</Label>
                                        <Input
                                            type="number"
                                            value={formData.yearsEmployed}
                                            onChange={(e) => handleInputChange('yearsEmployed', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Annual Income *</Label>
                                        <Input
                                            type="number"
                                            value={formData.annualIncome}
                                            onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                                            required
                                        />
                                    </div>

                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Details</CardTitle>
                                <CardDescription>Financial information and credit history</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="space-y-2">
                                        <Label>Credit Score *</Label>
                                        <Input
                                            type="number"
                                            value={formData.creditScore}
                                            onChange={(e) => handleInputChange('creditScore', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Credit History (years) *</Label>
                                        <Input
                                            type="number"
                                            value={formData.creditHistoryYears}
                                            onChange={(e) => handleInputChange('creditHistoryYears', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Savings Assets *</Label>
                                        <Input
                                            type="number"
                                            value={formData.savingsAssets}
                                            onChange={(e) => handleInputChange('savingsAssets', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Current Debt *</Label>
                                        <Input
                                            type="number"
                                            value={formData.currentDebt}
                                            onChange={(e) => handleInputChange('currentDebt', e.target.value)}
                                            required
                                        />
                                    </div>

                                </div>
                            </CardContent>
                        </Card>

                        {/* Loan Request Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Loan Request Details</CardTitle>
                                <CardDescription>Details about the requested loan</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="space-y-2">
                                        <Label>Loan Amount *</Label>
                                        <Input
                                            type="number"
                                            value={formData.loanAmount}
                                            onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Interest Rate *</Label>
                                        <Input
                                            type="number"
                                            value={formData.interestRate}
                                            onChange={(e) => handleInputChange('interestRate', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Loan Intent *</Label>
                                        <Select
                                            value={formData.loanIntent}
                                            onValueChange={(value) => handleInputChange('loanIntent', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select purpose" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Personal">Personal</SelectItem>
                                                <SelectItem value="Education">Education</SelectItem>
                                                <SelectItem value="Business">Business</SelectItem>
                                                <SelectItem value="Medical">Medical</SelectItem>
                                                <SelectItem value="Home Improvement">Home Improvement</SelectItem>
                                                <SelectItem value="Debt Consolidation">Debt Consolidation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Product Type *</Label>
                                        <Select
                                            value={formData.productType}
                                            onValueChange={(value) => handleInputChange('productType', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select product type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                                                <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                <SelectItem value="Line Of Credit">Line Of Credit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>

                        {/* Credit Risk Behaviour */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Credit Risk Behaviour</CardTitle>
                                <CardDescription>Past negative credit events</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Defaults on File *</Label>
                                        <Input type="number" value={formData.defaultsOnFile}
                                            onChange={(e) => handleInputChange('defaultsOnFile', e.target.value)} required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Delinquencies Last 2 Years *</Label>
                                        <Input type="number" value={formData.delinquenciesLast2Yrs}
                                            onChange={(e) => handleInputChange('delinquenciesLast2Yrs', e.target.value)} required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Derogatory Marks *</Label>
                                        <Input type="number" value={formData.derogatoryMarks}
                                            onChange={(e) => handleInputChange('derogatoryMarks', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment-to-Income Ratio *</Label>
                                        <Input type="number" step="0.01" value={formData.paymentToIncomeRatio}
                                            onChange={(e) => handleInputChange('paymentToIncomeRatio', e.target.value)} required />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Submit Application
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
