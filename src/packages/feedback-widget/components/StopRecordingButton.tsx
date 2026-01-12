import { Button } from "@/components/ui/button";
import { IconPlayerStop, IconPencil, IconPencilOff } from "@tabler/icons-react";
import { useVideoAnnotationStore } from "../store";

type StopRecordingButtonProps = {
  onStop: () => void;
};

export default function StopRecordingButton({ onStop }: StopRecordingButtonProps) {
  const { isAnnotationMode, toggleAnnotationMode } = useVideoAnnotationStore();

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-1.5">
        <Button
          onClick={toggleAnnotationMode}
          variant={isAnnotationMode ? "secondary" : "ghost"}
          className="gap-2 px-3"
          title={isAnnotationMode ? "Exit annotation mode (Esc)" : "Enter annotation mode"}
        >
          {isAnnotationMode ? (
            <>
              <IconPencilOff className="size-4" />
              Exit Annotate
            </>
          ) : (
            <>
              <IconPencil className="size-4" />
              Annotate
            </>
          )}
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button onClick={onStop} variant="destructive" className="gap-2 px-3">
          <IconPlayerStop className="size-4" />
          Stop Recording
        </Button>
      </div>
    </div>
  );
}
