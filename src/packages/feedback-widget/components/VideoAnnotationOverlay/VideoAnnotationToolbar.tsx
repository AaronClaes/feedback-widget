import {
  IconPointer,
  IconPencil,
  IconTypography,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconTrash,
  IconTrashX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useVideoAnnotationStore } from "../../store";
import {
  ANNOTATION_COLORS,
  FONT_SIZES,
  type AnnotationTool,
  type FontSize,
} from "../../types/annotations";
import { cn } from "@/lib/utils";

const tools: { id: AnnotationTool; icon: typeof IconPointer; label: string; shortcut: string }[] = [
  { id: "select", icon: IconPointer, label: "Select", shortcut: "V" },
  { id: "freehand", icon: IconPencil, label: "Draw", shortcut: "D" },
  { id: "text", icon: IconTypography, label: "Text", shortcut: "T" },
];

const strokeWidths = [2, 4, 6, 8];

const fontSizeOptions: { id: FontSize; label: string }[] = [
  { id: "small", label: "S" },
  { id: "regular", label: "M" },
  { id: "large", label: "L" },
];

export default function VideoAnnotationToolbar() {
  const {
    activeTool,
    setActiveTool,
    activeColor,
    setActiveColor,
    strokeWidth,
    setStrokeWidth,
    fontSize,
    setFontSize,
    selectedId,
    annotations,
    removeAnnotation,
    clearAllAnnotations,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useVideoAnnotationStore();

  const selectedAnnotation = selectedId ? annotations.find((a) => a.id === selectedId) : null;
  const isTextSelected = selectedAnnotation?.type === "text";
  const isFreehandSelected = selectedAnnotation?.type === "freehand";
  const showFontSize = activeTool === "text" || isTextSelected;
  const showStrokeWidth = activeTool === "freehand" || isFreehandSelected;

  const handleDelete = () => {
    if (selectedId) {
      removeAnnotation(selectedId);
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-background backdrop-blur border border-border rounded-lg shadow-lg\">
      {/* Tools */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-border">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            type="button"
            variant={activeTool === tool.id ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setActiveTool(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <tool.icon className="size-4" />
          </Button>
        ))}
      </div>

      {/* Colors */}
      <div className="flex items-center gap-1 px-2 border-r border-border">
        {ANNOTATION_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setActiveColor(color)}
            className={cn(
              "size-5 rounded-full border-2 transition-transform hover:scale-110",
              activeColor === color
                ? "border-ring ring-2 ring-ring/50 ring-offset-1"
                : "border-border"
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Stroke Width */}
      {showStrokeWidth && (
        <div className="flex items-center gap-1 px-2 border-r border-border">
          {strokeWidths.map((width) => (
            <button
              key={width}
              type="button"
              onClick={() => setStrokeWidth(width)}
              className={cn(
                "size-6 flex items-center justify-center rounded transition-colors",
                strokeWidth === width ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
              )}
              title={`Stroke width: ${width}px`}
            >
              <span className="rounded-full bg-current" style={{ width: width, height: width }} />
            </button>
          ))}
        </div>
      )}

      {/* Font Size */}
      {showFontSize && (
        <div className="flex items-center gap-1 px-2 border-r border-border">
          {fontSizeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFontSize(option.id)}
              className={cn(
                "h-6 px-2 flex items-center justify-center rounded text-xs font-medium transition-colors",
                fontSize === option.id ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
              )}
              title={`Font size: ${option.label} (${FONT_SIZES[option.id]}px)`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 px-2 ">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
        >
          <IconArrowBackUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <IconArrowForwardUp className="size-4" />
        </Button>
      </div>

      {/* Delete */}
      {selectedId && (
        <div className="flex items-center gap-0.5 pl-1 border-l border-border">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete selected (Delete)"
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-0.5 pl-1 border-l border-border">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={clearAllAnnotations}
          disabled={annotations.length === 0}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Clear all annotations"
        >
          <IconTrashX className="size-4" />
        </Button>
      </div>
    </div>
  );
}
