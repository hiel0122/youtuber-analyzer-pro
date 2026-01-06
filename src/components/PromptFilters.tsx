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
  'Perplexity', 'Suno', 'Midjourney', 'DALL-E', 'Runway', 'Sora', 'Nanobanana'
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
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-card text-card-foreground border border-border hover:border-primary/50 hover:bg-accent"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm space-y-6 border border-border">
      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Category</h3>
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

      {/* Model Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Model</h3>
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

      {/* Form Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Form</h3>
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
