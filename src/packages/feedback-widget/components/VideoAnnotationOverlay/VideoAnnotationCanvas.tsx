import { Layer, Line, Text } from "react-konva";
import type Konva from "konva";
import { useVideoAnnotationStore } from "../../store";
import type { FreehandAnnotation, TextAnnotation } from "../../types/annotations";

type VideoFreehandLineProps = {
  annotation: FreehandAnnotation;
};

function VideoFreehandLine({ annotation }: VideoFreehandLineProps) {
  const selectedId = useVideoAnnotationStore((state) => state.selectedId);
  const setSelectedId = useVideoAnnotationStore((state) => state.setSelectedId);
  const activeTool = useVideoAnnotationStore((state) => state.activeTool);
  const isSelected = selectedId === annotation.id;

  const handleClick = () => {
    if (activeTool === "select") {
      setSelectedId(annotation.id);
    }
  };

  return (
    <Line
      points={annotation.points}
      stroke={annotation.color}
      strokeWidth={annotation.strokeWidth}
      lineCap="round"
      lineJoin="round"
      tension={0.5}
      globalCompositeOperation="source-over"
      onClick={handleClick}
      onTap={handleClick}
      hitStrokeWidth={Math.max(annotation.strokeWidth, 20)}
      shadowColor={isSelected ? "#007AFF" : undefined}
      shadowBlur={isSelected ? 10 : 0}
      shadowOpacity={isSelected ? 0.8 : 0}
    />
  );
}

type VideoTextBoxProps = {
  annotation: TextAnnotation;
  onStartEdit: (id: string) => void;
};

function VideoTextBox({ annotation, onStartEdit }: VideoTextBoxProps) {
  const selectedId = useVideoAnnotationStore((state) => state.selectedId);
  const setSelectedId = useVideoAnnotationStore((state) => state.setSelectedId);
  const updateAnnotation = useVideoAnnotationStore((state) => state.updateAnnotation);
  const activeTool = useVideoAnnotationStore((state) => state.activeTool);
  const pushHistory = useVideoAnnotationStore((state) => state.pushHistory);
  const setEditingTextId = useVideoAnnotationStore((state) => state.setEditingTextId);

  const isSelected = selectedId === annotation.id;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    if (activeTool === "select") {
      setSelectedId(annotation.id);
    } else if (activeTool === "text") {
      setSelectedId(annotation.id);
      setEditingTextId(annotation.id);
    }
  };

  const handleDoubleClick = () => {
    onStartEdit(annotation.id);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateAnnotation(annotation.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
    pushHistory();
  };

  return (
    <Text
      x={annotation.x}
      y={annotation.y}
      text={annotation.text}
      fontSize={annotation.fontSize}
      fontFamily="Arial, sans-serif"
      fill={annotation.color}
      draggable={isSelected}
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
      onDragEnd={handleDragEnd}
      padding={4}
    />
  );
}

type VideoAnnotationCanvasProps = {
  currentDrawingPoints: number[];
  onStartTextEdit: (id: string) => void;
};

export default function VideoAnnotationCanvas({
  currentDrawingPoints,
  onStartTextEdit,
}: VideoAnnotationCanvasProps) {
  const { annotations, activeColor, strokeWidth } = useVideoAnnotationStore();

  return (
    <Layer>
      {annotations.map((annotation) => {
        switch (annotation.type) {
          case "freehand":
            return <VideoFreehandLine key={annotation.id} annotation={annotation} />;
          case "text":
            return (
              <VideoTextBox
                key={annotation.id}
                annotation={annotation}
                onStartEdit={onStartTextEdit}
              />
            );
          default:
            return null;
        }
      })}

      {currentDrawingPoints.length >= 4 && (
        <Line
          points={currentDrawingPoints}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          lineCap="round"
          lineJoin="round"
          tension={0.5}
          globalCompositeOperation="source-over"
        />
      )}
    </Layer>
  );
}
