import { LucideIcon } from "lucide-react";

export function RowHeader({ title, Icon }: { title: string; Icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between px-1 mb-3">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      <Icon className="h-4 w-4 text-muted-foreground/80" />
    </div>
  );
}
