import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FeedbackDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog disablePointerDismissal>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
          <DialogDescription>Please share your feedback with us.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
