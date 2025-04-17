
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile'; // Import Turnstile
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserIcon, Lock } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>(''); // State for Turnstile token
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Check if Turnstile token exists
    if (!turnstileToken) {
      toast({
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 2. Verify Turnstile token with backend
      const verifyResponse = await fetch('/.netlify/functions/verify-turnstile', { // Use the correct path
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ turnstileToken }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        console.error("Turnstile verification failed:", verifyData);
        toast({
          title: "CAPTCHA Verification Failed",
          description: verifyData.error || "Could not verify CAPTCHA. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        setTurnstileToken(''); // Reset token
        return; // Stop submission
      }

       // 3. Proceed with login if Turnstile verification is successful
      await login(email, password);
      toast({
        title: "Success!",
         description: "You have successfully signed in.",
       });
       navigate('/tools/explore-gemini'); // Redirect to Explore Gemini after login
     } catch (error) {
       toast({
        title: "Error",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader title="Sign In" subtitle="Access your account and tools" />
      
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-medical-teal focus-within:border-transparent">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-medical-teal focus-within:border-transparent">
                    <Lock className="h-5 w-5 text-gray-400 mr-2" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
                {/* Turnstile Widget */}
                <div className="flex justify-center py-2">
                  <Turnstile
                    siteKey="0x4AAAAAABJj5Q0iqgbTzacQ" // Ganti dengan Site Key Anda yang benar
                    onSuccess={setTurnstileToken}
                    options={{ theme: 'light' }} // Sesuaikan tema jika perlu
                    onError={() => {
                      toast({ title: "CAPTCHA Error", description: "Failed to load CAPTCHA. Please refresh.", variant: "destructive" });
                    }}
                    onExpire={() => {
                      toast({ title: "CAPTCHA Expired", description: "Please complete the CAPTCHA again.", variant: "destructive" });
                      setTurnstileToken(''); // Reset token on expiry
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-medical-teal hover:bg-medical-blue"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center">
                Don't have an account?{' '}
                <Link to="/signup" className="text-medical-teal hover:underline">
                  Sign up
                </Link>
              </div>
              <div className="text-sm text-center mt-2">
                <Link to="/forgot-password" className="text-medical-teal hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
