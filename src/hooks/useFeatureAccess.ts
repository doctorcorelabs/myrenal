import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth, UserLevel } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast'; // Assuming you use shadcn/ui toast

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

export function useFeatureAccess() {
  const { user, level, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const checkAccess = useCallback(async (featureName: FeatureName): Promise<AccessCheckResult> => {
    const defaultDenied: AccessCheckResult = { allowed: false, remaining: 0, message: 'Authentication required.', quota: 0, currentUsage: 0, level: null };

    if (!isAuthenticated || !user || !level) {
      return defaultDenied;
    }

    const featureQuotas = quotas[featureName];
    if (!featureQuotas) {
      console.error(`Quota definition missing for feature: ${featureName}`);
      return { ...defaultDenied, message: 'Feature configuration error.' };
    }

    const userQuota = featureQuotas[level];

    // Handle immediate denial based on level (quota is 0)
    if (userQuota === 0) {
        const message = level === 'Free' || level === 'Premium'
            ? `Fitur '${featureName.replace(/_/g, ' ')}' memerlukan level Researcher.`
            : `Anda tidak memiliki akses ke fitur '${featureName.replace(/_/g, ' ')}'.`;
      return { allowed: false, remaining: 0, message: message, quota: 0, currentUsage: 0, level: level };
    }

    // If quota is null (unlimited), allow access immediately
    if (userQuota === null) {
      return { allowed: true, remaining: null, message: null, quota: null, currentUsage: 0, level: level }; // Current usage doesn't matter for unlimited
    }

    // Fetch current usage from Supabase function
    try {
      const { data, error } = await supabase.rpc('get_user_level_and_usage', {
        user_id_param: user.id,
        feature_name_param: featureName,
      });

      if (error) {
        console.error(`Error fetching usage for ${featureName}:`, error);
        return { ...defaultDenied, message: 'Gagal memeriksa kuota penggunaan.' };
      }

      // The function returns an array, we expect one result
      const usageData = data?.[0];
      const currentUsage = usageData?.usage_count ?? 0;
      const fetchedLevel = usageData?.user_level as UserLevel ?? level; // Use fetched level if available, fallback to context

       // Double check level consistency if needed
       if (fetchedLevel !== level) {
           console.warn(`Level mismatch between context (${level}) and DB (${fetchedLevel}) for user ${user.id}. Using DB level.`);
           // Potentially update context level here if desired, or just use DB level for check
       }
       const actualQuota = quotas[featureName]?.[fetchedLevel] ?? 0; // Use potentially updated level

       if (actualQuota === 0) {
            const message = `Fitur '${featureName.replace(/_/g, ' ')}' memerlukan level yang lebih tinggi.`;
            return { allowed: false, remaining: 0, message: message, quota: 0, currentUsage: currentUsage, level: fetchedLevel };
       }
       if (actualQuota === null) { // Unlimited based on DB level
            return { allowed: true, remaining: null, message: null, quota: null, currentUsage: currentUsage, level: fetchedLevel };
       }


      const remaining = actualQuota - currentUsage;

      if (currentUsage >= actualQuota) {
        return {
          allowed: false,
          remaining: 0,
          message: `Kuota harian (${actualQuota}) untuk fitur '${featureName.replace(/_/g, ' ')}' telah tercapai. Upgrade untuk penggunaan lebih lanjut atau coba lagi besok.`,
          quota: actualQuota,
          currentUsage: currentUsage,
          level: fetchedLevel
        };
      } else {
        return {
          allowed: true,
          remaining: remaining,
          message: null,
          quota: actualQuota,
          currentUsage: currentUsage,
          level: fetchedLevel
        };
      }
    } catch (err) {
      console.error(`Exception fetching usage for ${featureName}:`, err);
      return { ...defaultDenied, message: 'Terjadi kesalahan saat memeriksa kuota.' };
    }
  }, [isAuthenticated, user, level, supabase]); // Include supabase if its instance could change, though unlikely

  const incrementUsage = useCallback(async (featureName: FeatureName) => {
    if (!isAuthenticated || !user) {
      console.warn('Attempted to increment usage while not authenticated.');
      return;
    }

    try {
      const { error } = await supabase.rpc('increment_usage', {
        user_id_param: user.id,
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
  }, [isAuthenticated, user, supabase, toast]); // Include supabase and toast

  return { checkAccess, incrementUsage };
}
