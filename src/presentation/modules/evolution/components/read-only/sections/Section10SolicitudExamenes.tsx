import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";

export function Section10SolicitudExamenes() {
  return (
    <EvolutionPdfSection
      number={10}
      title="Solicitud de Exámenes"
      subtitle="Reservado para futura implementación"
      noBody
    >
      Esta sección queda reservada para registrar la solicitud de exámenes
      complementarios (laboratorio, imagenología). La funcionalidad se habilitará en
      una próxima iteración.
    </EvolutionPdfSection>
  );
}
