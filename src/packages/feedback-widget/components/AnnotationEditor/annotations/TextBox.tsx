import { useRef } from "react";
import { Text } from "react-konva";
import type Konva from "konva";
import type { TextAnnotation } from "../../../types/annotations";
import { useAnnotationStore } from "../../../store";

type TextBoxProps = {
  annotation: TextAnnotation;
  onStartEdit: (id: string, node: Konva.Text) => void;
};

export default function TextBox({ annotation, onStartEdit }: TextBoxProps) {
  const textRef = useRef<Konva.Text>(null);

  const selectedId = useAnnotationStore((state) => state.selectedId);
  const setSelectedId = useAnnotationStore((state) => state.setSelectedId);
  const updateAnnotation = useAnnotationStore((state) => state.updateAnnotation);
  const activeTool = useAnnotationStore((state) => state.activeTool);
  const pushHistory = useAnnotationStore((state) => state.pushHistory);
  const setEditingTextId = useAnnotationStore((state) => state.setEditingTextId);

  const isSelected = selectedId === annotation.id;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    if (activeTool === "select") {
      setSelectedId(annotation.id);
    } else if (activeTool === "text") {
      // Clicking on existing text with text tool should edit it
      setSelectedId(annotation.id);
      setEditingTextId(annotation.id);
    }
  };

  const handleDoubleClick = () => {
    if (textRef.current) {
      onStartEdit(annotation.id, textRef.current);
    }
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
      ref={textRef}
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
