import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile'; // Import Turnstile
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>(''); // State for Turnstile token
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
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

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 2. Verify Turnstile token with backend
      const verifyResponse = await fetch('/.netlify/functions/verify-turnstile', { // Use the correct path to your function
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
        setIsLoading(false); // Stop loading on failure
        setTurnstileToken(''); // Reset token potentially? Or let Turnstile handle expiry/retry
        return; // Stop submission
      }

      // 3. Proceed with registration if Turnstile verification is successful
      const signUpData = await register(email, password);

      // Error handling is done within the register function or caught below.

      // Trigger handles profile creation. Check if email confirmation is needed.
      // Note: signUpData.user might be null if email confirmation is required.
      // signUpData.session will likely be null until email is confirmed.
      if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
         // This means email confirmation is required by Supabase settings
         toast({
           title: "Check your email",
           description: "Account created! Please check your email to confirm your account before signing in.",
           duration: 10000,
         });
         navigate('/signin'); // Redirect to sign in page
      } else {
         // User created, profile created by trigger. Redirect to sign in.
         // This branch covers cases where confirmation is disabled OR
         // if Supabase behavior changes and returns user/session immediately.
         toast({
           title: "Success!",
           description: "Your account has been created. Please sign in.",
         });
         navigate('/signin');
      }

    } catch (error: any) {
      console.error("Sign up error:", error); // Keep console error
      toast({
        title: "Registration Error",
        description: error.message || "Registration failed. Please try again.", // Show Supabase error
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Ensure loading stops in all cases
    }
  };


  return (
    <Layout>
      <PageHeader title="Sign Up" subtitle="Create a new account" />

      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                <CardDescription className="text-center">
                  Sign up to access exclusive features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-medical-teal focus-within:border-transparent">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-medical-teal focus-within:border-transparent">
                      <Lock className="h-5 w-5 text-gray-400 mr-2" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-medical-teal focus-within:border-transparent">
                      <Lock className="h-5 w-5 text-gray-400 mr-2" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-medical-teal hover:bg-medical-blue"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center">
                  Already have an account?{' '}
                  <Link to="/signin" className="text-medical-teal hover:underline">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
