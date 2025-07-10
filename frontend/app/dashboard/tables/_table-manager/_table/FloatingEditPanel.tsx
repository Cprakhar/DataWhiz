import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { createPortal } from "react-dom";
import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";

interface FloatingEditPanelProps {
  rect: DOMRect | null;
  value: any;
  type: string;
  onChange: (value: any) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSave: () => void;
  onCancel: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const FloatingEditPanel: React.FC<FloatingEditPanelProps> = ({
  rect,
  value,
  type,
  onChange,
  onKeyDown,
  onSave,
  onCancel,
  inputRef,
}) => {
  if (!rect) return null;
  const style: React.CSSProperties = {
    position: "fixed",
    top: rect.top + window.scrollY - 8,
    left: rect.left + window.scrollX - 8,
    zIndex: 1000,
  };
  return createPortal(
    <div
      style={style}
      className={clsx(
        "bg-white rounded-xl shadow-xl p-2 min-w-[260px] min-h-[100px] flex flex-col gap-4 max-h-[90vh] max-w-[98vw] overflow-auto"
      )}
    >
      {type === "BOOLEAN" ? (
        <div className="flex items-center min-h-12 justify-center">
          <Switch
            checked={value === "true" || value === true}
            onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
            autoFocus
            style={{ width: 56, height: 36 }}
          />
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full min-w-[220px] min-h-[80px] text-base resize-both"
          style={{ resize: 'both', maxHeight: '70vh', maxWidth: '96vw' }}
          autoFocus
        />
      )}
      <div className="flex justify-end gap-2">
        <Button size="icon" variant="ghost" onClick={onCancel} className="p-1 bg-transparent border-none">
          <X className="h-4 w-4 text-red-600" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onSave} className="p-1 bg-transparent border-none">
          <Check className="h-4 w-4 text-green-600" />
        </Button>
      </div>
    </div>,
    document.body
  );
};
