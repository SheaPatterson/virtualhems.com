import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthGuard';
import { toast } from 'sonner';

type AuthMode = 'login' | 'register' | 'confirm';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, confirmAccount, user } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  // Redirect if already logged in
  if (user) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      toast.success('Welcome back, Pilot!');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message?.includes('verify')) {
        setPendingEmail(email);
        setMode('confirm');
        toast.info('Please verify your email first');
      } else {
        toast.error(error.message || 'Login failed. Check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signUp(email, password, firstName, lastName);
      
      if (result.needsConfirmation) {
        setPendingEmail(email);
        setMode('confirm');
        toast.success('Registration successful! Check your email for verification code.');
      } else {
        // Auto-login if no confirmation needed
        await signIn(email, password);
        navigate('/dashboard', { replace: true });
        toast.success('Welcome to HEMS OPS-CENTER!');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message?.includes('exists') || error.code === 'UsernameExistsException') {
        toast.error('Email already registered. Try logging in.');
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await confirmAccount(pendingEmail, confirmCode);
      toast.success('Email verified! You can now log in.');
      setEmail(pendingEmail);
      setMode('login');
    } catch (error: any) {
      console.error('Confirmation error:', error);
      toast.error(error.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 space-y-10">
      {/* Logo Section */}
      <div className="flex flex-col items-center space-y-6">
        <div className="p-4 bg-primary/10 rounded-[3rem] border-2 border-primary/20 shadow-2xl transition-transform hover:scale-105">
          <img 
            src="/logo-main.png" 
            alt="HEMS Simulation Logo" 
            className="w-32 h-32 object-contain" 
          />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-primary italic leading-none text-shadow-primary uppercase">HEMS SIMULATION</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-bold">Professional Flight Operations</p>
        </div>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card/50 backdrop-blur-md overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
          <CardTitle className="text-xs text-center font-black uppercase tracking-[0.2em] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
            {mode === 'login' && 'Secure Personnel Access'}
            {mode === 'register' && 'New Pilot Registration'}
            {mode === 'confirm' && 'Email Verification'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide flex items-center">
                  <Mail className="w-3 h-3 mr-1" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="pilot@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide flex items-center">
                  <Lock className="w-3 h-3 mr-1" /> Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full h-14 text-lg font-black italic uppercase" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {isLoading ? 'Authenticating...' : 'Access Command Center'}
              </Button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wide flex items-center">
                    <User className="w-3 h-3 mr-1" /> First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wide">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regEmail" className="text-xs font-bold uppercase tracking-wide flex items-center">
                  <Mail className="w-3 h-3 mr-1" /> Email
                </Label>
                <Input
                  id="regEmail"
                  type="email"
                  placeholder="pilot@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regPassword" className="text-xs font-bold uppercase tracking-wide flex items-center">
                  <Lock className="w-3 h-3 mr-1" /> Password
                </Label>
                <div className="relative">
                  <Input
                    id="regPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="h-12 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Min 8 chars with uppercase, lowercase, and number</p>
              </div>
              
              <Button type="submit" className="w-full h-14 text-lg font-black italic uppercase" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {isLoading ? 'Creating Account...' : 'Begin Tour of Duty'}
              </Button>
            </form>
          )}

          {/* Confirm Form */}
          {mode === 'confirm' && (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                <CheckCircle className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm font-medium">Verification code sent to:</p>
                <p className="text-primary font-bold">{pendingEmail}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmCode" className="text-xs font-bold uppercase tracking-wide">
                  Verification Code
                </Label>
                <Input
                  id="confirmCode"
                  placeholder="123456"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                />
              </div>
              
              <Button type="submit" className="w-full h-14 text-lg font-black italic uppercase" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
          )}

          {/* Mode Switcher */}
          <div className="text-center pt-4 border-t border-border/50">
            {mode === 'login' && (
              <p className="text-sm text-muted-foreground">
                New pilot?{' '}
                <Button variant="link" className="p-0 h-auto font-bold text-primary" onClick={() => setMode('register')}>
                  Register for duty
                </Button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-sm text-muted-foreground">
                Already registered?{' '}
                <Button variant="link" className="p-0 h-auto font-bold text-primary" onClick={() => setMode('login')}>
                  Sign in
                </Button>
              </p>
            )}
            {mode === 'confirm' && (
              <p className="text-sm text-muted-foreground">
                Wrong email?{' '}
                <Button variant="link" className="p-0 h-auto font-bold text-primary" onClick={() => setMode('register')}>
                  Start over
                </Button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="flex flex-col items-center space-y-2">
        <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.3em] font-mono">Terminal Protocol v6.0.0-AWS</p>
        <div className="h-0.5 w-32 bg-primary/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary/40 w-1/3 animate-[pulse_2s_infinite]" />
        </div>
      </div>
    </div>
  );
}

export default Login;
