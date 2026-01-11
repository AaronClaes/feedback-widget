import FeedbackButton from "./components/FeedbackButton";
import FeedbackDialog from "./components/FeedbackDialog";
import StopRecordingButton from "./components/StopRecordingButton";
import { useFeedbackStore } from "./store";
import { useScreenCapture } from "./hooks/useScreenCapture";

export type { FeedbackType, CaptureData } from "./store";

export default function FeedbackWidget() {
  const { isRecording, setIsOpen } = useFeedbackStore();
  const { stopRecording } = useScreenCapture();

  return (
    <>
      {!isRecording && (
        <FeedbackDialog>
          <FeedbackButton position="bottom-right" onClick={() => setIsOpen(true)} />
        </FeedbackDialog>
      )}

      {isRecording && <StopRecordingButton onStop={stopRecording} />}
    </>
  );
}
