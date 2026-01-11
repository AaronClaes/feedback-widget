import { IconBug, IconBulb } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import type { FeedbackType } from "../store";
import { useFeedbackStore } from "../store";

export default function FeedbackTypeSelector() {
  const feedbackType = useFeedbackStore((state) => state.feedbackType);
  const setFeedbackType = useFeedbackStore((state) => state.setFeedbackType);

  return (
    <div className="space-y-2">
      <Label>Type</Label>
      <div className="grid grid-cols-2 gap-2">
        <TypeButton
          type="bug"
          icon={<IconBug className="size-4 text-muted-foreground" />}
          label="Bug"
          isSelected={feedbackType === "bug"}
          onClick={() => setFeedbackType("bug")}
        />
        <TypeButton
          type="improvement"
          icon={<IconBulb className="size-4 text-muted-foreground" />}
          label="Improvement"
          isSelected={feedbackType === "improvement"}
          onClick={() => setFeedbackType("improvement")}
        />
      </div>
    </div>
  );
}

type TypeButtonProps = {
  type: FeedbackType;
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
};

function TypeButton({ icon, label, isSelected, onClick }: TypeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
