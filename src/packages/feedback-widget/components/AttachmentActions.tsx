import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconCamera, IconPlus, IconVideo } from "@tabler/icons-react";
import { useScreenCapture } from "../hooks/useScreenCapture";

export default function AttachmentActions() {
  const { captureScreenshot, startRecording } = useScreenCapture();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" size="sm" className="w-full">
            <IconPlus className="size-4" />
            Add attachment
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem onClick={captureScreenshot}>
          <IconCamera className="size-4" />
          Take screenshot
        </DropdownMenuItem>
        <DropdownMenuItem onClick={startRecording}>
          <IconVideo className="size-4" />
          Record screen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
