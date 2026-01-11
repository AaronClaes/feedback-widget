import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight, IconPencil, IconTrash } from "@tabler/icons-react";
import { useFeedbackStore } from "../store";

export default function AttachmentPreviewDialog() {
  const attachments = useFeedbackStore((state) => state.attachments);
  const previewIndex = useFeedbackStore((state) => state.previewIndex);
  const setPreviewIndex = useFeedbackStore((state) => state.setPreviewIndex);
  const setEditingIndex = useFeedbackStore((state) => state.setEditingIndex);
  const removeAttachment = useFeedbackStore((state) => state.removeAttachment);

  const isOpen = previewIndex !== null;
  const attachment = previewIndex !== null ? attachments[previewIndex] : null;
  const canGoBack = previewIndex !== null && previewIndex > 0;
  const canGoForward = previewIndex !== null && previewIndex < attachments.length - 1;

  const handleClose = () => setPreviewIndex(null);

  const handlePrevious = () => {
    if (canGoBack && previewIndex !== null) {
      setPreviewIndex(previewIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward && previewIndex !== null) {
      setPreviewIndex(previewIndex + 1);
    }
  };

  const handleDelete = () => {
    if (previewIndex !== null) {
      removeAttachment(previewIndex);
      if (attachments.length <= 1) {
        setPreviewIndex(null);
      } else if (previewIndex >= attachments.length - 1) {
        setPreviewIndex(previewIndex - 1);
      }
    }
  };

  const handleEdit = () => {
    if (previewIndex !== null && attachment?.type === "screenshot") {
      setPreviewIndex(null);
      setEditingIndex(previewIndex);
    }
  };

  if (!attachment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {attachment.type === "screenshot" ? "Screenshot" : "Recording"}
            <span className="text-muted-foreground font-normal">
              ({(previewIndex ?? 0) + 1} of {attachments.length})
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-lg bg-muted">
          {attachment.type === "screenshot" ? (
            <img
              src={attachment.dataUrl}
              alt="Screenshot preview"
              className="w-full object-contain max-h-80"
            />
          ) : (
            <video
              src={attachment.url}
              controls
              className="w-full object-contain max-h-80"
            />
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handlePrevious}
              disabled={!canGoBack}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleNext}
              disabled={!canGoForward}
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            {attachment.type === "screenshot" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                <IconPencil className="size-4" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <IconTrash className="size-4" />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
