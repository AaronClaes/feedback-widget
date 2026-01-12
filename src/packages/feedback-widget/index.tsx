import FeedbackButton from "./components/FeedbackButton";
import FeedbackDialog from "./components/FeedbackDialog";
import StopRecordingButton from "./components/StopRecordingButton";
import AnnotationEditorDialog from "./components/AnnotationEditorDialog";
import VideoAnnotationOverlay from "./components/VideoAnnotationOverlay";
import { useFeedbackStore, useVideoAnnotationStore } from "./store";
import { useScreenCapture } from "./hooks/useScreenCapture";
import { useCallback } from "react";

export type { FeedbackType, CaptureData } from "./store";

export default function FeedbackWidget() {
  const { isRecording, setIsOpen } = useFeedbackStore();
  const { stopRecording } = useScreenCapture();
  const resetVideoAnnotations = useVideoAnnotationStore((state) => state.reset);

  const handleStopRecording = useCallback(() => {
    resetVideoAnnotations();
    stopRecording();
  }, [resetVideoAnnotations, stopRecording]);

  return (
    <>
      {!isRecording && (
        <FeedbackDialog>
          <FeedbackButton position="bottom-right" onClick={() => setIsOpen(true)} />
        </FeedbackDialog>
      )}

      {isRecording && (
        <>
          <VideoAnnotationOverlay />
          <StopRecordingButton onStop={handleStopRecording} />
        </>
      )}

      <AnnotationEditorDialog />
    </>
  );
}
