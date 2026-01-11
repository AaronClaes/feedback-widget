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
  const getCompositeDataUrl = useAnnotationStore((state) => state.getCompositeDataUrl);

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
    const compositeDataUrl = getCompositeDataUrl();

    // Update the attachment with composite image and annotation data
    updateAttachment(editingIndex, {
      dataUrl: compositeDataUrl || attachment.dataUrl,
      originalDataUrl: originalDataUrl || attachment.dataUrl,
      annotations,
    });

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
