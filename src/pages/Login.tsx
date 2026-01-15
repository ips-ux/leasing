import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card } from '../components/ui';
import { GradientBackground } from '../components/ui';

export const Login = () => {
  const { user, loading, signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Security: Rate limiting state
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // Check for existing lockout on mount
  useEffect(() => {
    const storedLockout = localStorage.getItem('login_lockout');
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout, 10);
      if (lockoutTime > Date.now()) {
        setLockoutUntil(lockoutTime);
      } else {
        localStorage.removeItem('login_lockout');
      }
    }
  }, []);

  // Redirect to dashboard if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSecurityCheck = (): boolean => {
    // Check lockout
    if (lockoutUntil) {
      if (Date.now() < lockoutUntil) {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        toast.error(`Too many attempts. Please try again in ${remaining} seconds.`);
        return false;
      } else {
        setLockoutUntil(null);
        setAttempts(0);
        localStorage.removeItem('login_lockout');
      }
    }
    return true;
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= 5) {
      const lockoutTime = Date.now() + 60 * 1000; // 1 minute lockout
      setLockoutUntil(lockoutTime);
      localStorage.setItem('login_lockout', lockoutTime.toString());
      toast.error('Too many failed attempts. Account access temporarily paused.');
    } else {
      toast.error('Invalid email or password.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!handleSecurityCheck()) return;

    // Basic client-side validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setFormLoading(true);

    try {
      await signIn(formData.email, formData.password);
      // Success - redirect handled by auth state change
    } catch (error) {
      // Security: Always show generic error message to prevent enumeration
      console.error('Login error:', error); // Keep for debugging but don't show user
      handleFailedAttempt();
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (loading) {
    return (
      <>
        <GradientBackground />
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <div className="text-center py-8 px-12">
              <div className="text-xl font-semibold">Loading...</div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <GradientBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Leasing Assistance Tool</h1>
              <p className="text-black/60">
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={!!lockoutUntil}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={!!lockoutUntil}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={formLoading || !!lockoutUntil}
              >
                {lockoutUntil
                  ? `Try again in ${Math.ceil((lockoutUntil - Date.now()) / 1000)}s`
                  : formLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
};
