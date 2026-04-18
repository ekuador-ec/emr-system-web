import { useRef, useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../utils/imageUtils";
import WcButton from "../../components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "../../components/Sidebar/icons/Icon";
import { useToastStore } from "../../components/Toaster";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropSave: (croppedFile: File, previewUrl: string) => void;
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropSave,
}: ImageCropperModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog && dialog.open) {
      dialog.close();
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, 512);
      const previewUrl = URL.createObjectURL(croppedFile);
      onCropSave(croppedFile, previewUrl);
    } catch (e) {
      console.error(e);
      addToast({
        type: "error",
        message: "No se pudo procesar la imagen seleccionada.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="cropper-modal"
      style={{
        padding: "0",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)",
        maxWidth: "500px",
        width: "90vw",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        margin: "10vh auto",
        overflow: "hidden"
      }}
    >
      <div style={{ padding: "var(--space-6)" }}>
        <h3 style={{ marginTop: 0, marginBottom: "var(--space-4)", fontSize: "1.25rem", fontWeight: "bold" }}>Ajustar Avatar</h3>
        
        <div style={{ position: "relative", width: "100%", height: "300px", backgroundColor: "#333", borderRadius: "12px", overflow: "hidden" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div style={{ marginTop: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Icon name="icon-search-minus" size={20} />
          <input
            type="range"
             value={zoom}
             min={1}
             max={3}
             step={0.1}
             disabled={isProcessing}
             aria-labelledby="Zoom"
             onChange={(e) => {
               setZoom(Number(e.target.value))
             }}
             style={{
               flex: 1,
               accentColor: "var(--color-primary)"
             }}
          />
          <Icon name="icon-search-plus" size={20} />
        </div>

        <div style={{ marginTop: "var(--space-6)", display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
          <WcButton
            variant="secondary"
            disabled={isProcessing}
            onClick={onClose}
          >
            Cancelar
          </WcButton>
          <WcButton
            variant="primary"
            disabled={isProcessing}
            onClick={handleConfirm}
          >
            {isProcessing ? "Procesando..." : "Confirmar Recorte"}
          </WcButton>
        </div>
      </div>
      <style>
        {`
          .cropper-modal::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }
          .reactEasyCrop_Container {
            background-color: var(--color-background) !important;
          }
        `}
      </style>
    </dialog>
  );
}
