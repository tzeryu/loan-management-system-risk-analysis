import { Layout } from '@/app/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle, Circle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLoanApplications, LoanApplication } from '@/app/services/api';

export function TrackApplications() {
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadApplications = async () => {
            try {
                const data = await getLoanApplications();
                setApplications(data);
            } catch (error) {
                console.error("Failed to load applications:", error);
            } finally {
                setLoading(false);
            }
        };

        loadApplications();
    }, []);
    const getStatusSteps = (currentStatus: string) => {
        const allSteps = [
            { label: 'Submitted', value: 'Submitted' },
            { label: 'Risk Evaluated', value: 'Risk Evaluated' },
            { label: 'Pending Admin Review', value: 'Pending Admin Review' },
            { label: 'Final Decision', value: ['Approved', 'Rejected'] },
        ];

        const statusOrder = [
            'Submitted',
            'Risk Evaluated',
            'Pending Admin Review',
            'Approved',
            'Rejected'
        ];
        const currentIndex = statusOrder.indexOf(currentStatus);

        return allSteps.map((step, index) => {
            let status: 'completed' | 'current' | 'pending' = 'pending';

            if (Array.isArray(step.value)) {
                // Final Decision step
                if (currentStatus === 'Approved' || currentStatus === 'Rejected') {
                    status = 'completed';
                } else if (currentStatus === 'Risk Evaluated') {
                    status = 'current';
                }
            } else {
                const stepIndex = statusOrder.indexOf(step.value);
                if (stepIndex < currentIndex || (stepIndex === currentIndex && currentStatus !== 'Submitted')) {
                    status = 'completed';
                } else if (stepIndex === currentIndex) {
                    status = 'current';
                }
            }

            return { ...step, status };
        });
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'Submitted':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Risk Evaluated':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Pending Admin Review':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'Rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Track Loan Applications</h1>
                    <p className="text-gray-500 mt-1">Monitor the status and progress of all applications</p>
                </div>

                {/* Applications List */}
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-gray-500">Loading applications...</p>
                    ) : applications.length === 0 ? (
                        <p className="text-gray-500">No loan applications found.</p>
                    ) : (
                        applications.map((application) => {
                            const steps = getStatusSteps(application.status);

                            return (
                                <Card key={application.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">Applicant {application.id}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    Application ID: {application.id} • ${application.loanAmount.toLocaleString()} •
                                                    Submitted: {application.createdAt ?? "-"}
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`${getStatusBadgeColor(application.status)} px-3 py-1`}
                                            >
                                                {application.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Timeline */}
                                        <div className="relative">
                                            <div className="flex justify-between items-start">
                                                {steps.map((step, index) => (
                                                    <div key={index} className="flex flex-col items-center flex-1">
                                                        {/* Icon */}
                                                        <div className="relative z-10">
                                                            {step.status === 'completed' ? (
                                                                <div className="bg-green-500 rounded-full p-2">
                                                                    <CheckCircle className="h-5 w-5 text-white" />
                                                                </div>
                                                            ) : step.status === 'current' ? (
                                                                <div className="bg-blue-500 rounded-full p-2 animate-pulse">
                                                                    <Circle className="h-5 w-5 text-white fill-white" />
                                                                </div>
                                                            ) : (
                                                                <div className="bg-gray-300 rounded-full p-2">
                                                                    <Circle className="h-5 w-5 text-gray-500" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Label */}
                                                        <div className="mt-3 text-center">
                                                            <p className={`text-sm font-medium ${step.status === 'completed' || step.status === 'current'
                                                                ? 'text-gray-900'
                                                                : 'text-gray-500'
                                                                }`}>
                                                                {step.label}
                                                            </p>
                                                            {step.status === 'completed' && Array.isArray(step.value) && (
                                                                <p className={`text-xs mt-1 font-medium ${application.status === 'Approved' ? 'text-green-600' : 'text-red-600'
                                                                    }`}>
                                                                    {application.status}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Connector Line */}
                                                        {index < steps.length - 1 && (
                                                            <div
                                                                className={`absolute top-5 h-0.5 -z-0 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                                                                    }`}
                                                                style={{
                                                                    left: `calc(${(index / (steps.length - 1)) * 100}% + 24px)`,
                                                                    right: `calc(${100 - ((index + 1) / (steps.length - 1)) * 100}% + 24px)`,
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between text-sm">
                                                <div>
                                                    <span className="text-gray-600">Loan Purpose:</span>{' '}
                                                    <span className="font-medium text-gray-900">{application.loanIntent}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Last Updated:</span>{' '}
                                                    <span className="font-medium text-gray-900">{application.updatedAt ?? "-"}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Credit Score:</span>{' '}
                                                    <span className="font-medium text-gray-900">{application.creditScore}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </Layout>
    );
}
