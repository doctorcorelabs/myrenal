import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserLevel } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getQuotaLimit, hasLearningResourcesAccess, FeatureName } from '@/lib/quotas'; // Import from quotas.ts

// Interface for feature toggle status
interface FeatureToggleStatus {
    [key: string]: boolean; // feature_name: is_enabled
}

interface AccessCheckResult {
  allowed: boolean;
  remaining: number | null; // null if unlimited
  message: string | null; // Message to display if not allowed
  quota: number | null;
  currentUsage: number;
  level: UserLevel | null; // The effective level used for the check
  isExpired?: boolean; // Flag if Researcher level is expired
  isDisabled?: boolean; // Flag if feature is disabled by admin
}

// Helper function to fetch profile details including expiry
interface ProfileDetails {
    level: UserLevel | null;
    level_expires_at: string | null; // ISO string or null
}
const fetchUserProfileForCheck = async (supabaseUser: SupabaseUser): Promise<ProfileDetails> => {
    console.log(`[checkAccess] Fetching profile for user: ${supabaseUser.id}`);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('level, level_expires_at') // Select expiry date as well
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is handled
        console.error('[checkAccess] Error fetching profile:', error);
        return { level: null, level_expires_at: null };
      }
      const fetchedLevel = profile?.level as UserLevel ?? 'Free';
      const fetchedExpiry = profile?.level_expires_at ?? null;
      console.log(`[checkAccess] Fetched profile - Level: ${fetchedLevel}, Expires: ${fetchedExpiry}`);
      return {
          level: fetchedLevel,
          level_expires_at: fetchedExpiry
      };
    } catch (err) {
      console.error('[checkAccess] Exception fetching profile:', err);
      return { level: null, level_expires_at: null };
    }
};


