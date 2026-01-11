import { useState, useCallback } from "react";
import type Konva from "konva";
import { useAnnotationStore, generateAnnotationId } from "../../../store";
import type { FreehandAnnotation, TextAnnotation } from "../../../types/annotations";
import { FONT_SIZES } from "../../../types/annotations";

type DrawingState = {
  isDrawing: boolean;
  currentPoints: number[];
};

export function useDrawing(stageRef: React.RefObject<Konva.Stage | null>) {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    currentPoints: [],
  });

  const {
    activeTool,
    activeColor,
    strokeWidth,
    fontSize,
    addAnnotation,
    setSelectedId,
    clearSelection,
    setEditingTextId,
    editingTextId,
  } = useAnnotationStore();

  const getPointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;

    // Transform screen coordinates to canvas coordinates
    // accounting for the stage's scale
    const scale = stage.scaleX();
    return {
      x: pos.x / scale,
      y: pos.y / scale,
    };
  }, [stageRef]);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      // Don't handle stage events while editing text
      if (editingTextId) return;

      // If clicking on empty area with select tool, clear selection
      // Check for stage click or background image click (image in first layer)
      if (activeTool === "select") {
        const target = e.target;
        const isStage = target === target.getStage();
        const isBackgroundImage = target.getClassName() === "Image";
        if (isStage || isBackgroundImage) {
          clearSelection();
        }
        return;
      }

      const pos = getPointerPosition();
      if (!pos) return;

      if (activeTool === "freehand") {
        setDrawingState({
          isDrawing: true,
          currentPoints: [pos.x, pos.y],
        });
      } else if (activeTool === "text") {
        // Create text annotation at click position
        const textAnnotation: TextAnnotation = {
          id: generateAnnotationId(),
          type: "text",
          x: pos.x,
          y: pos.y,
          width: 200,
          height: 30,
          text: "",
          fontSize: FONT_SIZES[fontSize],
          color: activeColor,
        };
        addAnnotation(textAnnotation);
        setSelectedId(textAnnotation.id);
        // Auto-start editing the new text
        setEditingTextId(textAnnotation.id);
      }
    },
    [activeTool, activeColor, fontSize, addAnnotation, setSelectedId, clearSelection, setEditingTextId, editingTextId, getPointerPosition]
  );

  const handleMouseMove = useCallback(
    () => {
      if (!drawingState.isDrawing || activeTool !== "freehand") return;

      const pos = getPointerPosition();
      if (!pos) return;

      setDrawingState((prev) => ({
        ...prev,
        currentPoints: [...prev.currentPoints, pos.x, pos.y],
      }));
    },
    [drawingState.isDrawing, activeTool, getPointerPosition]
  );

  const handleMouseUp = useCallback(() => {
    if (!drawingState.isDrawing || activeTool !== "freehand") return;

    // Only create annotation if we have enough points
    if (drawingState.currentPoints.length >= 4) {
      const freehandAnnotation: FreehandAnnotation = {
        id: generateAnnotationId(),
        type: "freehand",
        points: drawingState.currentPoints,
        strokeWidth,
        color: activeColor,
      };
      addAnnotation(freehandAnnotation);
    }

    setDrawingState({
      isDrawing: false,
      currentPoints: [],
    });
  }, [drawingState, activeTool, strokeWidth, activeColor, addAnnotation]);

  return {
    drawingState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
