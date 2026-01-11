import { IconPaperclip, IconPhoto, IconVideo, IconX } from "@tabler/icons-react";
import { useFeedbackStore } from "../store";

export default function AttachmentsList() {
  const attachments = useFeedbackStore((state) => state.attachments);
  const removeAttachment = useFeedbackStore((state) => state.removeAttachment);
  const setPreviewIndex = useFeedbackStore((state) => state.setPreviewIndex);

  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 py-6 text-center">
        <div className="rounded-full bg-muted p-2">
          <IconPaperclip className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">No attachments</p>
          <p className="text-xs text-muted-foreground">
            Add a screenshot or screen recording
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-lg border border-border bg-muted cursor-pointer transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1"
          onClick={() => setPreviewIndex(index)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setPreviewIndex(index);
            }
          }}
        >
          {attachment.type === "screenshot" ? (
            <img
              src={attachment.dataUrl}
              alt={`Screenshot ${index + 1}`}
              className="aspect-video w-full object-cover"
            />
          ) : (
            <video src={attachment.url} className="aspect-video w-full object-cover" />
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeAttachment(index);
            }}
            className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
          >
            <IconX className="size-3" />
          </button>
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
            {attachment.type === "screenshot" ? (
              <>
                <IconPhoto className="size-3" />
                Image
              </>
            ) : (
              <>
                <IconVideo className="size-3" />
                Video
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
