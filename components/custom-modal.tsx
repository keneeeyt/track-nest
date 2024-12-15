import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./custom/button";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  color?: string;
  onConfirm: () => void;
  loading?: boolean;
};

const CustomModal = (props: ModalProps) => {
  const { open, onClose, title, description, onConfirm, color, loading } = props;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className={cn(color ? `bg-${color}-500 border-none hover:bg-${color}-900 ring-0` : '')} onClick={onConfirm} loading={loading}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;