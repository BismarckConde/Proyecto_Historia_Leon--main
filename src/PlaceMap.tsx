import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import department from "./data/leon-department.json";
import type { HistoricalEvent, Place } from "./types";
import { recall, remember, useJourneyText } from "./journey";

export function PlaceMap({ places, selectedSlug, onSelect }: { places: Place[]; selectedSlug: string; onSelect: (slug: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const sheetTitle = useRef<HTMLHeadingElement>(null);
  const mapRef = useRef<L.Map | undefined>(undefined);
  const selected = places.find(p => p.slug === selectedSlug && p.latitude !== null && p.longitude !== null && p.coordinate_source?.verified);
  const setSelected = (p?: Place) => onSelect(p?.slug || "");
  const placesKey = JSON.stringify(places);
  const [sheet, setSheet] = useJourneyText("map-sheet", "compact");
  const [origin, setOrigin] = useState<{ lat: number; lng: number; name: string }>();
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const originLayer = useRef<L.CircleMarker | undefined>(undefined);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  function locate() {
    if (!navigator.geolocation) { setLocationMessage("Ubicación no disponible. Puedes usar un lugar del mapa como origen."); return; }
    setLocating(true); setLocationMessage("Buscando tu ubicación…");
    navigator.geolocation.getCurrentPosition(position => {
      if (!alive.current) return;
      const point = { lat: position.coords.latitude, lng: position.coords.longitude, name: "Tu ubicación" };
      setOrigin(point); setLocating(false);
      setLocationMessage(`Ubicación aproximada (±${Math.round(position.coords.accuracy)} m).`);
      mapRef.current?.setView([point.lat, point.lng], 14, { animate: false });
    }, () => { if (alive.current) { setLocating(false); setLocationMessage("No se pudo obtener tu ubicación. Revisa el permiso o usa un lugar del mapa como origen."); } }, { timeout: 10000, maximumAge: 60000 });
  }
  const [failed, setFailed] = useState(!navigator.onLine);
  const markerRef = useRef<HTMLElement | null>(null);
  const mapped = places.filter(p => p.latitude !== null && p.longitude !== null && p.coordinate_source?.verified);
  const close = () => { setSelected(undefined); markerRef.current?.focus(); };
  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { zoomControl: false });
    mapRef.current = map;
    L.control.zoom({ position: "bottomright" }).addTo(map);
    const boundary = L.geoJSON(department as GeoJsonObject, { style: {
      color: "#456952", weight: 2, fillColor: "#a9bc8d", fillOpacity: .3,
    } }).addTo(map);
    const saved = recall<{ lat: number; lng: number; zoom: number } | null>("map-view", null);
    if (saved && Number.isFinite(saved.lat) && Math.abs(saved.lat) <= 90 && Number.isFinite(saved.lng) && Math.abs(saved.lng) <= 180 && Number.isFinite(saved.zoom) && saved.zoom >= 0 && saved.zoom <= 19) map.setView([saved.lat, saved.lng], saved.zoom);
    else map.fitBounds(boundary.getBounds().pad(.05));
    map.on("moveend", () => { const center = map.getCenter(); remember("map-view", { lat: center.lat, lng: center.lng, zoom: map.getZoom() }); });
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
      marker.getElement()?.setAttribute("data-place", p.slug);
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
  }, [placesKey]);
  useEffect(() => {
    container.current?.querySelectorAll<HTMLElement>(".place-marker").forEach(element => {
      const active = element.dataset.place === selectedSlug;
      element.classList.toggle("selected-marker", active);
      element.setAttribute("aria-pressed", String(active));
      if (active) markerRef.current = element;
    });
    if (selected) {
      sheetTitle.current?.focus({ preventScroll: true });
      const map = mapRef.current;
      if (map) {
        const point = map.latLngToContainerPoint([selected.latitude!, selected.longitude!]);
        const size = map.getSize();
        if (point.x < 44 || point.x > size.x - 44 || point.y < 44 || point.y > size.y * .4) {
          const projected = map.project([selected.latitude!, selected.longitude!], map.getZoom());
          map.panTo(map.unproject(projected.add([0, size.y * .22]), map.getZoom()), { animate: false });
        }
      }
    }
  }, [selectedSlug, placesKey]);
  useEffect(() => {
    originLayer.current?.remove();
    if (origin && mapRef.current) originLayer.current = L.circleMarker([origin.lat, origin.lng], { radius: 8, color: "#173c37", fillColor: "#fff", fillOpacity: 1 }).addTo(mapRef.current);
  }, [origin, places]);
  const distance = origin && selected ? Math.round(L.latLng(origin.lat, origin.lng).distanceTo([selected.latitude!, selected.longitude!])) : undefined;
  return <section className="map-panel" aria-label="Mapa de los lugares investigados">
    <div className="section-heading"><h2>Mapa de León</h2><span>{mapped.length} ubicaciones verificadas · <a href="#lista-lugares">Ver lista</a></span></div>
    <div className="map-stage">
      <div ref={container} className="map" aria-label="Mapa interactivo del departamento de León con ubicaciones verificadas" />
      <div className="map-tools"><button className="map-reset" onClick={() => mapRef.current?.fitBounds(L.geoJSON(department as GeoJsonObject).getBounds().pad(.05))}>Centrar mapa</button>
      <button className="map-locate" disabled={locating} onClick={locate}>{locating ? "Localizando…" : "Mi ubicación"}</button></div>
      {selected && <section className={"map-sheet sheet-" + sheet} aria-labelledby="map-place-title" onKeyDown={e => { if (e.key === "Escape") close(); }}>
        <div className="sheet-handle" aria-hidden="true" />
        <button className="sheet-close" onClick={close}>Cerrar ficha</button>
        <h3 id="map-place-title" ref={sheetTitle} tabIndex={-1}>{selected.name}</h3>
        {distance !== undefined && <p className="distance-label">{distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`} en línea recta desde {origin!.name}. No es distancia caminando.</p>}
        {sheet !== "compact" && <><p className="small">{selected.municipality} · {selected.category}</p><p>{selected.description}</p>
          <button className="secondary" onClick={() => { setOrigin({ lat: selected.latitude!, lng: selected.longitude!, name: selected.name }); setLocationMessage("Origen seleccionado. Toca otro lugar para comparar la distancia."); }}>Usar como origen</button></>}
        {sheet === "history" && <div className="sheet-history"><h4>Contexto histórico</h4><p>{selected.context || "Contexto pendiente de investigación."}</p><Link to={"/lugares/" + selected.slug}>Consultar fuentes y ficha completa</Link></div>}
        <div className="sheet-actions"><Link className="button" to={"/lugares/" + selected.slug}>Abrir ficha</Link>
        {sheet !== "history" && <button className="secondary" onClick={() => setSheet(sheet === "compact" ? "details" : "history")}>{sheet === "compact" ? "Ver detalles" : "Leer historia"}</button>}
        {sheet !== "compact" && <button className="secondary" onClick={() => setSheet("compact")}>Contraer ficha</button>}</div>
      </section>}
    </div>
    {locationMessage && <p className="map-message" role="status">{locationMessage}</p>}
    {failed && <p className="map-message" role="status">Mapa básico local: límite departamental y lugares verificados. Las calles necesitan conexión.</p>}
    {!mapped.length && <p role="status">No hay ubicaciones verificadas para este filtro. Consulta las fichas desde la lista.</p>}
    <p className="small map-credit">Límite orientativo y ubicaciones: OpenStreetMap contributors, ODbL 1.0. No es cartografía catastral.</p>
  </section>;
}

export function HistoricalEventMap({ events, selectedId, onSelect }: {
  events: HistoricalEvent[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const mapRef = useRef<L.Map | undefined>(undefined);
  const markerRef = useRef<HTMLElement | null>(null);
  const [failed, setFailed] = useState(!navigator.onLine);
  const eventsKey = JSON.stringify(events);
  const mapped = events.filter(e => e.latitude !== null && e.latitude !== undefined && e.longitude !== null && e.longitude !== undefined && e.coordinate_source?.verified);
  const recenter = () => {
    const map = mapRef.current;
    if (!map) return;
    if (mapped.length === 1) map.setView([mapped[0].latitude!, mapped[0].longitude!], 14, { animate: false });
    else if (mapped.length > 1) map.fitBounds(L.latLngBounds(mapped.map(event => L.latLng(event.latitude!, event.longitude!))).pad(.18), { maxZoom: 14, animate: false });
    else map.fitBounds(L.geoJSON(department as GeoJsonObject).getBounds().pad(.05), { animate: false });
  };
  const selected = mapped.find(e => e.id === selectedId);
  const sameSite = (a: HistoricalEvent, b: HistoricalEvent) => L.latLng(a.latitude!, a.longitude!).distanceTo([b.latitude!, b.longitude!]) < 200;
  const locationGroups = mapped.reduce<HistoricalEvent[][]>((groups, event) => {
    const group = groups.find(items => sameSite(items[0], event));
    if (group) group.push(event); else groups.push([event]);
    return groups;
  }, []);
  const selectedGroup = locationGroups.find(group => group.some(event => event.id === selectedId)) || [];

  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { zoomControl: false });
    mapRef.current = map;
    L.control.zoom({ position: "bottomright" }).addTo(map);
    const boundary = L.geoJSON(department as GeoJsonObject, { style: {
      color: "#456952", weight: 2, fillColor: "#a9bc8d", fillOpacity: .3,
    } }).addTo(map);
    if (mapped.length === 1) map.setView([mapped[0].latitude!, mapped[0].longitude!], 14, { animate: false });
    else if (mapped.length > 1) map.fitBounds(L.latLngBounds(mapped.map(event => L.latLng(event.latitude!, event.longitude!))).pad(.18), { maxZoom: 14, animate: false });
    else map.fitBounds(boundary.getBounds().pad(.05));
    const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19,
    });
    const reconnect = () => { setFailed(false); tiles.addTo(map); tiles.redraw(); };
    const offline = () => { setFailed(true); tiles.remove(); };
    tiles.on("tileerror", () => setFailed(true));
    if (navigator.onLine) tiles.addTo(map);
    window.addEventListener("online", reconnect);
    window.addEventListener("offline", offline);
    for (const group of locationGroups) {
      const event = group[0];
      const marker = L.marker([event.latitude!, event.longitude!], {
        title: group.length > 1 ? `${group.length} acontecimientos en ${event.location}` : `${event.year} · ${event.title}`,
        alt: group.length > 1 ? `${group.length} acontecimientos en ${event.location}` : `${event.year} · ${event.title}`,
        icon: L.divIcon({ className: "event-marker", html: `<span aria-hidden="true">${group.length > 1 ? `<b>${group.length}</b>` : ""}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
      }).addTo(map);
      marker.getElement()?.setAttribute("data-event-ids", group.map(item => item.id).join(","));
      marker.on("click", () => { markerRef.current = marker.getElement() || null; onSelect(event.id); });
      marker.getElement()?.addEventListener("keydown", keyEvent => {
        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          keyEvent.preventDefault();
          keyEvent.stopPropagation();
          markerRef.current = marker.getElement() || null;
          onSelect(event.id);
        }
      });
    }
    return () => { window.removeEventListener("online", reconnect); window.removeEventListener("offline", offline); map.remove(); };
  }, [eventsKey]);

  useEffect(() => {
    container.current?.querySelectorAll<HTMLElement>(".event-marker").forEach(element => {
      const active = element.dataset.eventIds?.split(",").includes(String(selectedId)) || false;
      element.classList.toggle("selected-marker", active);
      element.setAttribute("aria-pressed", String(active));
      if (active) markerRef.current = element;
    });
    if (selected) {
      title.current?.focus({ preventScroll: true });
      const map = mapRef.current;
      if (map) map.setView([selected.latitude!, selected.longitude!], Math.max(18, map.getZoom()), { animate: false });
    }
  }, [selectedId, eventsKey]);

  const close = () => { onSelect(null); markerRef.current?.focus(); };
  return <section className="map-panel" aria-label="Mapa de acontecimientos históricos">
    <div className="section-heading"><h2>Mapa de los acontecimientos</h2><span>{mapped.length} sucesos en {locationGroups.length} ubicaciones</span></div>
    <div className="map-stage">
      <div ref={container} className="map" aria-label="Mapa interactivo con los lugares documentados de los acontecimientos históricos" />
      <div className="map-tools"><button className="map-reset" onClick={recenter}>Ver todos los sucesos</button></div>
      {selected && <section className="map-sheet" aria-labelledby="map-event-title" onKeyDown={e => { if (e.key === "Escape") close(); }}>
        <div className="sheet-handle" aria-hidden="true" />
        <button className="sheet-close" onClick={close}>Cerrar ficha</button>
        <p className="eyebrow">{selected.year} · {selected.category}</p>
        <h3 id="map-event-title" ref={title} tabIndex={-1}>{selected.title}</h3>
        <p className="small">{selected.location}</p>
        {selected.image_url && <img className="event-map-image" src={selected.image_url} alt={selected.image_alt || selected.title} loading="lazy" />}
        {selectedGroup.length > 1 && <div className="co-located-events" role="group" aria-label="Otros acontecimientos en este mismo lugar">
          {selectedGroup.map(event => <button key={event.id} className="secondary" aria-pressed={event.id === selected.id} onClick={() => onSelect(event.id)}>{event.year} · {event.title}</button>)}
        </div>}
        <p>{selected.description}</p>
        <p className="small">{selected.coordinate_source?.notes}</p>
        {selected.coordinate_source && <p className="small"><a href={selected.coordinate_source.url} target="_blank" rel="noreferrer">Fuente cartográfica: {selected.coordinate_source.institution}</a></p>}
        <a href={selected.source.url} target="_blank" rel="noreferrer">Fuente histórica: {selected.source.institution} · {selected.source.title}</a>
      </section>}
    </div>
    {failed && <p className="map-message" role="status">Mapa básico local: límite departamental y marcadores verificados. Las calles necesitan conexión.</p>}
    {!mapped.length && <p role="status">No hay ubicaciones con coordenadas verificadas para estos acontecimientos. Consulta sus fichas y fuentes.</p>}
    <p className="small map-credit">Los marcadores indican ubicaciones orientativas respaldadas por una fuente cartográfica. Los sucesos que abarcan una ciudad pueden usar un punto de referencia urbano.</p>
  </section>;
}
