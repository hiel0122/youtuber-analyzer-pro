import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface ApiKeyValues {
  [key: string]: string;
}

const STORAGE_KEY = 'api_keys';

// Legacy key migration map
const LEGACY_KEY_MAP: Record<string, string> = {
  'gemini_api_key': 'gemini_api',
};

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyValues>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load API keys from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let keys: ApiKeyValues = {};
      
      if (stored) {
        keys = JSON.parse(stored);
      }

      // Migrate legacy keys
      Object.entries(LEGACY_KEY_MAP).forEach(([oldKey, newKey]) => {
        const legacyValue = localStorage.getItem(oldKey);
        if (legacyValue && !keys[newKey]) {
          keys[newKey] = legacyValue;
          localStorage.removeItem(oldKey);
        }
      });

      setApiKeys(keys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save all API keys
  const saveApiKeys = useCallback(async (keys: ApiKeyValues): Promise<boolean> => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
      setApiKeys(keys);
      toast.success('API 키가 저장되었습니다!');
      return true;
    } catch (error) {
      console.error('Failed to save API keys:', error);
      toast.error('API 키 저장에 실패했습니다.');
      return false;
    }
  }, []);

  // Get specific API key
  const getApiKey = useCallback((keyId: string): string => {
    return apiKeys[keyId] || '';
  }, [apiKeys]);

  // Update specific API key (in memory only, call saveApiKeys to persist)
  const updateApiKey = useCallback((keyId: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [keyId]: value
    }));
  }, []);

  // Validate API key format
  const validateApiKey = useCallback((keyId: string, value: string): boolean => {
    if (!value) return true; // Empty is valid (not filled yet)

    const validations: Record<string, RegExp> = {
      supabase_url: /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
      supabase_key: /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      youtube_api: /^AIza[A-Za-z0-9_-]{35}$/,
      openai_api: /^sk-(proj-)?[A-Za-z0-9]{20,}$/,
      gemini_api: /^AIza[A-Za-z0-9_-]{35}$/,
      claude_api: /^sk-ant-api[0-9]+-[A-Za-z0-9_-]+$/,
    };

    const pattern = validations[keyId];
    if (pattern) {
      return pattern.test(value);
    }

    // Default: minimum length check
    return value.length >= 10;
  }, []);

  // Check if all required keys are filled
  const hasRequiredKeys = useCallback((requiredKeyIds: string[]): boolean => {
    return requiredKeyIds.every(keyId => {
      const value = apiKeys[keyId];
      return value && value.length > 0;
    });
  }, [apiKeys]);

  return {
    apiKeys,
    isLoading,
    getApiKey,
    updateApiKey,
    saveApiKeys,
    validateApiKey,
    hasRequiredKeys
  };
};
