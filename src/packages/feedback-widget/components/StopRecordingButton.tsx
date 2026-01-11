import { Button } from "@/components/ui/button";
import { IconPlayerStop } from "@tabler/icons-react";

type StopRecordingButtonProps = {
  onStop: () => void;
};

export default function StopRecordingButton({ onStop }: StopRecordingButtonProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4">
      <Button onClick={onStop} className="gap-2 border-none shadow-lg px-4">
        <IconPlayerStop className="size-4" />
        Stop Recording
      </Button>
    </div>
  );
}
