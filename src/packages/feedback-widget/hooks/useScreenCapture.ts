import { useCallback } from "react";
import { useFeedbackStore } from "../store";

export function useScreenCapture() {
  const setIsOpen = useFeedbackStore((state) => state.setIsOpen);
  const setIsRecording = useFeedbackStore((state) => state.setIsRecording);
  const addAttachment = useFeedbackStore((state) => state.addAttachment);
  const setMediaRecorder = useFeedbackStore((state) => state.setMediaRecorder);
  const setStream = useFeedbackStore((state) => state.setStream);
  const addChunk = useFeedbackStore((state) => state.addChunk);
  const clearChunks = useFeedbackStore((state) => state.clearChunks);
  const stopStream = useFeedbackStore((state) => state.stopStream);

  const captureScreenshot = useCallback(async () => {
    setIsOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        preferCurrentTab: true,
      } as DisplayMediaStreamOptions);

      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");

      stream.getTracks().forEach((track) => track.stop());

      addAttachment({ type: "screenshot", dataUrl });
      setIsOpen(true);
    } catch (error) {
      console.error("Screenshot capture failed:", error);
      setIsOpen(true);
    }
  }, [setIsOpen, addAttachment]);

  const startRecording = useCallback(async () => {
    setIsOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        preferCurrentTab: true,
      } as DisplayMediaStreamOptions);

      setStream(displayStream);
      clearChunks();

      const recorder = new MediaRecorder(displayStream, {
        mimeType: "video/webm",
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          addChunk(event.data);
        }
      };

      recorder.onstop = () => {
        const { chunks } = useFeedbackStore.getState();
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        addAttachment({ type: "recording", blob, url });
        setIsRecording(false);
        setIsOpen(true);
        stopStream();
      };

      displayStream.getVideoTracks()[0].onended = () => {
        const { mediaRecorder } = useFeedbackStore.getState();
        if (mediaRecorder?.state === "recording") {
          mediaRecorder.stop();
        }
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Screen recording failed:", error);
      setIsOpen(true);
    }
  }, [
    setIsOpen,
    setIsRecording,
    addAttachment,
    setMediaRecorder,
    setStream,
    addChunk,
    clearChunks,
    stopStream,
  ]);

  const stopRecording = useCallback(() => {
    const { mediaRecorder } = useFeedbackStore.getState();
    if (mediaRecorder?.state === "recording") {
      mediaRecorder.stop();
    }
  }, []);

  return {
    captureScreenshot,
    startRecording,
    stopRecording,
  };
}
