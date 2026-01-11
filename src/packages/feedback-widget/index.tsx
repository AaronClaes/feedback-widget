import FeedbackButton from "./components/FeedbackButton";
import FeedbackDialog from "./components/FeedbackDialog";

export default function FeedbackWidget() {
  return (
    <FeedbackDialog>
      <FeedbackButton position="bottom-right" />
    </FeedbackDialog>
  );
}
