import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "warning" | "danger" | "info" | "primary";
    resolve: (value: boolean) => void;
  }>({
    title: "",
    message: "",
    resolve: () => {},
  });

  const confirm = (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "warning" | "danger" | "info" | "primary";
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig({ ...options, resolve });
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    config.resolve(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    config.resolve(false);
    setIsOpen(false);
  };

  const DialogComponent = (
    <ConfirmDialog
      isOpen={isOpen}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      type={config.type}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, DialogComponent };
}