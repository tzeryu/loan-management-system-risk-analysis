import { useEffect, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { SystemUser } from '@/app/data/mockData';
import axios from 'axios';
import { Users, UserCheck, Briefcase, Shield, Edit, UserX, UserCheck2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/app/services/api';

export function ManageUsers() {
    const [users, setUsers] = useState<SystemUser[]>([]);
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {

            const response = await axios.get(
                "https://localhost:7234/api/users"
            );

            const mappedUsers = response.data.map((user: any) => ({
                id: user.id,
                username: user.username,
                role: user.role,
                accountStatus: user.isActive
                    ? "Active"
                    : "Inactive",
                createdDate: user.createdAt
            }));

            setUsers(mappedUsers);

        }
        catch (error) {

            console.error(error);

            toast.error("Failed to load users");
        }
    };



  // Form state
  const [formData, setFormData] = useState({
    username: '',
    role: 'Loan Officer' as 'Loan Officer' | 'Administrator',
    accountStatus: 'Active' as 'Active' | 'Inactive',
    password: '',
    confirmPassword: '',
  });

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.accountStatus === 'Active').length;
  const loanOfficers = users.filter(user => user.role === 'Loan Officer').length;
  const administrators = users.filter(user => user.role === 'Administrator').length;

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      role: 'Loan Officer',
      accountStatus: 'Active',
      password: '',
      confirmPassword: '',
    });
    setIsCreateEditModalOpen(true);
  };

  const handleOpenEditModal = (user: SystemUser) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormData({
      username: user.username,
      role: user.role,
      accountStatus: user.accountStatus,
      password: '',
      confirmPassword: '',
    });
    setIsCreateEditModalOpen(true);
  };

  const handleOpenDeactivateModal = (user: SystemUser) => {
    setSelectedUser(user);
    setIsDeactivateModalOpen(true);
  };

  const handleSaveUser = async () => {
    // Validation
    if (!formData.username) {
      toast.error('Please enter a username');
      return;
    }

    if (!isEditMode) {
      if (!formData.password || !formData.confirmPassword) {
        toast.error('Please enter and confirm password');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    if (isEditMode && selectedUser) {
      // Update existing user
        try {
            await axios.put(
                `https://localhost:7234/api/users/${selectedUser.id}`,
                {
                    id: selectedUser.id,
                    username: formData.username,
                    role: formData.role,
                    isActive: formData.accountStatus === "Active"
                },
                {
                    headers: {
                        ...getAuthHeaders()
                    }
                }
            );

            toast.success("User updated successfully");

            fetchUsers();

            setIsCreateEditModalOpen(false);
        }
        catch (error) {
            toast.error("Failed to update user");
        }
    } else {
      // Create new user
        try {
            await axios.post(
                "https://localhost:7234/api/users",
                {
                    username: formData.username,
                    password: formData.password,
                    role: formData.role,
                    isActive: formData.accountStatus === "Active"
                },
                {
                    headers: {
                        ...getAuthHeaders()
                    }
                }
            );

            toast.success("User created successfully");

            fetchUsers();

            setIsCreateEditModalOpen(false);
        }
        catch (error) {
            toast.error("Failed to create user");
        }
    }

    setIsCreateEditModalOpen(false);
  };

    const handleToggleStatus = async (user: SystemUser) => {

        try {

            const isActive =
                user.accountStatus !== "Active";

            await axios.patch(
                `https://localhost:7234/api/users/${user.id}/status`,
                {
                    username: localStorage.getItem("username"),
                    role: localStorage.getItem("role"),
                    isActive: isActive
                },
                {
                    headers: {
                        ...getAuthHeaders()
                    }
                }
            );

            fetchUsers();

            toast.success(
                isActive
                    ? "User activated"
                    : "User deactivated"
            );

        }
        catch {
            toast.error("Failed to update status");
        }
    };

  const handleConfirmDeactivate = () => {
    if (selectedUser) {
      handleToggleStatus(selectedUser);
      setIsDeactivateModalOpen(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Manage User Accounts</h1>
            <p className="text-gray-500 mt-1">Create, update, and control access for system users</p>
          </div>
          <Button onClick={handleOpenCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New User
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-gray-900">{totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Users
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-gray-900">{activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Loan Officers
              </CardTitle>
              <Briefcase className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-gray-900">{loanOfficers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Administrators
              </CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-gray-900">{administrators}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>Manage internal user accounts and access permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          user.role === 'Administrator' 
                            ? 'bg-orange-50 text-orange-700 border-orange-200' 
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          user.accountStatus === 'Active' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }
                      >
                        {user.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {user.accountStatus === 'Active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeactivateModal(user)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <UserCheck2 className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-sm text-gray-500 italic">
              All user management actions are recorded in the audit log.
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit User Modal */}
        <Dialog open={isCreateEditModalOpen} onOpenChange={setIsCreateEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit User' : 'Create New User'}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? 'Update user account information and permissions' 
                  : 'Add a new user to the system'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'Loan Officer' | 'Administrator') => 
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Loan Officer">Loan Officer</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                <Select 
                  value={formData.accountStatus} 
                  onValueChange={(value: 'Active' | 'Inactive') => 
                    setFormData({ ...formData, accountStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isEditMode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveUser}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deactivate Confirmation Modal */}
        <Dialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate User Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to deactivate this user account?
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="py-4">
                <p className="text-sm text-gray-600">
                  User: <span className="font-medium text-gray-900">{selectedUser.username}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Role: <span className="font-medium text-gray-900">{selectedUser.role}</span>
                </p>
                <p className="text-sm text-red-600 mt-4">
                  This user will no longer be able to access the system.
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeactivateModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDeactivate}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
