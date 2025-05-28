import { UserLevel } from '@/contexts/AuthContext';

// Define feature names for access control
export type FeatureName = 
  | 'medical_calculator'
  | 'drug_reference'
  | 'nutrition_database'
  | 'disease_library'
  | 'clinical_guidelines'
  | 'ai_chatbot'
  | 'explore_gemini'
  | 'explore_deepseek'
  | 'interaction_checker'
  | 'mind_map_maker'
  | 'clinical_scoring'
  | 'learning_resources'
  | 'custom_feature';  // Add any other features as needed

// Optional: You can add quota definitions here if needed
export interface QuotaDefinition {
  feature: FeatureName;
  limit: number;
  period?: 'daily' | 'weekly' | 'monthly';
}

// Optional: Default quotas if needed
export const defaultQuotas: Record<FeatureName, QuotaDefinition> = {
  medical_calculator: { feature: 'medical_calculator', limit: -1 },  // -1 means unlimited
  drug_reference: { feature: 'drug_reference', limit: -1 },
  nutrition_database: { feature: 'nutrition_database', limit: -1 },
  disease_library: { feature: 'disease_library', limit: -1 },
  clinical_guidelines: { feature: 'clinical_guidelines', limit: -1 },
  ai_chatbot: { feature: 'ai_chatbot', limit: 10, period: 'daily' },
  explore_gemini: { feature: 'explore_gemini', limit: 10, period: 'daily' },
  explore_deepseek: { feature: 'explore_deepseek', limit: 10, period: 'daily' },
  interaction_checker: { feature: 'interaction_checker', limit: -1 },
  mind_map_maker: { feature: 'mind_map_maker', limit: 5, period: 'daily' },
  clinical_scoring: { feature: 'clinical_scoring', limit: -1 },
  learning_resources: { feature: 'learning_resources', limit: -1 },
  custom_feature: { feature: 'custom_feature', limit: -1 }
};

// Function to get the quota limit for a given level and feature
export const getQuotaLimit = (level: UserLevel | null, feature: FeatureName): number | null => {
  // For now, we'll use defaultQuotas. In the future, this could be extended
  // to fetch from a database based on user level.
  const quota = defaultQuotas[feature];
  if (quota) {
    // If limit is -1, it means unlimited, so return null
    return quota.limit === -1 ? null : quota.limit;
  }
  return null; // Return null if feature not found or no specific limit
};
