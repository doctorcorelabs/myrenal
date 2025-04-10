import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { UserLevel } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Save, Trash2, XCircle, BarChartHorizontal, LineChartIcon, UsersIcon, RefreshCw, Terminal, RotateCcw } from "lucide-react"; // Added RotateCcw
import { cn } from "@/lib/utils";
import { formatISO, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import { getQuotaLimit, FeatureName } from '@/lib/quotas';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"; // Import chart components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Import LineChart/Line
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

// Define the type for a feature toggle item
interface FeatureToggle {
  feature_name: string;
  is_enabled: boolean;
  description?: string;
}

// Define the type for a user profile item (keeping it separate for clarity)
interface UserProfile {
    id: string;
    level: UserLevel | null;
    level_expires_at: string | null; // ISO string or null
    created_at: string; // Keep for User Management table
    updated_at: string; // Keep for User Management table
}

// Define type for raw usage data from DB (as returned by a potential function)
// Re-adding types needed for quota display
interface UserDailyUsage {
    user_id: string;
    feature_name: FeatureName;
    usage_count: number;
    usage_date: string; // YYYY-MM-DD
}

// Define type for a single feature's quota status
interface FeatureQuotaStatus {
    limit: number | null;
    used: number;
    remaining: number | null;
}

// Define type for a user's complete quota details (grouped by feature)
interface UserQuotaDetails {
    userId: string;
    level: UserLevel | null;
    quotas: Record<FeatureName, FeatureQuotaStatus>;
}


// Define type for raw usage data from DB (for the existing stats)
interface DailyUsageRecord {
    id: number;
    user_id: string;
    feature_name: string;
    usage_date: string; // YYYY-MM-DD
    count: number; // Corrected column name
    created_at: string;
}

// Define type for aggregated usage stats for the table (today's usage)
interface UsageStatToday {
    feature_name: string;
    total_usage: number;
    userIds: string[]; // Changed from userEmails to userIds
}

// Define type for time series data for the line chart
interface TimeSeriesDataPoint {
    date: string; // YYYY-MM-DD
    [featureName: string]: number | string; // feature_name: usage_count
}

// Define the mapping from internal feature names to user-friendly titles
const featureNameMap: Record<string, string> = {
    'medical_calculator': 'Medical Calculator',
    'drug_reference': 'Drug Reference',
    'disease_library': 'Disease Library',
    'clinical_guidelines': 'Clinical Guidelines',
    'ai_chatbot': 'AI Chatbot',
    'ai_peer_review': 'AI Peer-Review',
    'explore_gemini': 'Explore GEMINI',
    'interaction_checker': 'Drug Interaction Checker',
    'mind_map_maker': 'AI Mind Map Generator',
    'clinical_scoring': 'Clinical Scoring Hub',
    'learning_resources': 'Learning Resources',
    'explore_deepseek': 'Explore DeepSeek' // Added DeepSeek mapping
    // 'health_statistics': 'Health Statistics' // Removed as page doesn't exist
};

// Helper function to get display name, falling back to formatted internal name
const getDisplayFeatureName = (internalName: string): string => {
    return featureNameMap[internalName] || internalName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};


const AdminDashboard: React.FC = () => {
  const [featureToggles, setFeatureToggles] = useState<FeatureToggle[]>([]);
  const [isLoadingToggles, setIsLoadingToggles] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [editingUsers, setEditingUsers] = useState<Record<string, Partial<UserProfile>>>({});
  const [usageStatsToday, setUsageStatsToday] = useState<UsageStatToday[]>([]); // State for today's usage stats table
  const [timeSeriesUsageData, setTimeSeriesUsageData] = useState<TimeSeriesDataPoint[]>([]); // State for line chart data
  const [allFeatureNames, setAllFeatureNames] = useState<string[]>([]); // State to hold all unique feature names for chart lines/legend
  const [isLoadingUsage, setIsLoadingUsage] = useState(true); // Loading for existing stats
  const [usageError, setUsageError] = useState<string | null>(null); // Error for existing stats
  // Re-adding state for the quota table
  const [userQuotaDetails, setUserQuotaDetails] = useState<Record<string, UserQuotaDetails>>({});
  const [userRefreshTimes, setUserRefreshTimes] = useState<Record<string, number>>({}); // Time until refresh in seconds
  const [isLoadingQuotas, setIsLoadingQuotas] = useState(true); // Loading state for new quota table
  const [quotaError, setQuotaError] = useState<string | null>(null); // Error state for new quota table
  const [isResettingQuota, setIsResettingQuota] = useState<string | null>(null); // Track which user's quota is being reset
  const { toast } = useToast();

  // Helper function to calculate time until next midnight UTC
  const getTimeUntilNextMidnightUTC = useCallback(() => {
    const now = new Date();
    const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    const diff = midnightUTC.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000)); // Time in seconds
  }, []);

  // Effect to calculate and update refresh times
  useEffect(() => {
    const calculateInitialRefreshTimes = () => {
      const initialTimes: Record<string, number> = {};
      users.forEach(user => {
        if (user.level === 'Free' || user.level === 'Researcher') {
          initialTimes[user.id] = getTimeUntilNextMidnightUTC();
        }
      });
      setUserRefreshTimes(initialTimes);
    };

    calculateInitialRefreshTimes(); // Calculate initial values

    const intervalId = setInterval(() => {
      setUserRefreshTimes(prevTimes => {
        const updatedTimes: Record<string, number> = {};
        Object.keys(prevTimes).forEach(userId => {
          updatedTimes[userId] = Math.max(0, prevTimes[userId] - 60); // Decrement by 60 seconds
        });
        return updatedTimes;
      });
    }, 60000); // Update every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [users, getTimeUntilNextMidnightUTC]);

  // Helper function to format time in hh:mm:ss format
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Fetch feature toggles (existing)
  useEffect(() => {
    const loadFeatureToggles = async () => {
      setIsLoadingToggles(true);
      try {
        const { data, error } = await supabase.from('feature_toggles').select('feature_name, is_enabled, description').order('feature_name');
        if (error) throw error;
        setFeatureToggles(data || []);
      } catch (error: any) {
        console.error("Error fetching feature toggles:", error);
        toast({ title: "Error Fetching Toggles", description: error.message || "Could not load feature toggles.", variant: "destructive" });
      } finally {
        setIsLoadingToggles(false);
      }
    };
    loadFeatureToggles();
  }, [toast]);

  // Fetch user profiles
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        // Fetch profile data, excluding email
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, level, level_expires_at, created_at, updated_at') // Removed email select
          .order('created_at', { ascending: false });
        if (profilesError) throw profilesError;

        if (profilesData) {
          // Set users directly without email
          setUsers(profilesData);
        } else {
          setUsers([]);
        }
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast({ title: "Error Fetching Users", description: error.message || "Could not load user data.", variant: "destructive" });
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [toast]); // Keep toast dependency

  // Fetch and process usage statistics for the last 7 days (existing stats card)
  useEffect(() => {
    const fetchUsageDataForStatsCard = async () => {
      setIsLoadingUsage(true);
      setUsageError(null);
      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 6); // Get data for the last 7 days (including today)
        const startDateString = formatISO(startDate, { representation: 'date' });

        // Fetch all usage data within the date range, including user_id
        const { data: usageRecords, error } = await supabase
          .from('daily_usage')
          .select('usage_date, feature_name, count, user_id') // Added user_id
          .gte('usage_date', startDateString)
          .order('usage_date', { ascending: true });

        if (error) throw error;

        // --- Process data for Today's Table ---
        const todayString = formatISO(endDate, { representation: 'date' });
        const todayRecords = usageRecords?.filter(r => r.usage_date === todayString) || [];

        // Get unique user IDs from today's records
        const todayUserIdsSet = new Set(todayRecords.map(r => r.user_id).filter(id => id)); // Filter out potential nulls/undefined and use Set for uniqueness

        // No need to fetch emails anymore as the 'profiles' table doesn't have an email column.
        // We already have the user IDs from the 'daily_usage' table.

        // Aggregate stats and collect user IDs
        const aggregatedStatsToday: Record<string, { total_usage: number; userIds: Set<string> }> = {};
        todayRecords.forEach(record => {
          if (!aggregatedStatsToday[record.feature_name]) {
            aggregatedStatsToday[record.feature_name] = { total_usage: 0, userIds: new Set() };
          }
          aggregatedStatsToday[record.feature_name].total_usage += record.count;
          if (record.user_id) { // Ensure user_id exists
            aggregatedStatsToday[record.feature_name].userIds.add(record.user_id);
          }
        });

        const statsArrayToday: UsageStatToday[] = Object.entries(aggregatedStatsToday)
          .map(([feature_name, data]) => ({
            feature_name,
            total_usage: data.total_usage,
            userIds: Array.from(data.userIds).sort() // Use the collected user IDs directly
          }))
          .sort((a, b) => a.feature_name.localeCompare(b.feature_name));
        setUsageStatsToday(statsArrayToday);
        // --- End Processing for Today's Table ---


        // --- Process data for Time Series Chart ---
        const uniqueFeatureNames = Array.from(new Set(usageRecords?.map(r => r.feature_name) || []));
        setAllFeatureNames(uniqueFeatureNames.sort()); // Store sorted feature names for consistent line colors/legend

        const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
        const dateMap: Record<string, TimeSeriesDataPoint> = {};

        // Initialize map with all dates and all features set to 0
        dateInterval.forEach(date => {
          const dateStr = formatISO(date, { representation: 'date' });
          dateMap[dateStr] = { date: dateStr };
          uniqueFeatureNames.forEach(name => {
            dateMap[dateStr][name] = 0;
          });
        });

        // Populate map with actual usage counts
        usageRecords?.forEach(record => {
          if (dateMap[record.usage_date]) {
            dateMap[record.usage_date][record.feature_name] = (dateMap[record.usage_date][record.feature_name] as number || 0) + record.count;
          }
        });

        // Convert map to array, sorted by date
        const timeSeriesData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
        setTimeSeriesUsageData(timeSeriesData);
        // --- End Processing for Time Series Chart ---

      } catch (error: any) {
        console.error("Error fetching usage statistics:", error);
        setUsageError(error.message || "Could not load usage statistics.");
        setUsageStatsToday([]);
        setTimeSeriesUsageData([]);
        setAllFeatureNames([]);
      } finally {
        setIsLoadingUsage(false);
      }
    };

    fetchUsageDataForStatsCard();
  }, [supabase]); // Depend on supabase client instance

  // --- Fetch and process ALL user quotas for the new table ---
  // Re-adding fetch logic for quota display
  const fetchAllUserQuotas = useCallback(async (cacheBuster?: number) => {
    setIsLoadingQuotas(true);
    setQuotaError(null);
    try {
      // 1. Fetch all profiles to get user levels
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, level, level_expires_at'); // Fetch necessary fields
      if (profilesError) throw profilesError;

      // Create a map for quick level lookup and expiry check
      const userLevelMap = new Map<string, { level: UserLevel | null; expiresAt: string | null }>();
      profilesData?.forEach(p => userLevelMap.set(p.id, { level: p.level, expiresAt: p.level_expires_at }));

      // 2. Fetch today's usage for ALL users using the existing RPC function with cache buster
      const { data: usageData, error: usageError } = await supabase.rpc('get_today_all_usage', {
        _cache_buster: cacheBuster || Date.now() // Use provided timestamp or current timestamp
      });

      console.log("Usage Data for Quota Table:", usageData); // Debugging

      if (usageError) {
        console.error("Error fetching all user usage:", usageError);
        if (usageError.code === '42883') {
             throw new Error("Supabase function 'get_today_all_usage' not found. Please ensure it exists.");
        }
        throw usageError;
      }

      // 3. Process data: Group quotas by user ID
      const processedUserQuotas: Record<string, UserQuotaDetails> = {};
      const allFeatureNamesList: FeatureName[] = [ // Ensure this list is comprehensive
        'ai_chatbot', 'ai_peer_review', 'disease_library', 'drug_reference',
        'clinical_guidelines', 'interaction_checker', 'explore_gemini',
        'medical_calculator', 'nutrition_database', 'learning_resources',
        'mind_map_maker', 'clinical_scoring', 'explore_deepseek' // Added explore_deepseek
      ];

      for (const [userId, profileInfo] of userLevelMap.entries()) {
        let effectiveLevel = profileInfo.level ?? 'Free';
        if (effectiveLevel === 'Researcher' && profileInfo.expiresAt) {
          if (new Date(profileInfo.expiresAt) < new Date()) {
            effectiveLevel = 'Free';
          }
        }

        processedUserQuotas[userId] = {
          userId,
          level: effectiveLevel,
          quotas: {} as Record<FeatureName, FeatureQuotaStatus>
        };

        for (const featureName of allFeatureNamesList) {
          const quotaLimit = getQuotaLimit(effectiveLevel, featureName);
          const usageRecord = (usageData as UserDailyUsage[] | null)?.find(
            (u: UserDailyUsage) => u.user_id === userId && u.feature_name === featureName
          );
          const usageToday = usageRecord?.usage_count ?? 0;
          const remainingQuota = quotaLimit === null ? null : Math.max(0, quotaLimit - usageToday);

          processedUserQuotas[userId].quotas[featureName] = {
            limit: quotaLimit,
            used: usageToday,
            remaining: remainingQuota,
          };
        }
      }

      setUserQuotaDetails(processedUserQuotas);

    } catch (error: any) {
      console.error("Error processing user quotas:", error);
      setQuotaError(error.message || "Could not load user quota data.");
      setUserQuotaDetails({});
    } finally {
      setIsLoadingQuotas(false);
    }
  }, [supabase]);

  // Fetch quotas on initial load
  useEffect(() => {
    fetchAllUserQuotas();
  }, [fetchAllUserQuotas]);


  // --- User Management Handlers (existing) ---
  const handleLevelChange = (userId: string, newLevel: UserLevel) => {
    setEditingUsers(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        level: newLevel,
        level_expires_at: newLevel !== 'Researcher' ? null : (prev[userId]?.level_expires_at ?? users.find(u => u.id === userId)?.level_expires_at),
      }
    }));
  };

  const handleExpiryDateChange = (userId: string, date: Date | undefined) => {
    setEditingUsers(prev => ({
      ...prev,
      [userId]: { ...prev[userId], level_expires_at: date ? date.toISOString() : null }
    }));
  };

  const handleSaveUserChanges = async (userId: string) => {
    const changes = editingUsers[userId];
    if (!changes || !changes.level) {
      toast({ title: "Error", description: "User level cannot be empty.", variant: "destructive" }); return;
    }
    const updateData = { level: changes.level, level_expires_at: changes.level === 'Researcher' ? (changes.level_expires_at ?? null) : null };
    try {
      const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
      if (error) throw error;
      setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, ...updateData, updated_at: new Date().toISOString() } : user));
      setEditingUsers(prev => { const newState = { ...prev }; delete newState[userId]; return newState; });
      toast({ title: "Success", description: "User profile updated." });
    } catch (error: any) {
      console.error(`Error updating profile for user ${userId}:`, error);
      toast({ title: "Error Updating Profile", description: error.message || "Could not save changes.", variant: "destructive" });
    }
  };

  // Corrected handleDiscardChanges
  const handleDiscardChanges = (userId: string) => {
     setEditingUsers(prev => {
       const newState = { ...prev };
       delete newState[userId];
       return newState;
     });
  };
  // --- End User Management Handlers ---

  // --- Quota Reset Handler ---
  const handleResetQuota = async (userIdToReset: string) => {
    setIsResettingQuota(userIdToReset); // Indicate loading for this specific user
    try {
      console.log(`[AdminDashboard] Calling RPC 'reset_user_quota_manual' for user ${userIdToReset}`);
      const { error } = await supabase.rpc('reset_user_quota_manual', {
        user_id_param: userIdToReset,
      });

      if (error) {
        console.error(`[AdminDashboard] Error resetting quota for ${userIdToReset}:`, error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Quota for user ${userIdToReset.substring(0, 8)}... has been reset for today.`,
      });

      // Refresh the quota table data after successful reset
      await fetchAllUserQuotas(Date.now());

    } catch (error: any) {
      toast({
        title: "Error Resetting Quota",
        description: error.message || `Could not reset quota for user ${userIdToReset.substring(0, 8)}...`,
        variant: "destructive",
      });
    } finally {
      setIsResettingQuota(null); // Clear loading state
    }
  };
  // --- End Quota Reset Handler ---

  // Handle feature toggle change (existing)
  const handleToggleChange = async (featureName: string, checked: boolean) => {
    const originalToggles = [...featureToggles];
    setFeatureToggles(prevToggles => prevToggles.map(toggle => toggle.feature_name === featureName ? { ...toggle, is_enabled: checked } : toggle));
    try {
      const { error } = await supabase.from('feature_toggles').update({ is_enabled: checked }).eq('feature_name', featureName);
      if (error) throw error;
      toast({ title: "Success", description: `Feature '${featureName.replace(/_/g, ' ')}' ${checked ? 'enabled' : 'disabled'}.` });
    } catch (error: any) {
      console.error(`Error updating toggle for ${featureName}:`, error);
      setFeatureToggles(originalToggles); // Revert optimistic update
      toast({ title: "Error Updating Toggle", description: error.message || `Could not update feature.`, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Feature Toggles Card */}
      <Card className="mb-8">
        <CardHeader><CardTitle>Feature Toggles</CardTitle></CardHeader>
        <CardContent>
          {isLoadingToggles ? (<p>Loading feature toggles...</p>) : featureToggles.length === 0 ? (<p>No feature toggles found.</p>) : (
            <Table>
              <TableHeader><TableRow><TableHead>Feature</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {featureToggles.map((toggle) => (
                  <TableRow key={toggle.feature_name}>
                    {/* Use helper function for display name */}
                    <TableCell className="font-medium">{getDisplayFeatureName(toggle.feature_name)}</TableCell>
                    <TableCell>{toggle.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                         {/* Use helper function for display name in label */}
                         <Label htmlFor={`toggle-${toggle.feature_name}`} className="sr-only">{toggle.is_enabled ? 'Disable' : 'Enable'} {getDisplayFeatureName(toggle.feature_name)}</Label>
                         <Switch id={`toggle-${toggle.feature_name}`} checked={toggle.is_enabled} onCheckedChange={(checked) => handleToggleChange(toggle.feature_name, checked)} aria-label={`Toggle ${getDisplayFeatureName(toggle.feature_name)}`} />
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Management Card */}
      <Card className="mb-8">
        <CardHeader><CardTitle>User Management</CardTitle><CardDescription>View and manage user levels and access.</CardDescription></CardHeader>
        <CardContent>
          {isLoadingUsers ? (<p>Loading users...</p>) : users.length === 0 ? (<p>No user profiles found.</p>) : (
            <Table>
              <TableHeader><TableRow><TableHead>Email / User ID</TableHead><TableHead>Level</TableHead><TableHead>Level Expires</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    {/* Updated TableCell to show only User ID */}
                    <TableCell className="font-medium">
                      {/* <div>{user.email}</div> */} {/* Removed email display */}
                      <div className="text-sm break-all">{user.id}</div> {/* Display ID directly */}
                    </TableCell>
                    <TableCell>
                      <Select value={editingUsers[user.id]?.level ?? user.level ?? 'Free'} onValueChange={(value) => handleLevelChange(user.id, value as UserLevel)}>
                        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Free">Free</SelectItem>
                          <SelectItem value="Researcher">Researcher</SelectItem>
                          {/* Only show Administrator option for the specific user ID */}
                          {user.id === 'bd66e44f-4bcb-494d-803b-9fead7399ddb' && (
                            <SelectItem value="Administrator">Administrator</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {(editingUsers[user.id]?.level ?? user.level) === 'Researcher' ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-[200px] justify-start text-left font-normal", !(editingUsers[user.id]?.level_expires_at ?? user.level_expires_at) && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {(editingUsers[user.id]?.level_expires_at ?? user.level_expires_at) ? format(new Date(editingUsers[user.id]?.level_expires_at ?? user.level_expires_at!), 'PP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={editingUsers[user.id]?.level_expires_at ? new Date(editingUsers[user.id]!.level_expires_at!) : user.level_expires_at ? new Date(user.level_expires_at) : undefined} onSelect={(date) => handleExpiryDateChange(user.id, date)} initialFocus />
                            <div className="p-2 border-t"><Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => handleExpiryDateChange(user.id, undefined)}>Clear Date (No Expiry)</Button></div>
                          </PopoverContent>
                        </Popover>
                      ) : ('-')}
                    </TableCell>
                    <TableCell>{format(new Date(user.created_at), 'PP')}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {editingUsers[user.id] ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleSaveUserChanges(user.id)} title="Save Changes"><Save className="h-4 w-4 text-green-600" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDiscardChanges(user.id)} title="Discard Changes"><XCircle className="h-4 w-4 text-red-600" /></Button>
                        </>
                      ) : (<span className="text-xs text-muted-foreground"></span>)}
                      {/* <Button variant="ghost" size="icon" title="Delete User (Not Implemented)"><Trash2 className="h-4 w-4 text-destructive" /></Button> */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" /> Usage Statistics {/* Changed Icon */}
          </CardTitle>
          <CardDescription>Total usage counts for today and trends over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Today's Usage</h3>
          {isLoadingUsage ? (
            <p>Loading today's usage...</p>
          ) : usageError ? (
            <p className="text-red-600">Error loading usage: {usageError}</p>
          ) : usageStatsToday.length === 0 ? (
            <p>No usage recorded today.</p>
          ) : (
            <Table className="mb-6">
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-center">Users</TableHead> {/* Added Users column */}
                  <TableHead className="text-right">Total Usage Today</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageStatsToday.map((stat) => (
                  <TableRow key={stat.feature_name}>
                    {/* Use helper function for display name */}
                    <TableCell className="font-medium">{getDisplayFeatureName(stat.feature_name)}</TableCell>
                    {/* Users Popover Cell - Now displays User IDs */}
                    <TableCell className="text-center">
                      {stat.userIds.length > 0 ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">
                              <UsersIcon className="mr-1 h-3 w-3" /> {stat.userIds.length}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto max-w-xs p-2">
                            <div className="text-sm font-semibold mb-1">User IDs ({stat.userIds.length})</div>
                            <ul className="list-disc list-inside text-xs max-h-40 overflow-y-auto">
                              {stat.userIds.map((userId, index) => (
                                <li key={index} className="truncate">{userId}</li>
                              ))}
                            </ul>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{stat.total_usage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <h3 className="text-lg font-semibold mt-6 mb-2">Usage Trend (Last 7 Days)</h3>
          {/* Line Chart Implementation */}
          {isLoadingUsage ? (
             <p>Loading usage trend...</p>
          ) : usageError ? (
             <p className="text-red-600">Error loading usage trend: {usageError}</p>
          ) : timeSeriesUsageData.length === 0 ? (
             <p>No usage data available for the last 7 days.</p>
          ) : (
            <div className="mt-4 h-[400px]"> {/* Increased height for line chart */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesUsageData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(dateStr) => format(parseISO(dateStr), 'MMM d')} // Format date for display
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-1 gap-1.5">
                              <div className="font-semibold">{format(parseISO(label), 'PP')}</div>
                              {payload.map((entry) => (
                                <div key={entry.dataKey} className="grid grid-cols-2 gap-1.5 items-center">
                                  <div className="flex items-center gap-1">
                                     <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                     <span className="text-[0.70rem] uppercase text-muted-foreground">
                                       {/* Use helper function for display name */}
                                       {typeof entry.dataKey === 'string' ? getDisplayFeatureName(entry.dataKey) : 'N/A'}
                                     </span>
                                  </div>
                                  <span className="font-semibold ml-auto">{entry.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Use helper function in Legend formatter */}
                  <Legend wrapperStyle={{ fontSize: '10px' }} formatter={(value) => getDisplayFeatureName(value)} />
                  {/* Dynamically generate lines for each feature */}
                  {allFeatureNames.map((featureName, index) => (
                    <Line
                      key={featureName}
                      type="monotone"
                      dataKey={featureName}
                      stroke={`hsl(${index * (360 / (allFeatureNames.length || 1))}, 70%, 50%)`} // Generate distinct colors
                      strokeWidth={2}
                      dot={false}
                      // Use helper function for display name in Line's name prop
                      name={getDisplayFeatureName(featureName)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Quota Display Card - Re-added without refresh */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Daily Quotas</CardTitle>
              <CardDescription>View current daily usage against limits for each user.</CardDescription>
            </div>
            <Button 
              onClick={() => fetchAllUserQuotas(Date.now())} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              disabled={isLoadingQuotas}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingQuotas ? 'animate-spin' : ''}`} />
              <span>{isLoadingQuotas ? 'Refreshing...' : 'Refresh Data'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingQuotas ? (
            <p>Loading user quotas...</p>
          ) : quotaError ? (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Loading Quotas</AlertTitle>
              <AlertDescription>{quotaError}</AlertDescription>
            </Alert>
          ) : Object.keys(userQuotaDetails).length === 0 ? (
            <p>No user quota data available for today.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">User ID</TableHead>
                  <TableHead>Level</TableHead>
                  {/* Dynamically create headers for each feature */}
                  {allFeatureNames.map(featureName => ( // Assuming allFeatureNames is populated by the stats card useEffect
                    <TableHead key={featureName} className="text-center text-xs whitespace-nowrap">
                      {getDisplayFeatureName(featureName)} <br/> (Remaining)
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Quota Reset</TableHead> {/* Changed Header */}
                  <TableHead className="text-right">Actions</TableHead> {/* Added Actions Header */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(userQuotaDetails).map((userDetails) => (
                  <TableRow key={userDetails.userId}>
                    <TableCell className="font-medium text-xs break-all min-w-[150px]">{userDetails.userId}</TableCell>
                    <TableCell>{userDetails.level}</TableCell>
                    {/* Dynamically create cells for each feature quota */}
                    {allFeatureNames.map(featureName => {
                      const quota = userDetails.quotas[featureName as FeatureName]; // Cast needed if allFeatureNames isn't strictly FeatureName[]
                      if (!quota) { // Handle case where a feature might not be in the details (e.g., new feature)
                        return <TableCell key={featureName} className="text-center text-xs text-muted-foreground">-</TableCell>;
                      }
                      let limitText = quota.limit === null ? 'Unlimited' : quota.limit;
                      let displayText = "";

                      if (featureName === 'learning_resources') {
                        displayText = (quota.limit === null ? 'Access' : 'No Access');
                      } else {
                        // Display remaining quota instead of used/limit
                        displayText = quota.remaining === null ? 'Unlimited' : quota.remaining.toString();
                      }

                      return (
                        <TableCell key={featureName} className="text-center text-xs">
                          {/* Display remaining quota */}
                          {displayText}
                        </TableCell>
                      );
                    })}
                    {/* Added Quota Reset Cell */}
                    <TableCell className="text-right">
                      {userRefreshTimes[userDetails.userId] !== undefined ? (
                        formatTime(userRefreshTimes[userDetails.userId])
                      ) : (
                         '-'
                       )}
                     </TableCell>
                     {/* Added Actions Cell with Reset Button */}
                     <TableCell className="text-right">
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button
                             variant="destructive"
                             size="sm"
                             className="text-xs"
                             disabled={isLoadingQuotas || isResettingQuota === userDetails.userId} // Disable while loading or resetting this user
                             title={`Reset Today's Quota for ${userDetails.userId.substring(0,8)}...`}
                           >
                             <RotateCcw className={`mr-1 h-3 w-3 ${isResettingQuota === userDetails.userId ? 'animate-spin' : ''}`} />
                             {isResettingQuota === userDetails.userId ? 'Resetting...' : 'Reset'}
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                             <AlertDialogDescription>
                               This will reset today's usage count for all features for user ID <span className="font-mono break-all">{userDetails.userId}</span> back to zero. This action cannot be undone.
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction onClick={() => handleResetQuota(userDetails.userId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                               Yes, Reset Quota
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* End User Quota Display Card */}

    </div>
  );
};

export default AdminDashboard;
