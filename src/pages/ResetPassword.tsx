import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false); // To ensure Supabase session is checked
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the session recovery from the URL fragment automatically
    // We listen for the SIGNED_IN or PASSWORD_RECOVERY event to confirm the user is ready
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log('Auth event:', event, session); // For debugging
      if (event === 'PASSWORD_RECOVERY') {
        // This event confirms the user clicked the link and Supabase prepared the session
        setIsSessionReady(true); 
      } else if (event === 'SIGNED_IN' && session) {
        // If already signed in somehow, maybe redirect? Or just allow password update.
        setIsSessionReady(true);
      }
      // If the session is null and the event isn't PASSWORD_RECOVERY, the token might be invalid/expired
      // However, Supabase updateUser should handle invalid sessions gracefully
    });

    // Check initial session state as well
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            // If there's already a session, allow password update
            setIsSessionReady(true);
        }
        // If no session initially, we rely on PASSWORD_RECOVERY event
    });


    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
       toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        // Handle specific errors, e.g., weak password if Supabase provides that detail
        if (error.message.includes("Password should be at least 6 characters")) {
             toast({
                title: "Error",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
        } else {
            throw error; // Rethrow other errors
        }
      } else {
        toast({
            title: "Success!",
            description: "Your password has been successfully reset. Please sign in.",
        });
        navigate('/signin'); // Redirect to sign-in page
      }

    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password. The reset link may have expired or been used already.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Show a loading state or message until the session is confirmed ready
  // if (!isSessionReady) {
  //   return (
  //     <Layout>
  //       <PageHeader title="Reset Password" subtitle="Verifying reset link..." />
  //       <div className="container max-w-7xl mx-auto px-4 py-12 text-center">
  //         <p>Loading...</p> 
  //       </div>
  //     </Layout>
  //   );
  // }


  return (
    <Layout>
      <PageHeader title="Reset Password" subtitle="Enter your new password" />
      
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
              <CardDescription className="text-center">
                Please enter and confirm your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-medical-teal focus-within:border-transparent">
                    <Lock className="h-5 w-5 text-gray-400 mr-2" />
                    <Input
                      type="password"
                      placeholder="New Password"
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
                      placeholder="Confirm New Password"
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
                  disabled={isLoading || !isSessionReady} // Disable button until session is ready
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
                 {!isSessionReady && (
                   <p className="text-sm text-center text-yellow-600">Verifying reset link...</p>
                 )}
              </form>
            </CardContent>
             <CardFooter className="flex flex-col space-y-2">
               <div className="text-sm text-center">
                 <Link to="/signin" className="text-medical-teal hover:underline">
                   Back to Sign In
                 </Link>
               </div>
             </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
