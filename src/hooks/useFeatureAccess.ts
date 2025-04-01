import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth, UserLevel } from '@/contexts/AuthContext'; // Keep useAuth for toast, maybe fallback?
import { useToast } from '@/components/ui/use-toast';
import { User as SupabaseUser } from '@supabase/supabase-js'; // Import SupabaseUser type

// Define feature names consistently (used as keys and in DB)
export type FeatureName =
  | 'ai_chatbot'
  | 'ai_peer_review'
  | 'disease_library'
  | 'drug_reference'
  | 'clinical_guidelines'
  | 'interaction_checker'
  | 'explore_gemini'
  | 'nutrition_database'
  | 'learning_resources';
  // Add other features here if needed

// Define quotas (null means unlimited, 0 means no access)
const quotas: Record<FeatureName, Record<UserLevel, number | null>> = {
  ai_chatbot: { Free: 10, Premium: 30, Researcher: null },
  ai_peer_review: { Free: 5, Premium: 15, Researcher: null },
  disease_library: { Free: 10, Premium: 20, Researcher: null },
  drug_reference: { Free: 10, Premium: 20, Researcher: null },
  clinical_guidelines: { Free: 5, Premium: 50, Researcher: null },
  interaction_checker: { Free: 5, Premium: 15, Researcher: null },
  explore_gemini: { Free: 5, Premium: 20, Researcher: 50 },
  nutrition_database: { Free: 10, Premium: 20, Researcher: null },
  learning_resources: { Free: 0, Premium: 0, Researcher: null }, // No access for Free/Premium
};

interface AccessCheckResult {
  allowed: boolean;
  remaining: number | null; // null if unlimited
  message: string | null; // Message to display if not allowed
  quota: number | null;
  currentUsage: number;
  level: UserLevel | null;
}

// Helper function (can be moved or kept here) - similar to AuthContext
const fetchUserProfileForCheck = async (supabaseUser: SupabaseUser): Promise<{ level: UserLevel | null }> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('level')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile in checkAccess:', error);
        return { level: null }; // Indicate error or inability to fetch level
      }
      // Default to 'Free' if profile exists but level is null, or if profile doesn't exist yet
      return { level: profile?.level as UserLevel ?? 'Free' };
    } catch (err) {
      console.error('Exception fetching profile in checkAccess:', err);
      return { level: null };
    }
};


export function useFeatureAccess() {
  // Keep useAuth primarily for toast or potentially as a fallback, but checkAccess will re-verify
  const { toast } = useToast();
  // const { user: contextUser, level: contextLevel, isAuthenticated: contextIsAuthenticated } = useAuth(); // Can keep for comparison/logging if needed

  const checkAccess = useCallback(async (featureName: FeatureName): Promise<AccessCheckResult> => {
    const defaultDenied: AccessCheckResult = { allowed: false, remaining: 0, message: 'Authentication required.', quota: 0, currentUsage: 0, level: null };

    // --- Direct Supabase Auth Check ---
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      console.error('checkAccess: Auth error or no user found.', authError);
      return defaultDenied;
    }
    // --- End Direct Supabase Auth Check ---

    // --- Fetch Profile Level Directly ---
    const profileData = await fetchUserProfileForCheck(currentUser);
    const currentLevel = profileData.level;

    if (!currentLevel) {
        console.error(`checkAccess: Could not determine user level for user ${currentUser.id}.`);
        // Decide how to handle - deny access or default to Free? Let's deny for safety.
        return { ...defaultDenied, message: 'Gagal memverifikasi level pengguna.' };
    }
    // --- End Fetch Profile Level ---

    const featureQuotas = quotas[featureName];
    if (!featureQuotas) {
      console.error(`Quota definition missing for feature: ${featureName}`);
      return { ...defaultDenied, message: 'Feature configuration error.', level: currentLevel };
    }

    const userQuota = featureQuotas[currentLevel]; // Use freshly fetched level

    // Handle immediate denial based on fetched level (quota is 0)
    if (userQuota === 0) {
        const message = currentLevel === 'Free' || currentLevel === 'Premium'
            ? `Fitur '${featureName.replace(/_/g, ' ')}' memerlukan level Researcher.`
            : `Anda tidak memiliki akses ke fitur '${featureName.replace(/_/g, ' ')}'.`;
      return { allowed: false, remaining: 0, message: message, quota: 0, currentUsage: 0, level: currentLevel };
    }

    // If quota is null (unlimited based on fetched level), allow access immediately
    if (userQuota === null) {
      return { allowed: true, remaining: null, message: null, quota: null, currentUsage: 0, level: currentLevel }; // Current usage doesn't matter for unlimited
    }

    // Fetch current usage from Supabase function using the confirmed user ID
    try {
      const { data, error: usageError } = await supabase.rpc('get_user_level_and_usage', {
        user_id_param: currentUser.id, // Use ID from getUser()
        feature_name_param: featureName,
      });

      if (usageError) {
        console.error(`Error fetching usage for ${featureName}:`, usageError);
        return { ...defaultDenied, message: 'Gagal memeriksa kuota penggunaan.', level: currentLevel };
      }

      // The function returns an array, we expect one result
      const usageData = data?.[0];
      const currentUsage = usageData?.usage_count ?? 0;
      // We already fetched the level reliably above, so use currentLevel
      const actualQuota = userQuota; // userQuota was determined using currentLevel

      const remaining = actualQuota - currentUsage;

      if (currentUsage >= actualQuota) {
        return {
          allowed: false,
          remaining: 0,
          message: `Kuota harian (${actualQuota}) untuk fitur '${featureName.replace(/_/g, ' ')}' telah tercapai. Upgrade untuk penggunaan lebih lanjut atau coba lagi besok.`,
          quota: actualQuota,
          currentUsage: currentUsage,
          level: currentLevel
        };
      } else {
        return {
          allowed: true,
          remaining: remaining,
          message: null,
          quota: actualQuota,
          currentUsage: currentUsage,
          level: currentLevel
        };
      }
    } catch (err) {
      console.error(`Exception fetching usage for ${featureName}:`, err);
      return { ...defaultDenied, message: 'Terjadi kesalahan saat memeriksa kuota.', level: currentLevel };
    }
  }, [supabase]); // Dependency is now only supabase client instance

  const incrementUsage = useCallback(async (featureName: FeatureName) => {
    // Re-check auth directly here too for robustness
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      console.warn('Attempted to increment usage while not authenticated (checked again).');
      toast({
          title: "Error",
          description: `Gagal mencatat penggunaan: Autentikasi tidak valid.`,
          variant: "destructive",
        });
      return;
    }

    try {
      const { error } = await supabase.rpc('increment_usage', {
        user_id_param: currentUser.id, // Use ID from getUser()
        feature_name_param: featureName,
      });

      if (error) {
        console.error(`Error incrementing usage for ${featureName}:`, error);
        toast({
          title: "Error",
          description: `Gagal mencatat penggunaan fitur '${featureName.replace(/_/g, ' ')}'.`,
          variant: "destructive",
        });
      }
      // Optionally: refetch usage or update local state if needed immediately
    } catch (err) {
      console.error(`Exception incrementing usage for ${featureName}:`, err);
       toast({
          title: "Error",
          description: `Terjadi kesalahan saat mencatat penggunaan fitur '${featureName.replace(/_/g, ' ')}'.`,
          variant: "destructive",
        });
    }
  }, [supabase, toast]); // Include supabase and toast

  return { checkAccess, incrementUsage };
}
