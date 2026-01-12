import { useEffect } from "react";
import { useVideoAnnotationStore } from "../store";

export function useVideoKeyboardShortcuts(enabled: boolean = true) {
  const isAnnotationMode = useVideoAnnotationStore((state) => state.isAnnotationMode);
  const selectedId = useVideoAnnotationStore((state) => state.selectedId);
  const removeAnnotation = useVideoAnnotationStore((state) => state.removeAnnotation);
  const undo = useVideoAnnotationStore((state) => state.undo);
  const redo = useVideoAnnotationStore((state) => state.redo);
  const canUndo = useVideoAnnotationStore((state) => state.canUndo);
  const canRedo = useVideoAnnotationStore((state) => state.canRedo);
  const setActiveTool = useVideoAnnotationStore((state) => state.setActiveTool);
  const setAnnotationMode = useVideoAnnotationStore((state) => state.setAnnotationMode);

  useEffect(() => {
    if (!enabled || !isAnnotationMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      // Escape: exit annotation mode
      if (e.key === "Escape") {
        e.preventDefault();
        setAnnotationMode(false);
        return;
      }

      // Delete selected annotation
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeAnnotation(selectedId);
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
        return;
      }

      // Tool shortcuts
      if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        setActiveTool("select");
        return;
      }

      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        setActiveTool("freehand");
        return;
      }

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setActiveTool("text");
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    isAnnotationMode,
    selectedId,
    removeAnnotation,
    undo,
    redo,
    canUndo,
    canRedo,
    setActiveTool,
    setAnnotationMode,
  ]);
}
