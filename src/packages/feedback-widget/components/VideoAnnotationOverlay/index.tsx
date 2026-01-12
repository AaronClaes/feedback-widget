import { useRef, useState, useCallback, useEffect } from "react";
import { Stage } from "react-konva";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVideoAnnotationStore } from "../../store";
import { useVideoDrawing } from "../../hooks/useVideoDrawing";
import { useVideoKeyboardShortcuts } from "../../hooks/useVideoKeyboardShortcuts";
import VideoAnnotationCanvas from "./VideoAnnotationCanvas";
import VideoAnnotationToolbar from "./VideoAnnotationToolbar";
import type Konva from "konva";

export default function VideoAnnotationOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Text editing
  const inputRef = useRef<HTMLInputElement>(null);
  const [textInputValue, setTextInputValue] = useState("");

  const {
    isAnnotationMode,
    annotations,
    editingTextId,
    setEditingTextId,
    updateAnnotation,
    removeAnnotation,
    pushHistory,
    konvaStage,
  } = useVideoAnnotationStore();

  const stageRefCallback = useCallback(
    (stage: Konva.Stage | null) => {
      if (stage !== konvaStage) {
        useVideoAnnotationStore.getState().setKonvaStage(stage);
      }
    },
    [konvaStage]
  );

  const { drawingState, handleMouseDown, handleMouseMove, handleMouseUp } =
    useVideoDrawing(konvaStage);

  // Enable keyboard shortcuts when in annotation mode
  useVideoKeyboardShortcuts(isAnnotationMode);

  // Calculate dimensions to fill viewport
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Get the annotation being edited
  const editingAnnotation = editingTextId
    ? annotations.find((a) => a.id === editingTextId && a.type === "text")
    : null;

  // Initialize input value when editing starts
  useEffect(() => {
    if (editingTextId && editingAnnotation && editingAnnotation.type === "text") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTextInputValue(editingAnnotation.text);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [editingTextId, editingAnnotation]);

  const handleStartTextEdit = useCallback(
    (id: string) => {
      setEditingTextId(id);
    },
    [setEditingTextId]
  );

  const handleTextConfirm = useCallback(() => {
    if (!editingTextId) return;

    const trimmedText = textInputValue.trim();
    if (trimmedText) {
      updateAnnotation(editingTextId, { text: trimmedText });
      pushHistory();
    } else {
      removeAnnotation(editingTextId);
    }

    setEditingTextId(null);
    setTextInputValue("");
  }, [
    editingTextId,
    textInputValue,
    updateAnnotation,
    pushHistory,
    removeAnnotation,
    setEditingTextId,
  ]);

  const handleTextCancel = useCallback(() => {
    if (!editingTextId) return;

    if (editingAnnotation && editingAnnotation.type === "text" && !editingAnnotation.text.trim()) {
      removeAnnotation(editingTextId);
    }

    setEditingTextId(null);
    setTextInputValue("");
  }, [editingTextId, editingAnnotation, removeAnnotation, setEditingTextId]);

  const handleTextInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTextConfirm();
    }
    if (e.key === "Escape") {
      handleTextCancel();
    }
  };

  // Get cursor style based on active tool
  const getCursor = () => {
    const { activeTool } = useVideoAnnotationStore.getState();
    switch (activeTool) {
      case "select":
        return "default";
      case "freehand":
        return "crosshair";
      case "text":
        return "text";
      default:
        return "default";
    }
  };

  // Don't render if not in annotation mode
  if (!isAnnotationMode) {
    return null;
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-40" style={{ pointerEvents: "auto" }}>
      {/* Transparent overlay to block interactions with underlying page */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Konva Stage for drawing */}
      <Stage
        ref={stageRefCallback}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{ cursor: getCursor() }}
      >
        <VideoAnnotationCanvas
          currentDrawingPoints={drawingState.currentPoints}
          onStartTextEdit={handleStartTextEdit}
        />
      </Stage>

      {/* Toolbar at top */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <VideoAnnotationToolbar />
      </div>

      {/* Text input bar */}
      {editingTextId && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background border rounded-lg shadow-lg p-2">
          <Input
            ref={inputRef}
            type="text"
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyDown={handleTextInputKeyDown}
            placeholder="Enter text..."
            className="w-64"
            autoFocus
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleTextCancel}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <IconX size={18} />
          </Button>
          <Button type="button" size="icon" onClick={handleTextConfirm} className="h-8 w-8">
            <IconCheck size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}
