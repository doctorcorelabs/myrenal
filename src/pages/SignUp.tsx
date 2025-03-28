
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react'; // Removed UserIcon
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';

const SignUp = () => {
  // Removed name state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const { data, error } = await register(email, password); // Removed name from register call
      
      if (error) throw error; // Re-throw Supabase specific error

      // Check if user needs confirmation
      if (data.user && data.user.identities && data.user.identities.length === 0) {
         toast({
           title: "Check your email",
           description: "Please check your email inbox to confirm your account before signing in.",
           duration: 10000, // Longer duration for this message
         });
         navigate('/signin'); // Redirect to sign in after asking for confirmation
      } else if (data.session) {
        // If session exists immediately (e.g., email confirmation disabled)
        toast({
          title: "Success!",
          description: "Your account has been created. You are now signed in.",
        });
        navigate('/tools'); // Navigate to tools if signed in
      } else {
         // Fallback if user exists but no session (shouldn't happen often with email/pass)
         toast({
           title: "Account created",
           description: "Please sign in.",
         });
         navigate('/signin');
      }

    } catch (error: any) { // Catch specific error
      console.error("Sign up error:", error);
      toast({
        title: "Registration Error",
        description: error.message || "Registration failed. Please try again.", // Show Supabase error message
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                {/* Removed Name input field */}
                <div className="space-y-2">
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-medical-teal focus-within:border-transparent">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
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
                <div className="space-y-2">
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-medical-teal focus-within:border-transparent">
                    <Lock className="h-5 w-5 text-gray-400 mr-2" />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
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
