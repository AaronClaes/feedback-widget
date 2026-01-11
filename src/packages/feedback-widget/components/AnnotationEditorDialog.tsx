import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFeedbackStore, useAnnotationStore } from "../store";
import AnnotationEditor from "./AnnotationEditor";

export default function AnnotationEditorDialog() {
  const attachments = useFeedbackStore((state) => state.attachments);
  const editingIndex = useFeedbackStore((state) => state.editingIndex);
  const setEditingIndex = useFeedbackStore((state) => state.setEditingIndex);
  const updateAttachment = useFeedbackStore((state) => state.updateAttachment);

  const initEditor = useAnnotationStore((state) => state.initEditor);
  const resetEditor = useAnnotationStore((state) => state.resetEditor);
  const getAnnotations = useAnnotationStore((state) => state.getAnnotations);
  const getOriginalImageDataUrl = useAnnotationStore((state) => state.getOriginalImageDataUrl);

  const isOpen = editingIndex !== null;
  const attachment = editingIndex !== null ? attachments[editingIndex] : null;

  // Initialize editor when opening
  useEffect(() => {
    if (isOpen && attachment && attachment.type === "screenshot") {
      // Use original image if available, otherwise use current dataUrl
      const imageUrl = attachment.originalDataUrl || attachment.dataUrl;
      initEditor(imageUrl, attachment.annotations || []);
    }
  }, [isOpen, attachment, initEditor]);

  function handleClose() {
    resetEditor();
    setEditingIndex(null);
  }

  function handleSave() {
    if (editingIndex === null || !attachment || attachment.type !== "screenshot") return;

    const annotations = getAnnotations();
    const originalDataUrl = getOriginalImageDataUrl();

    // Get the stage element to export
    const stageElement = document.querySelector(".konvajs-content canvas") as HTMLCanvasElement;

    if (stageElement) {
      // Create a canvas to composite the image with annotations
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Load the original image
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the original image
          ctx.drawImage(img, 0, 0);

          // Get the stage canvas and draw annotations on top
          // We need to scale the stage canvas to match the original image size
          const stageCanvas = stageElement;
          const scaleX = img.width / stageCanvas.width;
          const scaleY = img.height / stageCanvas.height;

          ctx.save();
          ctx.scale(scaleX, scaleY);
          ctx.drawImage(stageCanvas, 0, 0);
          ctx.restore();

          const compositeDataUrl = canvas.toDataURL("image/png");

          console.log("compositeDataUrl", compositeDataUrl);

          // Update the attachment with composite image and annotation data
          updateAttachment(editingIndex, {
            dataUrl: compositeDataUrl,
            originalDataUrl: originalDataUrl || attachment.dataUrl,
            annotations,
          });
        };
        img.src = originalDataUrl || attachment.dataUrl;
      }
    } else {
      // Fallback: just save annotations without composite
      updateAttachment(editingIndex, {
        dataUrl: attachment.dataUrl,
        originalDataUrl: attachment.originalDataUrl || attachment.dataUrl,
        annotations,
      });
    }

    handleClose();
  }

  // Don't render for non-screenshot attachments
  if (!attachment || attachment.type !== "screenshot") return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Annotate Screenshot</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <AnnotationEditor imageDataUrl={attachment.originalDataUrl || attachment.dataUrl} />
        </div>

        <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Annotations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
