import { useState } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcWarning from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import type { WcWarningType } from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";

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

  const warningTypeByConfirmType: Record<"warning" | "danger" | "info" | "primary", WcWarningType> = {
    warning: "warning",
    danger: "destructive",
    info: "info",
    primary: "info",
  };

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
    <WcWarning
      isOpen={isOpen}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      type={config.type ? warningTypeByConfirmType[config.type] : "info"}
      icon={<Icon name="icon-warning-solid" size={24} />}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, DialogComponent };
}