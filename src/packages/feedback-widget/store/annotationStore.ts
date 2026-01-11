import { create } from "zustand";
import type Konva from "konva";
import {
  FONT_SIZES,
  type Annotation,
  type AnnotationTool,
  type AnnotationColor,
  type AnnotationEditorState,
  type FontSize,
} from "../types/annotations";

type AnnotationActions = {
  // Editor lifecycle
  initEditor: (imageDataUrl: string, existingAnnotations?: Annotation[]) => void;
  resetEditor: () => void;
  setKonvaStage: (ref: Konva.Stage | null) => void;

  // Annotations CRUD
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;

  // Selection
  setSelectedId: (id: string | null) => void;
  clearSelection: () => void;

  // Text editing
  setEditingTextId: (id: string | null) => void;

  // Tools & Settings
  setActiveTool: (tool: AnnotationTool) => void;
  setActiveColor: (color: AnnotationColor) => void;
  setStrokeWidth: (width: number) => void;
  setFontSize: (size: FontSize) => void;

  // History (undo/redo)
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Get current annotations (for saving)
  getAnnotations: () => Annotation[];
  getOriginalImageDataUrl: () => string | null;
  getCompositeDataUrl: () => string | null;
};

const initialState: AnnotationEditorState = {
  imageDataUrl: null,
  originalImageDataUrl: null,
  annotations: [],
  selectedId: null,
  editingTextId: null,
  activeTool: "freehand",
  activeColor: "#FF3B30",
  strokeWidth: 3,
  fontSize: "regular",
  history: [],
  historyIndex: -1,
  konvaStage: null,
};

export const useAnnotationStore = create<AnnotationEditorState & AnnotationActions>((set, get) => ({
  ...initialState,

  initEditor: (imageDataUrl, existingAnnotations = []) => {
    set({
      imageDataUrl,
      originalImageDataUrl: imageDataUrl,
      annotations: existingAnnotations,
      selectedId: null,
      history: [existingAnnotations],
      historyIndex: 0,
    });
  },

  resetEditor: () => {
    set(initialState);
  },

  setKonvaStage: (ref) => {
    set({ konvaStage: ref });
  },

  addAnnotation: (annotation) => {
    set((state) => ({
      annotations: [...state.annotations, annotation],
    }));
    get().pushHistory();
  },

  updateAnnotation: (id, updates) => {
    set((state) => ({
      annotations: state.annotations.map((ann) =>
        ann.id === id ? ({ ...ann, ...updates } as Annotation) : ann
      ),
    }));
  },

  removeAnnotation: (id) => {
    set((state) => ({
      annotations: state.annotations.filter((ann) => ann.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
    get().pushHistory();
  },

  setSelectedId: (id) => set({ selectedId: id }),
  clearSelection: () => set({ selectedId: null }),

  setEditingTextId: (id) => set({ editingTextId: id }),

  setActiveTool: (tool) => {
    set({ activeTool: tool });
    // Clear selection when switching to drawing tools
    if (tool !== "select") {
      set({ selectedId: null });
    }
  },

  setActiveColor: (color) => {
    const { selectedId, annotations } = get();
    set({ activeColor: color });
    // Update selected annotation color
    if (selectedId) {
      const annotation = annotations.find((a) => a.id === selectedId);
      if (annotation) {
        get().updateAnnotation(selectedId, { color });
        get().pushHistory();
      }
    }
  },

  setStrokeWidth: (width) => {
    const { selectedId, annotations } = get();
    set({ strokeWidth: width });
    // Update selected freehand annotation's strokeWidth
    if (selectedId) {
      const annotation = annotations.find((a) => a.id === selectedId);
      if (annotation && annotation.type === "freehand") {
        get().updateAnnotation(selectedId, { strokeWidth: width });
        get().pushHistory();
      }
    }
  },
  setFontSize: (size) => {
    const { selectedId, annotations } = get();
    set({ fontSize: size });
    // Update selected text annotation's fontSize
    if (selectedId) {
      const annotation = annotations.find((a) => a.id === selectedId);
      if (annotation && annotation.type === "text") {
        get().updateAnnotation(selectedId, { fontSize: FONT_SIZES[size] });
        get().pushHistory();
      }
    }
  },

  pushHistory: () => {
    set((state) => {
      // Remove future states if we're not at the end
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      // Add current state
      newHistory.push([...state.annotations]);
      // Limit history size to prevent memory issues
      const maxHistory = 50;
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        annotations: [...history[newIndex]],
        historyIndex: newIndex,
        selectedId: null,
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        annotations: [...history[newIndex]],
        historyIndex: newIndex,
        selectedId: null,
      });
    }
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { historyIndex, history } = get();
    return historyIndex < history.length - 1;
  },

  getAnnotations: () => get().annotations,
  getOriginalImageDataUrl: () => get().originalImageDataUrl,
  getCompositeDataUrl: () => {
    const { konvaStage, originalImageDataUrl } = get();
    if (!konvaStage || !originalImageDataUrl) return null;

    // Use Konva's toDataURL which properly composites all layers
    // Use pixelRatio to match the original image resolution
    const img = new Image();
    img.src = originalImageDataUrl;
    const pixelRatio = img.width / konvaStage.width();

    return konvaStage.toDataURL({ pixelRatio });
  },
}));

// Helper to generate unique IDs
export const generateAnnotationId = (): string => {
  return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
