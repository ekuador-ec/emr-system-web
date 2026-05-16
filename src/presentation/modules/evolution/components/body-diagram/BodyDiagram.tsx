import { useRef, type MouseEvent } from "react";
import bodyDiagramUrl from "@/assets/body-diagram.webp";
import type { InjuryMarker } from "@/domain/modules/evolution/models/Evolution";
import "./BodyDiagram.css";

export interface BodyDiagramMarkerEntry {
  marker: InjuryMarker;
  number: number;
}

export const DEFAULT_INJURY_MARKER_RADIUS = 2.4;

interface BodyDiagramEditorProps {
  markers: BodyDiagramMarkerEntry[];
  onAddMarker: (marker: InjuryMarker) => void;
  onRemoveMarker: (index: number) => void;
}

export function BodyDiagramEditor({
  markers,
  onAddMarker,
  onRemoveMarker,
}: BodyDiagramEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = ((event.clientX - rect.left) / rect.width) * 100;
    const cy = ((event.clientY - rect.top) / rect.height) * 100;
    if (cx < 0 || cx > 100 || cy < 0 || cy > 100) return;
    onAddMarker({
      shape: "CIRCLE",
      cx: Number(cx.toFixed(2)),
      cy: Number(cy.toFixed(2)),
      r: DEFAULT_INJURY_MARKER_RADIUS,
    });
  };

  return (
    <div className="body-diagram body-diagram--editable" ref={containerRef} onClick={handleClick}>
      <img
        src={bodyDiagramUrl}
        alt="Diagrama corporal para localización de lesiones"
        className="body-diagram__image"
        loading="eager"
        decoding="async"
        draggable={false}
      />
      <svg
        className="body-diagram__overlay"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {markers.map(({ marker, number }, index) => (
          <g
            key={index}
            className="body-diagram__marker"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveMarker(index);
            }}
          >
            <circle
              className="body-diagram__marker-circle"
              cx={marker.cx}
              cy={marker.cy}
              r={marker.r}
            />
            <text
              className="body-diagram__marker-text"
              x={marker.cx}
              y={marker.cy}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {number}
            </text>
            <title>Lesión {number} — Click para quitar</title>
          </g>
        ))}
      </svg>
      <div className="body-diagram__hint" aria-hidden="true">
        Click sobre el cuerpo para marcar una lesión
      </div>
    </div>
  );
}

interface BodyDiagramReadOnlyProps {
  markers: BodyDiagramMarkerEntry[];
}

export function BodyDiagramReadOnly({ markers }: BodyDiagramReadOnlyProps) {
  return (
    <div className="body-diagram body-diagram--readonly">
      <img
        src={bodyDiagramUrl}
        alt="Diagrama corporal con lesiones marcadas"
        className="body-diagram__image"
        loading="eager"
        decoding="async"
        draggable={false}
      />
      <svg
        className="body-diagram__overlay"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {markers.map(({ marker, number }, index) => (
          <g key={index} className="body-diagram__marker">
            <circle
              className="body-diagram__marker-circle"
              cx={marker.cx}
              cy={marker.cy}
              r={marker.r}
            />
            <text
              className="body-diagram__marker-text"
              x={marker.cx}
              y={marker.cy}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {number}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
