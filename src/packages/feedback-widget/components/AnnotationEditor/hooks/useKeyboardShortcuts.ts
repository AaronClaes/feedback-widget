import { useEffect } from "react";
import { useAnnotationStore } from "../../../store";

export function useKeyboardShortcuts(enabled: boolean = true) {
  const selectedId = useAnnotationStore((state) => state.selectedId);
  const removeAnnotation = useAnnotationStore((state) => state.removeAnnotation);
  const undo = useAnnotationStore((state) => state.undo);
  const redo = useAnnotationStore((state) => state.redo);
  const canUndo = useAnnotationStore((state) => state.canUndo);
  const canRedo = useAnnotationStore((state) => state.canRedo);
  const setActiveTool = useAnnotationStore((state) => state.setActiveTool);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Allow Escape to blur from text editing
        if (e.key === "Escape") {
          target.blur();
        }
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

      // Escape: deselect or switch to select tool
      if (e.key === "Escape") {
        e.preventDefault();
        setActiveTool("select");
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
  }, [enabled, selectedId, removeAnnotation, undo, redo, canUndo, canRedo, setActiveTool]);
}
