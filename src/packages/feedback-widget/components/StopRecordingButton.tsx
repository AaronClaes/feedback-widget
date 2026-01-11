import { Button } from "@/components/ui/button";
import { IconPlayerStop } from "@tabler/icons-react";

type StopRecordingButtonProps = {
  onStop: () => void;
};

export default function StopRecordingButton({ onStop }: StopRecordingButtonProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4">
      <Button
        onClick={onStop}
        variant="destructive"
        className="gap-2 text-white border-none shadow-lg"
      >
        <IconPlayerStop className="size-4" />
        Stop Recording
      </Button>
    </div>
  );
}
