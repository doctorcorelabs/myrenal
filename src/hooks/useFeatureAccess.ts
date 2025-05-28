import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserLevel } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Interface for feature toggle status
interface FeatureToggleStatus {
    [key: string]: boolean; // feature_name: is_enabled
}

interface AccessCheckResult {
  allowed: boolean;
  message: string | null; // Message to display if not allowed
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
  }, [lastFetchTime]);

  // Effect for initial fetch and setting up focus listener
  useEffect(() => {
    fetchToggles();
    window.addEventListener('focus', fetchToggles);
    return () => {
      window.removeEventListener('focus', fetchToggles);
    };
  }, [fetchToggles]);


  const checkAccess = useCallback(async (featureName: string): Promise<AccessCheckResult> => {
    console.log(`\n--- [checkAccess] Start Check for Feature: ${featureName} ---`);
    const defaultDenied: AccessCheckResult = { allowed: false, message: 'Authentication required.', level: null };

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
        return { ...defaultDenied, message: 'Failed to verify user level.' };
    }
    console.log(`[checkAccess] Initial Level: ${effectiveLevel}`);
    // --- End Fetch Profile Details ---

    // --- Check Feature Toggle Status ---
    const isFeatureEnabled = featureToggles ? featureToggles[featureName] : true;
    console.log(`[checkAccess] Feature '${featureName}' enabled status: ${isFeatureEnabled}`);
    if (!isFeatureEnabled && effectiveLevel !== 'Administrator') {
        console.log(`[checkAccess] Access DENIED: Feature '${featureName}' is disabled by admin.`);
        return { ...defaultDenied, allowed: false, message: 'This feature is currently unavailable.', level: effectiveLevel, isDisabled: true };
    }
    // --- End Check Feature Toggle Status ---


    // --- Handle Administrator Access ---
    if (effectiveLevel === 'Administrator') {
        console.log(`[checkAccess] Access GRANTED: User is Administrator.`);
        return { allowed: true, message: null, level: effectiveLevel };
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

    // All features are allowed for authenticated users unless explicitly disabled by admin
    // or if it's 'learning_resources' for 'Free' level.
    if (featureName === 'learning_resources' && effectiveLevel === 'Free') {
        const message = `Feature 'Learning Resources' is not available for level ${effectiveLevel}.`;
        console.log(`[checkAccess] Access DENIED: ${message}`);
        return { allowed: false, message: message, level: effectiveLevel, isExpired };
    }

    console.log(`[checkAccess] Access GRANTED: Feature '${featureName}' allowed for level ${effectiveLevel}.`);
    return { allowed: true, message: null, level: effectiveLevel, isExpired };

  }, [supabase, featureToggles, isLoadingToggles]);

  return { checkAccess, isLoadingToggles };
}
