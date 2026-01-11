import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useFeedbackStore } from "../../store";
import FeedbackTypeSelector from "../FeedbackTypeSelector";
import AttachmentsList from "../AttachmentsList";
import AttachmentActions from "../AttachmentActions";
import AttachmentPreviewDialog from "../AttachmentPreviewDialog";

type FeedbackDialogProps = {
  children: React.ReactNode;
};

export default function FeedbackDialog({ children }: FeedbackDialogProps) {
  const isOpen = useFeedbackStore((state) => state.isOpen);
  const setIsOpen = useFeedbackStore((state) => state.setIsOpen);
  const note = useFeedbackStore((state) => state.note);
  const setNote = useFeedbackStore((state) => state.setNote);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {children}
        <DialogContent className="sm:max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>Help us improve by sharing your feedback.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 min-w-0">
            <FeedbackTypeSelector />

            <div className="space-y-2 min-w-0">
              <Label>Attachments</Label>
              <div className="flex flex-col gap-2 min-w-0">
                <AttachmentsList />
                <AttachmentActions />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Describe your feedback..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AttachmentPreviewDialog />
    </>
  );
}
