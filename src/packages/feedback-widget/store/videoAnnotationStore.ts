import { create } from "zustand";
import type Konva from "konva";
import {
  FONT_SIZES,
  type Annotation,
  type AnnotationTool,
  type AnnotationColor,
  type FontSize,
} from "../types/annotations";

type VideoAnnotationState = {
  isAnnotationMode: boolean;
  annotations: Annotation[];
  selectedId: string | null;
  editingTextId: string | null;
  activeTool: AnnotationTool;
  activeColor: AnnotationColor;
  strokeWidth: number;
  fontSize: FontSize;
  history: Annotation[][];
  historyIndex: number;
  konvaStage: Konva.Stage | null;
};

type VideoAnnotationActions = {
  // Annotation mode toggle
  setAnnotationMode: (enabled: boolean) => void;
  toggleAnnotationMode: () => void;

  // Konva stage ref
  setKonvaStage: (ref: Konva.Stage | null) => void;

  // Annotations CRUD
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
  clearAllAnnotations: () => void;

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

  // Reset when recording ends
  reset: () => void;
};

const initialState: VideoAnnotationState = {
  isAnnotationMode: false,
  annotations: [],
  selectedId: null,
  editingTextId: null,
  activeTool: "freehand",
  activeColor: "#FF3B30",
  strokeWidth: 3,
  fontSize: "regular",
  history: [[]],
  historyIndex: 0,
  konvaStage: null,
};

export const useVideoAnnotationStore = create<VideoAnnotationState & VideoAnnotationActions>(
  (set, get) => ({
    ...initialState,

    setAnnotationMode: (enabled) => set({ isAnnotationMode: enabled }),
    toggleAnnotationMode: () => set((state) => ({ isAnnotationMode: !state.isAnnotationMode })),

    setKonvaStage: (ref) => set({ konvaStage: ref }),

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

    clearAllAnnotations: () => {
      set({ annotations: [], selectedId: null });
      get().pushHistory();
    },

    setSelectedId: (id) => set({ selectedId: id }),
    clearSelection: () => set({ selectedId: null }),

    setEditingTextId: (id) => set({ editingTextId: id }),

    setActiveTool: (tool) => {
      set({ activeTool: tool });
      if (tool !== "select") {
        set({ selectedId: null });
      }
    },

    setActiveColor: (color) => {
      const { selectedId, annotations } = get();
      set({ activeColor: color });
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
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...state.annotations]);
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

    canUndo: () => get().historyIndex > 0,
    canRedo: () => {
      const { historyIndex, history } = get();
      return historyIndex < history.length - 1;
    },

    reset: () => set(initialState),
  })
);

// Helper to generate unique IDs (reusing the pattern)
export const generateVideoAnnotationId = (): string => {
  return `vann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
