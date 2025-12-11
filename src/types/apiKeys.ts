export interface ApiKey {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  required: boolean;
  docsUrl?: string;
  type: 'text' | 'password';
}

export interface ApiKeyCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  keys: ApiKey[];
}

export const API_KEY_CATEGORIES: ApiKeyCategory[] = [
  {
    id: 'data_storage',
    name: 'Data & Storage',
    icon: 'Database',
    description: '데이터 저장소 및 외부 API 연동을 위한 키입니다.',
    keys: [
      {
        id: 'supabase_url',
        name: 'Supabase URL',
        description: '프로젝트 URL (https://xxx.supabase.co)',
        placeholder: 'https://xxxxx.supabase.co',
        required: true,
        docsUrl: 'https://supabase.com/dashboard/project/_/settings/api',
        type: 'text'
      },
      {
        id: 'supabase_key',
        name: 'Supabase Anon Key',
        description: '프로젝트 익명 키',
        placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: true,
        docsUrl: 'https://supabase.com/dashboard/project/_/settings/api',
        type: 'password'
      },
      {
        id: 'youtube_api',
        name: 'YouTube Data API v3',
        description: 'YouTube 데이터 조회용 API 키',
        placeholder: 'AIzaSyC...',
        required: true,
        docsUrl: 'https://console.cloud.google.com/apis/credentials',
        type: 'password'
      }
    ]
  },
  {
    id: 'ai_models',
    name: 'AI Models',
    icon: 'Bot',
    description: '생성형 AI 모델 API 키입니다.',
    keys: [
      {
        id: 'openai_api',
        name: 'ChatGPT (OpenAI)',
        description: 'GPT-4, GPT-3.5 API 키',
        placeholder: 'sk-proj-...',
        required: false,
        docsUrl: 'https://platform.openai.com/api-keys',
        type: 'password'
      },
      {
        id: 'gemini_api',
        name: 'Gemini (Google)',
        description: 'Gemini Pro/Flash API 키',
        placeholder: 'AIzaSyD...',
        required: false,
        docsUrl: 'https://aistudio.google.com/app/apikey',
        type: 'password'
      },
      {
        id: 'claude_api',
        name: 'Claude (Anthropic)',
        description: 'Claude 3 API 키',
        placeholder: 'sk-ant-api03-...',
        required: false,
        docsUrl: 'https://console.anthropic.com/settings/keys',
        type: 'password'
      }
    ]
  },
  {
    id: 'creative_tools',
    name: 'Creative Tools',
    icon: 'Music',
    description: '크리에이티브 도구 API 키입니다.',
    keys: [
      {
        id: 'suno_api',
        name: 'Suno AI',
        description: 'AI 음악 생성 API',
        placeholder: 'suno_...',
        required: false,
        docsUrl: 'https://suno.ai',
        type: 'password'
      },
      {
        id: 'elevenlabs_api',
        name: 'ElevenLabs',
        description: 'AI 음성 합성 API',
        placeholder: 'el_...',
        required: false,
        docsUrl: 'https://elevenlabs.io/api',
        type: 'password'
      }
    ]
  }
];
