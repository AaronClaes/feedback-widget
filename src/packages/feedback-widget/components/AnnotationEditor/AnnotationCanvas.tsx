import { Layer, Line } from "react-konva";
import type Konva from "konva";
import { useAnnotationStore } from "../../store";
import FreehandLine from "./annotations/FreehandLine";
import TextBox from "./annotations/TextBox";

type AnnotationCanvasProps = {
  currentDrawingPoints: number[];
  onStartTextEdit: (id: string, node: Konva.Text) => void;
};

export default function AnnotationCanvas({
  currentDrawingPoints,
  onStartTextEdit,
}: AnnotationCanvasProps) {
  const { annotations, activeColor, strokeWidth } = useAnnotationStore();

  return (
    <Layer>
      {/* Render saved annotations */}
      {annotations.map((annotation) => {
        switch (annotation.type) {
          case "freehand":
            return <FreehandLine key={annotation.id} annotation={annotation} />;
          case "text":
            return (
              <TextBox
                key={annotation.id}
                annotation={annotation}
                onStartEdit={onStartTextEdit}
              />
            );
          default:
            return null;
        }
      })}

      {/* Render current drawing in progress */}
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
