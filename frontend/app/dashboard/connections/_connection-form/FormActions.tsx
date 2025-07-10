import { Button } from "@/components/ui/button";

interface Props {
  onCancel: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
}

export const FormActions = ({ onCancel, isSubmitting, canSubmit }: Props) => {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={!canSubmit || isSubmitting} className="flex items-center gap-2">
        {isSubmitting ? "Adding..." : "Add Connection"}
      </Button>
    </div>
  );
}
