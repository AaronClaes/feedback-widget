import { useState, useCallback } from "react";
import type Konva from "konva";
import { useVideoAnnotationStore, generateVideoAnnotationId } from "../store";
import type { FreehandAnnotation, TextAnnotation } from "../types/annotations";
import { FONT_SIZES } from "../types/annotations";

type DrawingState = {
  isDrawing: boolean;
  currentPoints: number[];
};

export function useVideoDrawing(konvaStage: Konva.Stage | null) {
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
  } = useVideoAnnotationStore();

  const getPointerPosition = useCallback(() => {
    if (!konvaStage) return null;
    const pos = konvaStage.getPointerPosition();
    if (!pos) return null;

    // For full-screen overlay, we don't need to account for scale
    // since the stage matches the viewport size
    return {
      x: pos.x,
      y: pos.y,
    };
  }, [konvaStage]);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      // Don't handle stage events while editing text
      if (editingTextId) return;

      // If clicking on empty area with select tool, clear selection
      if (activeTool === "select") {
        const target = e.target;
        const isStage = target === target.getStage();
        if (isStage) {
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
          id: generateVideoAnnotationId(),
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
        setEditingTextId(textAnnotation.id);
      }
    },
    [
      activeTool,
      activeColor,
      fontSize,
      addAnnotation,
      setSelectedId,
      clearSelection,
      setEditingTextId,
      editingTextId,
      getPointerPosition,
    ]
  );

  const handleMouseMove = useCallback(() => {
    if (!drawingState.isDrawing || activeTool !== "freehand") return;

    const pos = getPointerPosition();
    if (!pos) return;

    setDrawingState((prev) => ({
      ...prev,
      currentPoints: [...prev.currentPoints, pos.x, pos.y],
    }));
  }, [drawingState.isDrawing, activeTool, getPointerPosition]);

  const handleMouseUp = useCallback(() => {
    if (!drawingState.isDrawing || activeTool !== "freehand") return;

    if (drawingState.currentPoints.length >= 4) {
      const freehandAnnotation: FreehandAnnotation = {
        id: generateVideoAnnotationId(),
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
