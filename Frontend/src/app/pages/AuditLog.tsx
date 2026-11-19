import { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout } from '@/app/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { FileText, Filter } from 'lucide-react';

export function AuditLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {

            const response = await axios.get(
                "https://localhost:7234/api/auditlogs"
            );

            const mappedLogs = response.data.map((log: any) => ({
                id: log.id,
                timestamp: new Date(log.timestamp).toLocaleString(),

                userName: log.username,
                action: log.action,
                entityType: log.entityType,
                userRole: log.userRole,

                applicationId:
                    log.entityType === "LoanApplication"
                        ? log.entityId
                        : null
            }));

            setAuditLogs(mappedLogs);

        }
        catch (error) {

            console.error(error);

        }
    };

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch =
            searchTerm === '' ||
            log.applicationId?.toString().toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = filterAction === 'all' || log.action === filterAction;
        const matchesRole = filterRole === 'all' || log.userRole === filterRole;

        return matchesSearch && matchesAction && matchesRole;
    });

  const getRoleBadge = (role: string) => {
    if (role === 'Administrator') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Administrator</Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Loan Officer</Badge>;
  };

  const getActionBadge = (action: string) => {
    if (action.includes('Approved')) {
      return <Badge className="bg-green-500 text-white">{action}</Badge>;
    }
    if (action.includes('Rejected')) {
      return <Badge className="bg-red-500 text-white">{action}</Badge>;
    }
    if (action.includes('Created')) {
      return <Badge className="bg-blue-500 text-white">{action}</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 mt-1">Track all system activities and user actions</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter audit logs by action type, user role, or search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by application ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action-filter">Action Type</Label>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger id="action-filter">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="Created User">Created User</SelectItem>
                    <SelectItem value="Deactivated User">Deactivated User</SelectItem>
                    <SelectItem value="Updated User">Updated User</SelectItem>
                    <SelectItem value="Forwarded for Admin Review">Forwarded for Review</SelectItem>
                    <SelectItem value="Approved Loan Application">Approved</SelectItem>
                    <SelectItem value="Rejected Loan Application">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-filter">User Role</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger id="role-filter">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Loan Officer">Loan Officer</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activity Log ({filteredLogs.length} entries)
            </CardTitle>
            <CardDescription>Complete history of all system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User Role</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Action Performed</TableHead>
                  <TableHead>Application ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No audit logs found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                      <TableCell>{getRoleBadge(log.userRole)}</TableCell>
                      <TableCell className="font-medium">{log.userName}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                          <TableCell className="font-mono text-sm">
                              {log.entityType === "LoanApplication"
                                  ? log.applicationId
                                  : "-"}
                          </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{auditLogs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Loan Officer Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                {auditLogs.filter(log => log.userRole === 'Loan Officer').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                {auditLogs.filter(log => log.userRole === 'Administrator').length}
              </div>
            </CardContent>
          </Card>          
        </div>
      </div>
    </Layout>
  );
}
