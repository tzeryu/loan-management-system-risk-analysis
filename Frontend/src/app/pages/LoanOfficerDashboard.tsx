import { useEffect, useState } from 'react';
import { getLoanApplications, LoanApplication } from '@/app/services/api';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export function LoanOfficerDashboard() {
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const totalApplications = applications.length;

    const pendingReview = applications.filter(
        app => app.status === "Risk Evaluated"
    ).length;

    const getRiskDistribution = (apps: LoanApplication[]) => {
        const counts = {
            "Low Risk": 0,
            "Moderate Risk": 0,
            "High Risk": 0
        };

        apps.forEach(app => {
            if (app.riskLevel && counts[app.riskLevel] !== undefined) {
                counts[app.riskLevel]++;
            }
        });

        return Object.entries(counts).map(([risk, count]) => ({
            risk,
            count
        }));
    };

    const approved = applications.filter(app => app.status === "Approved").length;

    const rejected = applications.filter(app => app.status === "Rejected").length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Submitted':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Submitted</Badge>;
            case 'Under Review':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Under Review</Badge>;
            case 'Risk Evaluated':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Risk Evaluated</Badge>;
            case 'Approved':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
            case 'Rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getLoanApplications();
                setApplications(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Loan Officer Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage and track loan applications</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Applications
                            </CardTitle>
                            <FileText className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-gray-900">{totalApplications}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Pending Review
                            </CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-gray-900">{pendingReview}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Approved
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-gray-900">{approved}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Rejected
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-gray-900">{rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Applications Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Loan Applications</CardTitle>
                        <CardDescription>View and manage all loan applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && <p className="text-gray-500 mb-4">Loading applications...</p>}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Application ID</TableHead>
                                    <TableHead>Applicant Name</TableHead>
                                    <TableHead>Loan Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell>{app.id}</TableCell>

                                        <TableCell>{app.name}</TableCell>

                                        <TableCell>${app.loanAmount.toLocaleString()}</TableCell>

                                        <TableCell>
                                            {getStatusBadge(app.status)}
                                        </TableCell>

                                        <TableCell>
                                            {app.updatedAt ?? "-"}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/loan-officer/view-risk/${app.id}`)}
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
