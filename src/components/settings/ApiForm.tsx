import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiKeys } from '@/hooks/useApiKeys';
import { API_KEY_CATEGORIES } from '@/types/apiKeys';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ExternalLink, 
  Check, 
  Database, 
  Bot, 
  Music 
} from 'lucide-react';

export function ApiForm() {
  const { apiKeys, isLoading, saveApiKeys, validateApiKey } = useApiKeys();
  const [localKeys, setLocalKeys] = useState(apiKeys);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState(API_KEY_CATEGORIES[0].id);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalKeys(apiKeys);
  }, [apiKeys]);

  const handleKeyChange = (keyId: string, value: string) => {
    setLocalKeys(prev => ({
      ...prev,
      [keyId]: value
    }));

    // Real-time validation
    if (value && !validateApiKey(keyId, value)) {
      setValidationErrors(prev => ({
        ...prev,
        [keyId]: '올바른 형식이 아닙니다'
      }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[keyId];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    // Validate all keys
    const errors: Record<string, string> = {};
    let hasError = false;

    API_KEY_CATEGORIES.forEach(category => {
      category.keys.forEach(key => {
        const value = localKeys[key.id];
        if (key.required && !value) {
          errors[key.id] = '필수 항목입니다';
          hasError = true;
        } else if (value && !validateApiKey(key.id, value)) {
          errors[key.id] = '올바른 형식이 아닙니다';
          hasError = true;
        }
      });
    });

    if (hasError) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    await saveApiKeys(localKeys);
    setSaving(false);
  };

  const handleReset = () => {
    if (confirm('모든 API 설정을 초기화하시겠습니까?')) {
      setLocalKeys({});
      setValidationErrors({});
    }
  };

  const togglePasswordVisibility = (keyId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database':
        return <Database className="w-4 h-4" />;
      case 'Bot':
        return <Bot className="w-4 h-4" />;
      case 'Music':
        return <Music className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">API 설정</h3>
        <p className="text-sm text-muted-foreground">
          각 서비스의 API 키를 설정하세요. 키는 로컬 브라우저에 안전하게 저장됩니다.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3 mb-6">
          {API_KEY_CATEGORIES.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              {getCategoryIcon(category.icon)}
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {API_KEY_CATEGORIES.map(category => (
          <TabsContent 
            key={category.id} 
            value={category.id}
            className="space-y-6"
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {category.description}
              </AlertDescription>
            </Alert>

            <div className="space-y-5">
              {category.keys.map(key => (
                <div key={key.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={key.id} className="flex items-center gap-2">
                      {key.name}
                      {key.required && (
                        <span className="text-xs text-destructive">*</span>
                      )}
                      {localKeys[key.id] && validateApiKey(key.id, localKeys[key.id]) && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </Label>
                    {key.docsUrl && (
                      <a
                        href={key.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Get Key
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {key.description}
                  </p>

                  <div className="relative">
                    <Input
                      id={key.id}
                      type={key.type === 'password' && !showPassword[key.id] ? 'password' : 'text'}
                      value={localKeys[key.id] || ''}
                      onChange={(e) => handleKeyChange(key.id, e.target.value)}
                      placeholder={key.placeholder}
                      className={cn(
                        "pr-10",
                        validationErrors[key.id] && "border-destructive"
                      )}
                    />
                    {key.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(key.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword[key.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {validationErrors[key.id] && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors[key.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="outline" onClick={handleReset}>
          초기화
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            '저장'
          )}
        </Button>
      </div>
    </div>
  );
}
