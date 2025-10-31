import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'ko' | 'en';

interface Translations {
  [key: string]: {
    ko: string;
    en: string;
  };
}

const translations: Translations = {
  'settings.title': { ko: '설정', en: 'Settings' },
  'settings.tabs.general': { ko: '일반', en: 'General' },
  'settings.tabs.channel': { ko: '채널', en: 'Channel' },
  'settings.tabs.api': { ko: 'API', en: 'API' },
  'settings.tabs.account': { ko: '계정', en: 'Account' },
  'settings.tabs.usage': { ko: '사용량', en: 'Usage' },
  'settings.save': { ko: '저장', en: 'Save' },
  'settings.saving': { ko: '저장 중...', en: 'Saving...' },
  'settings.saved': { ko: '저장되었습니다.', en: 'Saved successfully.' },
  
  // General
  'general.title': { ko: '일반 설정', en: 'General Settings' },
  'general.language': { ko: '언어', en: 'Language' },
  'general.theme': { ko: '테마', en: 'Theme' },
  'general.korean': { ko: '한국어', en: 'Korean' },
  'general.english': { ko: 'English', en: 'English' },
  'general.dark': { ko: 'Dark', en: 'Dark' },
  'general.light': { ko: 'Light', en: 'Light' },
  'general.system': { ko: 'System', en: 'System' },
  
  // Channel
  'channel.title': { ko: '채널 설정', en: 'Channel Settings' },
  'channel.competitors': { ko: '경쟁 채널 등록', en: 'Competitor Channels' },
  'channel.competitors.desc': { ko: '최대 5개까지 경쟁 채널을 등록할 수 있습니다.', en: 'Register up to 5 competitor channels.' },
  'channel.competitors.add': { ko: '채널 추가', en: 'Add Channel' },
  'channel.competitors.placeholder': { ko: 'https://www.youtube.com/@channelname', en: 'https://www.youtube.com/@channelname' },
  'channel.range': { ko: '기본 조회 범위', en: 'Default Range' },
  'channel.range.all': { ko: '전체', en: 'All' },
  'channel.range.30': { ko: '30일', en: '30 days' },
  'channel.range.90': { ko: '90일', en: '90 days' },
  'channel.range.180': { ko: '180일', en: '180 days' },
  'channel.range.365': { ko: '365일', en: '365 days' },
  
  // API
  'api.title': { ko: 'API 설정', en: 'API Settings' },
  'api.notice.secure': { ko: 'API 키는 암호화되어 저장되며, 다른 사용자와 공유되지 않습니다.', en: 'API keys are encrypted and never shared with other users.' },
  'api.labels.supabaseUrl': { ko: 'Supabase URL', en: 'Supabase URL' },
  'api.labels.supabaseKey': { ko: 'Supabase Anon Key', en: 'Supabase Anon Key' },
  'api.labels.youtubeData': { ko: 'Youtube Data API', en: 'Youtube Data API' },
  'api.labels.youtubeAnalytics': { ko: 'Youtube Analytics API', en: 'Youtube Analytics API' },
  'api.warn.analyticsSensitive': { ko: 'Analytics API Key 값은 중요한 Key 이므로 노출에 주의하세요.', en: 'Your Analytics API key is sensitive. Handle with care.' },
  'api.help.youtubeData': { ko: 'YouTube Data API v3 키가 필요합니다. Google Cloud Console에서 발급받을 수 있습니다.', en: 'YouTube Data API v3 key is required. You can obtain it from Google Cloud Console.' },
  'api.help.youtubeAnalytics': { ko: 'YouTube Analytics API 키가 필요합니다. Google Cloud Console에서 활성화 및 발급받을 수 있습니다.', en: 'YouTube Analytics API key is required. You can enable and obtain it from Google Cloud Console.' },
  'api.help.supabase': { ko: 'Supabase 프로젝트 설정에서 확인할 수 있습니다.', en: 'Available in your Supabase project settings.' },
  
  // Account
  'account.title': { ko: '계정 정보', en: 'Account Information' },
  'account.profile': { ko: '프로필 사진', en: 'Profile Picture' },
  'account.displayName': { ko: '표시 이름', en: 'Display Name' },
  'account.email': { ko: '이메일', en: 'Email' },
  'account.management': { ko: '계정 관리', en: 'Account Management' },
  'account.team': { ko: '팀 계정 관리', en: 'Team Account Management' },
  'account.team.desc': { ko: '팀원을 초대하고 권한을 관리하세요.', en: 'Invite team members and manage permissions.' },
  'account.logout': { ko: '로그아웃', en: 'Logout' },
  'account.delete': { ko: '계정 삭제', en: 'Delete Account' },
  
  // Usage
  'usage.title': { ko: '사용량', en: 'Usage' },
  'usage.credit.label': { ko: '크레딧 사용량', en: 'Credit Usage' },
  'usage.trend.title': { ko: '사용량 추이', en: 'Usage Trend' },
  'usage.trend.details': { ko: '자세히 보기', en: 'View Details' },
  'usage.metrics.analysis': { ko: '분석 채널 횟수', en: 'Channel Analysis Count' },
  'usage.metrics.dataApi': { ko: 'Data API 호출', en: 'Data API Calls' },
  'usage.metrics.analyticsApi': { ko: 'Analytics API 호출', en: 'Analytics API Calls' },
  'usage.metrics.dataSave': { ko: 'Data Save', en: 'Data Save' },
  
  // Alerts
  'alerts.apiRequired': { ko: 'API가 설정되지 않아 분석을 할 수 없습니다.', en: "Analysis can't run because required APIs aren't configured." },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ko');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
