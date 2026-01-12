import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import type Konva from "konva";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useAnnotationStore } from "../../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnnotationCanvas from "./AnnotationCanvas";
import AnnotationToolbar from "./AnnotationToolbar";
import { useDrawing } from "./hooks/useDrawing";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

type AnnotationEditorProps = {
  imageDataUrl: string;
};

export default function AnnotationEditor({ imageDataUrl }: AnnotationEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  // Text editing
  const inputRef = useRef<HTMLInputElement>(null);
  const [textInputValue, setTextInputValue] = useState("");

  const {
    updateAnnotation,
    annotations,
    pushHistory,
    editingTextId,
    setEditingTextId,
    konvaStage,
  } = useAnnotationStore();

  const stageRefCallback = useCallback(
    (stage: Konva.Stage | null) => {
      if (stage !== konvaStage) {
        useAnnotationStore.getState().setKonvaStage(stage);
      }
    },
    [konvaStage]
  );

  const { drawingState, handleMouseDown, handleMouseMove, handleMouseUp } = useDrawing(konvaStage);

  // Enable keyboard shortcuts
  useKeyboardShortcuts(true);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.src = imageDataUrl;
    img.onload = () => {
      setImage(img);
    };
  }, [imageDataUrl]);

  // Calculate dimensions to fit container
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current || !image) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const imageAspect = image.width / image.height;
      const containerAspect = containerWidth / containerHeight;

      let width: number;
      let height: number;

      if (containerAspect > imageAspect) {
        // Container is wider - fit to height
        height = containerHeight;
        width = height * imageAspect;
      } else {
        // Container is taller - fit to width
        width = containerWidth;
        height = width / imageAspect;
      }

      setDimensions({ width, height });
      setScale(width / image.width);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [image]);

  // Get the annotation being edited
  const editingAnnotation = editingTextId
    ? annotations.find((a) => a.id === editingTextId && a.type === "text")
    : null;

  // Initialize input value when editing starts
  useEffect(() => {
    if (editingTextId && editingAnnotation && editingAnnotation.type === "text") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTextInputValue(editingAnnotation.text);
      // Focus the input after a brief delay
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [editingTextId, editingAnnotation]);

  // Handle text editing (from double-click on TextBox)
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
      // Remove empty text annotations
      const { removeAnnotation } = useAnnotationStore.getState();
      removeAnnotation(editingTextId);
    }

    setEditingTextId(null);
    setTextInputValue("");
  }, [editingTextId, textInputValue, updateAnnotation, pushHistory, setEditingTextId]);

  const handleTextCancel = useCallback(() => {
    if (!editingTextId) return;

    // If the annotation has no text (newly created), remove it
    if (editingAnnotation && editingAnnotation.type === "text" && !editingAnnotation.text.trim()) {
      const { removeAnnotation } = useAnnotationStore.getState();
      removeAnnotation(editingTextId);
    }

    setEditingTextId(null);
    setTextInputValue("");
  }, [editingTextId, editingAnnotation, setEditingTextId]);

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
    const { activeTool } = useAnnotationStore.getState();
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

  if (!image) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading image...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <AnnotationToolbar />

      <div
        ref={containerRef}
        className="flex-1 relative bg-muted/50 rounded-lg overflow-hidden flex items-center justify-center"
      >
        <Stage
          ref={stageRefCallback}
          width={dimensions.width}
          height={dimensions.height}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{ cursor: getCursor() }}
        >
          {/* Background image layer */}
          <Layer>
            <KonvaImage image={image} />
          </Layer>

          {/* Annotations layer */}
          <AnnotationCanvas
            currentDrawingPoints={drawingState.currentPoints}
            onStartTextEdit={handleStartTextEdit}
          />
        </Stage>

        {/* Text input bar at bottom */}
        {editingTextId && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background border rounded-lg shadow-lg p-2">
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
    </div>
  );
}
