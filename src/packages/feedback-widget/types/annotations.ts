export type AnnotationTool = "select" | "freehand" | "text";

export type FontSize = "small" | "regular" | "large";

export const FONT_SIZES: Record<FontSize, number> = {
  small: 18,
  regular: 28,
  large: 42,
} as const;

export const ANNOTATION_COLORS = [
  "#FF3B30", // Red
  "#FF9500", // Orange
  "#FFCC00", // Yellow
  "#34C759", // Green
  "#007AFF", // Blue
  "#5856D6", // Purple
  "#FFFFFF", // White
  "#000000", // Black
] as const;

export type AnnotationColor = (typeof ANNOTATION_COLORS)[number];

export type BaseAnnotation = {
  id: string;
  color: AnnotationColor;
};

export type FreehandAnnotation = BaseAnnotation & {
  type: "freehand";
  points: number[]; // Flat array: [x1, y1, x2, y2, ...]
  strokeWidth: number;
};

export type TextAnnotation = BaseAnnotation & {
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
};

// Future extensibility - add more annotation types here
// export type ArrowAnnotation = BaseAnnotation & { ... };
// export type CircleAnnotation = BaseAnnotation & { ... };
// export type RectangleAnnotation = BaseAnnotation & { ... };

export type Annotation = FreehandAnnotation | TextAnnotation;

export type AnnotationEditorState = {
  imageDataUrl: string | null;
  originalImageDataUrl: string | null;
  annotations: Annotation[];
  selectedId: string | null;
  editingTextId: string | null;
  activeTool: AnnotationTool;
  activeColor: AnnotationColor;
  strokeWidth: number;
  fontSize: FontSize;
  // History for undo/redo
  history: Annotation[][];
  historyIndex: number;
};
