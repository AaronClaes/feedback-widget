import { create } from "zustand";

export type FeedbackType = "bug" | "improvement";
export type CaptureData =
  | { type: "screenshot"; dataUrl: string }
  | { type: "recording"; blob: Blob; url: string };

type FeedbackState = {
  isOpen: boolean;
  isRecording: boolean;
  feedbackType: FeedbackType;
  note: string;
  attachments: CaptureData[];
  previewIndex: number | null;
  // Recording refs (non-reactive)
  mediaRecorder: MediaRecorder | null;
  stream: MediaStream | null;
  chunks: Blob[];
};

type FeedbackActions = {
  setIsOpen: (open: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  setFeedbackType: (type: FeedbackType) => void;
  setNote: (note: string) => void;
  addAttachment: (attachment: CaptureData) => void;
  removeAttachment: (index: number) => void;
  setPreviewIndex: (index: number | null) => void;
  setMediaRecorder: (recorder: MediaRecorder | null) => void;
  setStream: (stream: MediaStream | null) => void;
  addChunk: (chunk: Blob) => void;
  clearChunks: () => void;
  stopStream: () => void;
  reset: () => void;
};

const initialState: FeedbackState = {
  isOpen: false,
  isRecording: false,
  feedbackType: "bug",
  note: "",
  attachments: [],
  previewIndex: null,
  mediaRecorder: null,
  stream: null,
  chunks: [],
};

export const useFeedbackStore = create<FeedbackState & FeedbackActions>(
  (set, get) => ({
    ...initialState,

    setIsOpen: (open) => set({ isOpen: open }),
    setIsRecording: (recording) => set({ isRecording: recording }),
    setFeedbackType: (type) => set({ feedbackType: type }),
    setNote: (note) => set({ note }),

    addAttachment: (attachment) =>
      set((state) => ({ attachments: [...state.attachments, attachment] })),

    removeAttachment: (index) => {
      const { attachments } = get();
      const attachment = attachments[index];
      if (attachment.type === "recording") {
        URL.revokeObjectURL(attachment.url);
      }
      set({ attachments: attachments.filter((_, i) => i !== index) });
    },

    setPreviewIndex: (index) => set({ previewIndex: index }),

    setMediaRecorder: (recorder) => set({ mediaRecorder: recorder }),
    setStream: (stream) => set({ stream }),
    addChunk: (chunk) => set((state) => ({ chunks: [...state.chunks, chunk] })),
    clearChunks: () => set({ chunks: [] }),

    stopStream: () => {
      const { stream } = get();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        set({ stream: null });
      }
    },

    reset: () => {
      const { attachments } = get();
      attachments.forEach((attachment) => {
        if (attachment.type === "recording") {
          URL.revokeObjectURL(attachment.url);
        }
      });
      set({ feedbackType: "bug", note: "", attachments: [], previewIndex: null });
    },
  })
);
