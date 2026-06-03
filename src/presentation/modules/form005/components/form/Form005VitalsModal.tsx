import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { TabSignosVitales } from "@/presentation/modules/evolution/components/form/TabSignosVitales";

interface Form005VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  required?: boolean;
}

export function Form005VitalsModal({ isOpen, onClose, required }: Form005VitalsModalProps) {
  const footer = (
    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
      <WcButton variant="primary" onClick={onClose}>
        Listo
      </WcButton>
    </div>
  );

  return (
    <WcModal
      isOpen={isOpen}
      onClose={onClose}
      title="Signos vitales"
      subtitle={required ? "Obligatorios en la primera atención" : "Opcionales en esta atención"}
      maxWidth="760px"
      footer={footer}
    >
      <div style={{ padding: "var(--space-5)" }}>
        <TabSignosVitales />
      </div>
    </WcModal>
  );
}
