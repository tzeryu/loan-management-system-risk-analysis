import { useEffect, useState, useMemo } from "react";
import { getLoanApplications, LoanApplication, getFeatureImportance } from "@/app/services/api";
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

export function AdminDashboard() {
    const navigate = useNavigate()
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [featureImportance, setFeatureImportance] = useState<any>(null);
    const [selectedModel, setSelectedModel] = useState("random_forest");

    const COLORS = {
        approved: "#22c55e",       // Green-500
        rejected: "#ef4444",       // Red-500
        pending: "#eab308",        // Yellow-500
        adminPending: "#3b82f6",   // Blue-500
        lowRisk: "#22c55e",
        moderateRisk: "#eab308",
        highRisk: "#ef4444"
    };

    const awaitingDecision = applications.filter(
        app => app.status === "Pending Admin Review"
    );

    const totalApproved = applications.filter(app => app.status === "Approved").length;
    const totalRejected = applications.filter(app => app.status === "Rejected").length;
    const totalProcessed = totalApproved + totalRejected;
    const approvalRate = totalProcessed > 0 ? Math.round((totalApproved / totalProcessed) * 100) : 0;
    const rejectionRate = totalProcessed > 0 ? Math.round((totalRejected / totalProcessed) * 100) : 0;

    const riskChartData = useMemo(() => {
        let low = 0;
        let moderate = 0;
        let high = 0;

        applications.forEach((app: any) => {

            const risks = app.riskAnalysisResults;

            if (!risks || risks.length === 0) return;

            const latest = risks.reduce((prev: any, current: any) => {
                return new Date(prev.generatedAt) > new Date(current.generatedAt)
                    ? prev
                    : current;
            });

            const level = latest.riskLevel?.toLowerCase() || "";

            if (level.includes("low")) low++;
            else if (level.includes("moderate")) moderate++;
            else if (level.includes("high")) high++;
        });

        return [
            { name: "Low Risk", value: low, color: COLORS.lowRisk },
            { name: "Moderate Risk", value: moderate, color: COLORS.moderateRisk },
            { name: "High Risk", value: high, color: COLORS.highRisk }
        ];
    }, [applications]);

    const statusChartData = useMemo(() => {
        let approved = 0, rejected = 0, pending = 0, adminPending = 0;
        applications.forEach((app: any) => {
            if (app.status === "Approved") approved++;
            if (app.status === "Rejected") rejected++;
            if (app.status === "Risk Evaluated") pending++;
            if (app.status === "Pending Admin Review") adminPending++;
        });
        return [
            { name: "Approved", count: approved, color: COLORS.approved },
            { name: "Rejected", count: rejected, color: COLORS.rejected },
            { name: "Pending Review", count: pending, color: COLORS.pending },
            { name: "Admin Review", count: adminPending, color: COLORS.adminPending }
        ];
    }, [applications]);


    useEffect(() => {
        const loadApplications = async () => {
            try {
                const data = await getLoanApplications();
                setApplications(data);
            } catch (error) {
                console.error(error);
            }
        };
        loadApplications();
    }, []);

    useEffect(() => {
        loadFeatureImportance();
    }, [selectedModel]);

    const getLatestRisk = (app: any) => {
        if (!app.riskAnalysisResults || app.riskAnalysisResults.length === 0) {
            return null;
        }

        return app.riskAnalysisResults.reduce((latest: any, current: any) => {
            return new Date(current.generatedAt) > new Date(latest.generatedAt)
                ? current
                : latest;
        });
    };

    const loadFeatureImportance = async () => {
        try {
            const data = await getFeatureImportance(selectedModel);
            setFeatureImportance(data.features);
        } catch (err) {
            console.error("Feature importance error:", err);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Administrator Dashboard</h1>
                    <p className="text-gray-500 mt-1">Review and manage loan applications</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Applications Awaiting Decision
                            </CardTitle>
                            <AlertCircle className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-gray-900">{awaitingDecision.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Approval Rate
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-3xl font-semibold text-gray-900">{approvalRate}%</div>
                                <Progress value={approvalRate} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Rejection Rate
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-3xl font-semibold text-gray-900">{rejectionRate}%</div>
                                <Progress value={rejectionRate} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                </div>                
                <Card>
                    {/* Charts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Application Volumes by Status</CardTitle>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {statusChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Risk Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Risk Classification</CardTitle>
                                <CardDescription>Distribution of calculated application threat vectors</CardDescription>
                            </CardHeader>
                            <CardContent className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={riskChartData}
                                            cx="50%"
                                            cy="45%" 
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {riskChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </Card>
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="random_forest">Random Forest</option>
                    <option value="xgboost">XGBoost</option>
                    <option value="lightgbm">LightGBM</option>
                    <option value="catboost">CatBoost</option>
                </select>
                <Card>
                    <CardHeader>
                        <CardTitle>Model Feature Importance</CardTitle>
                        <CardDescription>
                            Global feature influence on {selectedModel}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {!featureImportance ? (
                            <p className="text-sm text-gray-500">Loading...</p>
                        ) : (
                            <div className="space-y-3">
                                {featureImportance.map((f: any, index: number) => (
                                    <div key={index} className="space-y-1">

                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">
                                                {f.feature}
                                            </span>

                                            <span className="text-gray-500">
                                                {f.importance_percent.toFixed(1)}%
                                            </span>
                                        </div>

                                        <div className="w-full bg-gray-100 rounded h-2">
                                            <div
                                                className="h-2 bg-blue-500 rounded"
                                                style={{
                                                    width: `${f.importance_percent}%`
                                                }}
                                            />
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Applications Awaiting Review */}
                <Card>
                    <CardHeader>
                        <CardTitle>Applications Awaiting Review</CardTitle>
                        <CardDescription>Review and make decisions on pending loan applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {awaitingDecision.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No applications awaiting decision
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Application ID</TableHead>
                                        <TableHead>Applicant Name</TableHead>
                                        <TableHead>Loan Amount</TableHead>
                                        <TableHead>Risk Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {awaitingDecision.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-medium">{app.id}</TableCell>
                                            <TableCell>{app.name}</TableCell>
                                            <TableCell>${app.loanAmount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const latest = getLatestRisk(app);

                                                    return latest ? (
                                                        /* flex and items-center forces perfectly straight vertical alignment */
                                                        <div className="flex items-center gap-3">
                                                            <span className="min-w-[64px] inline-block">
                                                                {Math.round(latest.probability)}/100
                                                            </span>

                                                            <Badge
                                                                className={
                                                                    latest.riskLevel === "Low Risk"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : latest.riskLevel === "Moderate Risk"
                                                                            ? "bg-yellow-100 text-yellow-700"
                                                                            : "bg-red-100 text-red-700"
                                                                }
                                                            >
                                                                {latest.riskLevel}
                                                            </Badge>
                                                        </div>
                                                    ) : (
                                                        "-"
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/review/${app.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Review
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* All Applications */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Loan Applications</CardTitle>
                        <CardDescription>Complete overview of all loan applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Application ID</TableHead>
                                    <TableHead>Applicant Name</TableHead>
                                    <TableHead>Loan Amount</TableHead>
                                    <TableHead>Risk Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.id}</TableCell>
                                        <TableCell>{app.name}</TableCell>
                                        <TableCell>${app.loanAmount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {(() => {
                                                const latest = getLatestRisk(app);

                                                return latest ? (
                                                    /* flex and items-center forces perfectly straight vertical alignment */
                                                    <div className="flex items-center gap-3">

                
                                                        <span className="min-w-[64px] inline-block">
                                                            {Math.round(latest.probability)}/100
                                                        </span>

                                                        <Badge
                                                            className={
                                                                latest.riskLevel === "Low Risk"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : latest.riskLevel === "Moderate Risk"
                                                                        ? "bg-yellow-100 text-yellow-700"
                                                                        : "bg-red-100 text-red-700"
                                                            }
                                                        >
                                                            {latest.riskLevel}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    "-"
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    app.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-purple-50 text-purple-700 border-purple-200'
                                                }
                                            >
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/admin/review/${app.id}`)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