export function useFeatureAccess() {
  const { toast } = useToast();
  const [featureToggles, setFeatureToggles] = useState<FeatureToggleStatus | null>(null);
  const [isLoadingToggles, setIsLoadingToggles] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0); // Track last fetch time
  const refetchInterval = 60000; // Refetch at most once per minute on focus

  // Fetch feature toggle status function
  const fetchToggles = useCallback(async () => {
      if (Date.now() - lastFetchTime < refetchInterval) {
          return;
      }
      setIsLoadingToggles(true);
      try {
        const { data, error } = await supabase
          .from('feature_toggles')
          .select('feature_name, is_enabled');

        if (error) throw error;

        const toggles: FeatureToggleStatus = {};
        data?.forEach(item => {
          toggles[item.feature_name] = item.is_enabled;
        });
        setFeatureToggles(toggles);
      } catch (error) {
        console.error("Error fetching feature toggles:", error);
        setFeatureToggles({});
      } finally {
        setIsLoadingToggles(false);
        setLastFetchTime(Date.now());
      }
  }, [lastFetchTime]); // Removed toast dependency as it's not used here

  // Effect for initial fetch and setting up focus listener
  useEffect(() => {
    fetchToggles();
    window.addEventListener('focus', fetchToggles);
    return () => {
      window.removeEventListener('focus', fetchToggles);
    };
  }, [fetchToggles]);


  const checkAccess = useCallback(async (featureName: FeatureName): Promise<AccessCheckResult> => {
    console.log(`\n--- [checkAccess] Start Check for Feature: ${featureName} ---`);
    const defaultDenied: AccessCheckResult = { allowed: false, remaining: 0, message: 'Authentication required.', quota: 0, currentUsage: 0, level: null };

     if (isLoadingToggles) {
        console.log("[checkAccess] Toggles still loading.");
        return { ...defaultDenied, message: 'Loading feature availability...' };
     }
     console.log("[checkAccess] Toggles loaded:", featureToggles);

    // --- Direct Supabase Auth Check ---
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      console.error('[checkAccess] Auth error or no user found.', authError);
      return defaultDenied;
    }
    console.log(`[checkAccess] User authenticated: ${currentUser.id}`);
    // --- End Direct Supabase Auth Check ---

    // --- Fetch Profile Details (Level & Expiry) ---
    const profileData = await fetchUserProfileForCheck(currentUser);
    let effectiveLevel = profileData.level;
    const levelExpiresAt = profileData.level_expires_at;
    let isExpired = false;

    if (!effectiveLevel) {
        console.error(`[checkAccess] Could not determine user level for user ${currentUser.id}.`);
        return { ...defaultDenied, message: 'Gagal memverifikasi level pengguna.' };
    }
    console.log(`[checkAccess] Initial Level: ${effectiveLevel}`);
    // --- End Fetch Profile Details ---

    // --- Check Feature Toggle Status ---
    const isFeatureEnabled = featureToggles ? featureToggles[featureName] : true;
    console.log(`[checkAccess] Feature '${featureName}' enabled status: ${isFeatureEnabled}`);
    if (!isFeatureEnabled && effectiveLevel !== 'Administrator') {
        console.log(`[checkAccess] Access DENIED: Feature '${featureName}' is disabled by admin.`);
        return { ...defaultDenied, allowed: false, message: 'Fitur ini sedang tidak tersedia.', level: effectiveLevel, isDisabled: true };
    }
    // --- End Check Feature Toggle Status ---


    // --- Handle Administrator Access ---
    if (effectiveLevel === 'Administrator') {
        console.log(`[checkAccess] Access GRANTED: User is Administrator.`);
        return { allowed: true, remaining: null, message: null, quota: null, currentUsage: 0, level: effectiveLevel };
    }
    // --- End Handle Administrator Access ---

    // --- Handle Level Expiry ---
    if (effectiveLevel === 'Researcher' && levelExpiresAt) {
        const expiryDate = new Date(levelExpiresAt);
        if (expiryDate < new Date()) {
            console.log(`[checkAccess] Researcher level expired at ${levelExpiresAt}. Downgrading to Free.`);
            effectiveLevel = 'Free'; // Downgrade effective level
            isExpired = true;
        }
    }
    console.log(`[checkAccess] Effective Level after expiry check: ${effectiveLevel}`);
    // --- End Handle Level Expiry ---


    // --- Check Quotas based on Effective Level using imported functions ---

    // Special check for Learning Resources (Access-based)
    if (featureName === 'learning_resources') {
        const canAccess = hasLearningResourcesAccess(effectiveLevel);
        console.log(`[checkAccess] Learning Resources check - Level: ${effectiveLevel}, Can Access: ${canAccess}`);
        if (!canAccess) {
            const message = `Fitur 'Learning Resources' tidak tersedia untuk level ${effectiveLevel}.`;
            console.log(`[checkAccess] Access DENIED: ${message}`);
            return { allowed: false, remaining: 0, message: message, quota: 0, currentUsage: 0, level: effectiveLevel, isExpired };
        } else {
            console.log(`[checkAccess] Access GRANTED: Learning Resources allowed for level ${effectiveLevel}.`);
            return { allowed: true, remaining: null, message: null, quota: null, currentUsage: 0, level: effectiveLevel, isExpired };
        }
    }

    // Get quota limit for other features
    const userQuota = getQuotaLimit(effectiveLevel, featureName);
    console.log(`[checkAccess] Quota limit for ${featureName} at level ${effectiveLevel}: ${userQuota}`);

    // If quota is null (unlimited for the effective level), allow access
    if (userQuota === null) {
      console.log(`[checkAccess] Access GRANTED: Quota is unlimited for this level.`);
      return { allowed: true, remaining: null, message: null, quota: null, currentUsage: 0, level: effectiveLevel, isExpired };
    }

    // Handle immediate denial if effective level has 0 quota
    if (userQuota === 0) {
        const message = `Fitur '${featureName.replace(/_/g, ' ')}' tidak tersedia untuk level ${effectiveLevel}.`;
        console.log(`[checkAccess] Access DENIED: ${message}`);
        return { allowed: false, remaining: 0, message: message, quota: 0, currentUsage: 0, level: effectiveLevel, isExpired };
    }


    // Fetch current usage from the NEW Supabase function with cache busting
    console.log(`[checkAccess] Calling RPC 'get_today_usage_count' for user ${currentUser.id}, feature ${featureName}`);
    try {
      // *** MODIFIED RPC CALL with cache busting parameter ***
      const { data: usageCount, error: usageError } = await supabase.rpc('get_today_usage_count', {
        user_id_param: currentUser.id,
        feature_name_param: featureName,
        _cache_buster: Date.now(), // Add cache buster to prevent stale data
      });

      if (usageError) {
        console.error(`[checkAccess] Error fetching usage via RPC 'get_today_usage_count':`, usageError);
        return { ...defaultDenied, message: 'Gagal memeriksa kuota penggunaan.', level: effectiveLevel, isExpired };
      }

      // *** MODIFIED RESULT HANDLING ***
      // The new function directly returns the count (number) or null if error/no rows
      const currentUsage = typeof usageCount === 'number' ? usageCount : 0;
      const actualQuota = userQuota; // userQuota was determined using effectiveLevel

      console.log(`[checkAccess] Current Usage (from get_today_usage_count): ${currentUsage}, Quota Limit: ${actualQuota}`);

      const remaining = actualQuota - currentUsage;

      if (currentUsage >= actualQuota) {
        const message = `Kuota harian (${actualQuota}) untuk fitur '${featureName.replace(/_/g, ' ')}' telah tercapai. Coba lagi besok.`;
        console.log(`[checkAccess] Access DENIED: ${message}`);
        return {
          allowed: false,
          remaining: 0,
          message: message,
          quota: actualQuota,
          currentUsage: currentUsage,
          level: effectiveLevel,
          isExpired
        };
      } else {
        console.log(`[checkAccess] Access GRANTED: Usage (${currentUsage}) is less than quota (${actualQuota}). Remaining: ${remaining}`);
        return {
          allowed: true,
          remaining: remaining,
          message: null,
          quota: actualQuota,
          currentUsage: currentUsage,
          level: effectiveLevel,
          isExpired
        };
      }
    } catch (err) {
      console.error(`[checkAccess] Exception fetching usage via RPC 'get_today_usage_count':`, err);
      return { ...defaultDenied, message: 'Terjadi kesalahan saat memeriksa kuota.', level: effectiveLevel, isExpired };
    }
  }, [supabase, featureToggles, isLoadingToggles]); // Added dependencies

  const incrementUsage = useCallback(async (featureName: FeatureName) => {
    console.log(`[incrementUsage] Attempting to increment usage for feature: ${featureName}`);
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      console.warn('[incrementUsage] Not authenticated.');
      toast({
          title: "Error",
          description: `Gagal mencatat penggunaan: Autentikasi tidak valid.`,
          variant: "destructive",
        });
      return;
    }
    console.log(`[incrementUsage] User authenticated: ${currentUser.id}`);

    try {
      console.log(`[incrementUsage] Calling RPC 'increment_usage' for user ${currentUser.id}, feature ${featureName}`);
      const { error } = await supabase.rpc('increment_usage', {
        user_id_param: currentUser.id,
        feature_name_param: featureName,
      });

      if (error) {
        console.error(`[incrementUsage] Error calling RPC:`, error);
        toast({
          title: "Error",
          description: `Gagal mencatat penggunaan fitur '${featureName.replace(/_/g, ' ')}'.`,
          variant: "destructive",
        });
      } else {
        console.log(`[incrementUsage] Successfully incremented usage for ${featureName}.`);
      }
    } catch (err) {
      console.error(`[incrementUsage] Exception calling RPC:`, err);
       toast({
          title: "Error",
          description: `Terjadi kesalahan saat mencatat penggunaan fitur '${featureName.replace(/_/g, ' ')}'.`,
          variant: "destructive",
        });
    }
  }, [supabase, toast]);

  return { checkAccess, incrementUsage, isLoadingToggles };
}
