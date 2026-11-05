import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import department from "./data/leon-department.json";
import type { Place } from "./types";

export function PlaceMap({ places }: { places: Place[] }) {
  const container = useRef<HTMLDivElement>(null);
  const sheetTitle = useRef<HTMLHeadingElement>(null);
  const mapRef = useRef<L.Map | undefined>(undefined);
  const [selected, setSelected] = useState<Place>();
  const [failed, setFailed] = useState(!navigator.onLine);
  const markerRef = useRef<HTMLElement | null>(null);
  const mapped = places.filter(p => p.latitude !== null && p.longitude !== null && p.coordinate_source?.verified);
  const close = () => { setSelected(undefined); markerRef.current?.focus(); };
  useEffect(() => { if (selected) sheetTitle.current?.focus({ preventScroll: true }); }, [selected]);
  useEffect(() => {
    if (!container.current) return;
    setSelected(undefined);
    const map = L.map(container.current, { zoomControl: false });
    mapRef.current = map;
    L.control.zoom({ position: "bottomright" }).addTo(map);
    const boundary = L.geoJSON(department as GeoJsonObject, { style: {
      color: "#456952", weight: 2, fillColor: "#a9bc8d", fillOpacity: .3,
    } }).addTo(map);
    map.fitBounds(boundary.getBounds().pad(.05));
    const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19,
    });
    const reconnect = () => { setFailed(false); tiles.addTo(map); tiles.redraw(); };
    const offline = () => { setFailed(true); tiles.remove(); };
    tiles.on("tileerror", () => setFailed(true));
    if (navigator.onLine) tiles.addTo(map);
    window.addEventListener("online", reconnect);
    window.addEventListener("offline", offline);
    for (const p of mapped) {
      const marker = L.marker([p.latitude!, p.longitude!], {
        title: p.name, alt: p.name,
        icon: L.divIcon({ className: "place-marker", html: '<span aria-hidden="true"></span>', iconSize: [44, 44], iconAnchor: [22, 22] }),
      }).addTo(map);
      marker.on("click", () => { markerRef.current = marker.getElement() || null; setSelected(p); });
      marker.getElement()?.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          markerRef.current = marker.getElement() || null;
          setSelected(p);
        }
      });
    }
    return () => { window.removeEventListener("online", reconnect); window.removeEventListener("offline", offline); map.remove(); };
  }, [places]);
  return <section className="map-panel" aria-label="Mapa de los lugares investigados">
    <div className="section-heading"><h2>Tu próximo descubrimiento</h2><span>{mapped.length} ubicaciones verificadas</span></div>
    <div className="map-stage">
      <div ref={container} className="map" aria-label="Mapa interactivo del departamento de León con ubicaciones verificadas" />
      <button className="map-reset" onClick={() => mapRef.current?.fitBounds(L.geoJSON(department as GeoJsonObject).getBounds().pad(.05))}>Ver departamento</button>
      {selected && <section className="map-sheet" aria-labelledby="map-place-title" onKeyDown={e => { if (e.key === "Escape") close(); }}>
        <div className="sheet-handle" aria-hidden="true" />
        <button className="sheet-close" onClick={close}>Cerrar ficha</button>
        <p className="small">{selected.municipality} · {selected.category}</p>
        <h3 id="map-place-title" ref={sheetTitle} tabIndex={-1}>{selected.name}</h3>
        <p className="clamp-three">{selected.description}</p>
        <Link className="button" to={"/lugares/" + selected.slug}>Abrir ficha</Link>
      </section>}
    </div>
    {failed && <p className="map-message" role="status">Mapa básico local: límite departamental y lugares verificados. Las calles necesitan conexión.</p>}
    {!mapped.length && <p role="status">No hay ubicaciones verificadas para este filtro. Consulta las fichas desde la lista.</p>}
    <p className="small map-credit">Límite orientativo y ubicaciones: OpenStreetMap contributors, ODbL 1.0. No es cartografía catastral.</p>
  </section>;
}
