import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Building2, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { logout, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-xl font-semibold text-gray-900">SecureBank</div>
                <div className="text-xs text-gray-500">Loan Management System</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {userRole === 'loan-officer' && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/loan-officer/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/loan-officer/create')}
                  >
                    Create Loan Application
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/loan-officer/track')}
                  >
                    Track Applications
                  </Button>
                </>
              )}
              {userRole === 'administrator' && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/admin/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/admin/audit-log')}
                  >
                    Audit Log
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/admin/manage-users')}
                  >
                    Manage User Accounts
                  </Button>
                </>
              )}
            </nav>

            {/* Logout */}
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}