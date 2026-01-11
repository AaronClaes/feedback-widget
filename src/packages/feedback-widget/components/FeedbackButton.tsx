import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconSend } from "@tabler/icons-react";

type FeedbackButtonProps = {
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  onClick: () => void;
};

export default function FeedbackButton({ position, onClick }: FeedbackButtonProps) {
  return (
    <div
      className={cn(
        "fixed z-50",
        position === "top-right" && "top-4 right-4",
        position === "top-left" && "top-4 left-4",
        position === "bottom-right" && "bottom-4 right-4",
        position === "bottom-left" && "bottom-4 left-4"
      )}
    >
      <Button onClick={onClick}>
        <IconSend /> Feedback
      </Button>
    </div>
  );
}
