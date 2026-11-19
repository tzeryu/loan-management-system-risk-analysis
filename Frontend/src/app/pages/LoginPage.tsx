import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("https://localhost:7234/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            if (response.status === 401) {
                setErrorMessage("Invalid username or password");
                return;
            }

            if (response.status === 403) {
                setErrorMessage("Account is deactivated. Please contact admin.");
                return;
            }

            const data = await response.json();

            // data = { username, role }

            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role);

            login(data.role === "Administrator" ? "administrator" : "loan-officer");

            if (data.role === "Administrator") {
                navigate("/admin/dashboard");
            } else {
                navigate("/loan-officer/dashboard");
            }

        } catch (err) {
            setErrorMessage("Login failed. Please try again.");
        }
    };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building2 className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">SecureBank</CardTitle>
            <CardDescription className="mt-2">
              Loan Management System
            </CardDescription>
          </div>
        </CardHeader>
              <CardContent>
                  {errorMessage && (
                      <div className="text-red-500 text-sm text-center mb-3">
                          {errorMessage}
                      </div>
                  )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                   setUsername(e.target.value);
                   setErrorMessage("");
                }}

                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                   setPassword(e.target.value);
                   setErrorMessage("");
                }}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
            <div className="text-xs text-center text-gray-500 mt-4 space-y-1">
              <p>Demo credentials:</p>
              <p>Loan Officer: <span className="font-medium">officer</span></p>
              <p>Administrator: <span className="font-medium">admin</span></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
