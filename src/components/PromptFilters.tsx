import { cn } from '@/lib/utils';

interface PromptFiltersProps {
  selectedModel: string;
  selectedCategory: string;
  selectedForm: string;
  onModelChange: (model: string) => void;
  onCategoryChange: (category: string) => void;
  onFormChange: (form: string) => void;
}

const MODELS = [
  '전체', 'ChatGPT', 'Gemini', 'Claude', 'Grok', 'Copilot',
  'Perplexity', 'Suno', 'Midjourney', 'DALL-E', 'Runway', 'Sora'
];

const CATEGORIES = [
  '전체', '일반', '이미지', '코딩', '음악', '영상'
];

const FORMS = [
  '전체', '자연어', 'Query', 'JSON'
];

export function PromptFilters({
  selectedModel,
  selectedCategory,
  selectedForm,
  onModelChange,
  onCategoryChange,
  onFormChange
}: PromptFiltersProps) {
  const FilterButton = ({
    label,
    isSelected,
    onClick
  }: {
    label: string;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isSelected
          ? "bg-blue-600 text-white shadow-md"
          : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
      {/* Model Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Model</h3>
        <div className="flex flex-wrap gap-2">
          {MODELS.map((model) => (
            <FilterButton
              key={model}
              label={model}
              isSelected={selectedModel === model}
              onClick={() => onModelChange(model)}
            />
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Category</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <FilterButton
              key={category}
              label={category}
              isSelected={selectedCategory === category}
              onClick={() => onCategoryChange(category)}
            />
          ))}
        </div>
      </div>

      {/* Form Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Form</h3>
        <div className="flex flex-wrap gap-2">
          {FORMS.map((form) => (
            <FilterButton
              key={form}
              label={form}
              isSelected={selectedForm === form}
              onClick={() => onFormChange(form)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
