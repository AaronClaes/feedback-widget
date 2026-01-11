import { useRef, useState, useEffect } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPaperclip,
  IconPhoto,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import { useFeedbackStore } from "../store";

export default function AttachmentsList() {
  const attachments = useFeedbackStore((state) => state.attachments);
  const removeAttachment = useFeedbackStore((state) => state.removeAttachment);
  const setPreviewIndex = useFeedbackStore((state) => state.setPreviewIndex);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    updateScrollButtons();
  }, [attachments]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 160;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 py-6 text-center">
        <div className="rounded-full bg-muted p-2">
          <IconPaperclip className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">No attachments</p>
          <p className="text-xs text-muted-foreground">Add a screenshot or screen recording</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 p-1 shadow-md border border-border hover:bg-muted transition-colors"
        >
          <IconChevronLeft className="size-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex gap-2 overflow-x-auto scrollbar-none scroll-smooth px-1"
      >
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="group relative shrink-0 w-36 overflow-hidden rounded-lg border border-border bg-muted cursor-pointer transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1"
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

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 p-1 shadow-md border border-border hover:bg-muted transition-colors"
        >
          <IconChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
