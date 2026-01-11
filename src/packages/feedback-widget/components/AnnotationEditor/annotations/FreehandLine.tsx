import { Line } from "react-konva";
import type { FreehandAnnotation } from "../../../types/annotations";
import { useAnnotationStore } from "../../../store";

type FreehandLineProps = {
  annotation: FreehandAnnotation;
};

export default function FreehandLine({ annotation }: FreehandLineProps) {
  const selectedId = useAnnotationStore((state) => state.selectedId);
  const setSelectedId = useAnnotationStore((state) => state.setSelectedId);
  const activeTool = useAnnotationStore((state) => state.activeTool);
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
      // Highlight when selected
      shadowColor={isSelected ? "#007AFF" : undefined}
      shadowBlur={isSelected ? 10 : 0}
      shadowOpacity={isSelected ? 0.8 : 0}
    />
  );
}
