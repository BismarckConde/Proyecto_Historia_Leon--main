import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { AdminModal } from "./AdminModal";
import type { Catalog } from "./content";
import { supabase } from "./supabase";
import type { HistoricalEvent, Source } from "./types";

type EventDraft = Omit<HistoricalEvent, "place_name">;
const emptySource = (id: number): Source => ({ id, title: "", institution: "", url: "", verified: false, accessed_on: null, publication_date: "", notes: "" });
const emptyEvent = (id: number): EventDraft => ({
  id, title: "", year: 0, description: "", verified: false, source: emptySource(id),
  place_slug: null, category: "Historia", location: "", featured: false,
  latitude: null, longitude: null, coordinate_source: null, image_url: null, image_alt: "",
});
const alertClass = { popup: "admin-alert", confirmButton: "admin-alert-confirm", cancelButton: "admin-alert-cancel" };

export function HistoricalEventEditor({ events, places, onSave }: {
  events: Catalog["events"];
  places: Catalog["places"];
  onSave: (events: Catalog["events"]) => Promise<void>;
}) {
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const editing = !!draft && events.some(event => event.id === draft.id);
  const selectedImage = imagePreview || draft?.image_url || "";

  useEffect(() => {
    if (!imageFile) { setImagePreview(""); return; }
    const preview = URL.createObjectURL(imageFile);
    setImagePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [imageFile]);

  const startEdit = (event?: Catalog["events"][number]) => {
    const relatedPlace = event?.place_slug ? places.find(place => place.slug === event.place_slug) : undefined;
    setDraft(event ? { ...structuredClone(event), category: event.category ?? "Historia",
      location: event.location ?? relatedPlace?.name ?? "León", featured: event.featured ?? false,
      latitude: event.latitude ?? null, longitude: event.longitude ?? null,
      coordinate_source: event.coordinate_source ?? null,
      image_url: event.image_url ?? null, image_alt: event.image_alt ?? "",
    } : emptyEvent(Math.max(0, ...events.map(item => item.id)) + 1));
    setImageFile(null); setImagePreview("");
    setError("");
    setNotice("");
  };
  const closeEditor = () => {
    if (busy) return;
    setDraft(null); setImageFile(null); setImagePreview(""); setError("");
  };
  const setSource = (patch: Partial<Source>) => setDraft(current => current ? { ...current, source: { ...current.source, ...patch } } : current);
  const setCoordinateSource = (patch: Partial<Source>) => setDraft(current => current ? { ...current, coordinate_source: { ...(current.coordinate_source || emptySource(current.id + 1000)), ...patch } } : current);

  const save = async (submit: React.FormEvent) => {
    submit.preventDefault();
    if (!draft) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const latitude = draft.latitude;
      const longitude = draft.longitude;
      const location = (draft.location ?? "").trim();
      const hasCoordinates = (latitude !== null && latitude !== undefined) || (longitude !== null && longitude !== undefined);
      if (hasCoordinates && (latitude == null || longitude == null)) throw new Error("Completa la latitud y la longitud, o deja ambas vacías.");
      if (!draft.title.trim() || !draft.category?.trim() || !draft.description.trim()) throw new Error("Completa el título, la categoría y la descripción del acontecimiento.");
      if (hasCoordinates && !draft.coordinate_source?.title.trim()) throw new Error("Indica la fuente cartográfica de estas coordenadas.");
      if (hasCoordinates && !draft.coordinate_source?.institution.trim()) throw new Error("Indica la institución de la fuente cartográfica.");
      if (hasCoordinates && !draft.coordinate_source?.url.trim()) throw new Error("Agrega el enlace de la fuente cartográfica.");
      if (!location) throw new Error("Indica dónde ocurrió el acontecimiento.");
      if (!draft.source.title.trim() || !draft.source.institution.trim() || !draft.source.url.trim()) throw new Error("Completa el título, la institución y el enlace de la fuente histórica.");
      if (draft.featured && (!draft.verified || !draft.source.verified)) throw new Error("Para incluir un hito en la línea del tiempo, marca el acontecimiento y su fuente como verificados.");
      let imageUrl = draft.image_url ?? null;
      if (imageFile) {
        if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(imageFile.type)) throw new Error("Usa una imagen JPG, PNG, WebP, GIF o AVIF.");
        if (imageFile.size > 10 * 1024 * 1024) throw new Error("La imagen debe pesar menos de 10 MB.");
        if (!supabase) throw new Error("No se pudo conectar con el almacenamiento de Supabase.");
        const safeName = imageFile.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `historical-events/${draft.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("place-photos").upload(path, imageFile, { contentType: imageFile.type, upsert: false });
        if (uploadError) throw new Error(`No se pudo subir la imagen: ${uploadError.message}`);
        imageUrl = supabase.storage.from("place-photos").getPublicUrl(path).data.publicUrl;
      }
      const nextEvent: EventDraft = {
        ...draft,
        title: draft.title.trim(), category: (draft.category || "Historia").trim(), location,
        description: draft.description.trim(), place_slug: draft.place_slug || null,
        image_url: imageUrl, image_alt: imageUrl ? (draft.image_alt?.trim() || draft.title.trim()) : "",
        latitude: hasCoordinates ? latitude : null, longitude: hasCoordinates ? longitude : null,
        source: { ...draft.source, title: draft.source.title.trim(), institution: draft.source.institution.trim(),
          url: draft.source.url.trim(), accessed_on: draft.source.accessed_on || null,
          publication_date: draft.source.publication_date.trim(), notes: draft.source.notes.trim() },
        coordinate_source: hasCoordinates && draft.coordinate_source ? {
          ...draft.coordinate_source, title: draft.coordinate_source.title.trim(), institution: draft.coordinate_source.institution.trim(),
          url: draft.coordinate_source.url.trim(), accessed_on: draft.coordinate_source.accessed_on || null,
          publication_date: draft.coordinate_source.publication_date.trim(), notes: draft.coordinate_source.notes.trim(),
        } : null,
      };
      const next = events.some(event => event.id === draft.id)
        ? events.map(event => event.id === draft.id ? nextEvent : event)
        : [...events, nextEvent];
      await onSave(next);
      setDraft(null);
      setImageFile(null); setImagePreview("");
      setNotice(editing ? "Acontecimiento actualizado y publicado." : "Acontecimiento agregado y publicado.");
      await Swal.fire({ icon: "success", title: "Cambios guardados", text: editing ? "Acontecimiento actualizado y publicado." : "Acontecimiento agregado y publicado.", confirmButtonText: "Aceptar", customClass: { popup: "admin-alert", confirmButton: "admin-alert-confirm" }, buttonsStyling: false });
    } catch (caught) {
      const message = (caught as Error).message;
      setError(message);
      await Swal.fire({ icon: "error", title: "No se pudo guardar", text: message, confirmButtonText: "Entendido", customClass: { popup: "admin-alert", confirmButton: "admin-alert-confirm" }, buttonsStyling: false });
    } finally { setBusy(false); }
  };

  const remove = async (event: Catalog["events"][number]) => {
    const confirmation = await Swal.fire({ icon: "warning", title: "¿Eliminar este acontecimiento?", text: `Se quitará “${event.title}” de Explorar y de la línea del tiempo.`, showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar", customClass: alertClass, buttonsStyling: false });
    if (!confirmation.isConfirmed) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await onSave(events.filter(item => item.id !== event.id));
      setNotice("Acontecimiento eliminado.");
      await Swal.fire({ icon: "success", title: "Acontecimiento eliminado", confirmButtonText: "Aceptar", customClass: { popup: "admin-alert", confirmButton: "admin-alert-confirm" }, buttonsStyling: false });
    } catch (caught) {
      const message = (caught as Error).message; setError(message);
      await Swal.fire({ icon: "error", title: "No se pudo eliminar", text: message, confirmButtonText: "Entendido", customClass: { popup: "admin-alert", confirmButton: "admin-alert-confirm" }, buttonsStyling: false });
    } finally { setBusy(false); }
  };

  return <section className="admin-event-manager">
    <div className="admin-section-heading"><div><p className="eyebrow">Catálogo histórico</p><h2>Acontecimientos</h2></div><button disabled={busy} onClick={() => startEdit()}>＋ Agregar suceso histórico</button></div>
    <p className="admin-hint">Los acontecimientos aparecen en Explorar. Marca solo los hitos más relevantes para incluirlos en Historia.</p>
    {notice && <p className="admin-success" role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-event-list">{events.slice().sort((a, b) => a.year - b.year || a.id - b.id).map(event => <article className="admin-event-row" key={event.id}>
      <span className="admin-event-year">{event.year}</span><div className="admin-event-info"><span>{event.category || "Historia"} · {event.featured ? "Hito de Historia" : "Explorar"}</span><h3>{event.title}</h3><p>{event.location || places.find(place => place.slug === event.place_slug)?.name || "León"}</p></div>
      <div className="admin-row-actions"><button className="secondary" disabled={busy} onClick={() => startEdit(event)}>Editar</button><button className="admin-delete" disabled={busy} onClick={() => remove(event)}>Eliminar</button></div>
    </article>)}</div>
    {draft && <AdminModal title={editing ? "Editar suceso histórico" : "Agregar suceso histórico"} onClose={closeEditor}><form className="admin-form admin-event-form" onSubmit={save}>
      <p className="eyebrow">{editing ? "Editar acontecimiento" : "Nuevo acontecimiento"}</p><h2>{editing ? "Actualizar suceso histórico" : "Agregar un suceso histórico"}</h2>
      <label>Título<input required value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label>
      <div className="admin-form-pair"><label>Año<input required type="number" min="0" max="2100" step="1" value={draft.year || ""} onChange={e => setDraft({ ...draft, year: Number(e.target.value) })} /></label><label>Categoría<input required value={draft.category || ""} onChange={e => setDraft({ ...draft, category: e.target.value })} /></label></div>
      <label>Lugar del acontecimiento<input required value={draft.location || ""} onChange={e => setDraft({ ...draft, location: e.target.value })} placeholder="Ej. Costado oeste de la Alcaldía Municipal" /></label>
      <label>Ficha relacionada (opcional)<select value={draft.place_slug || ""} onChange={e => setDraft({ ...draft, place_slug: e.target.value || null })}><option value="">Sin ficha asociada</option>{places.map(place => <option value={place.slug} key={place.slug}>{place.name} · {place.municipality}</option>)}</select></label>
      <label>Descripción<textarea required rows={4} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label>
      <fieldset className="admin-fieldset"><legend>Imagen del suceso</legend>
        <label>Fotografía<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={e => { setImagePreview(""); setImageFile(e.target.files?.[0] ?? null); }} /></label>
        {selectedImage && <img className="admin-event-image-preview" src={selectedImage} alt={draft.image_alt || draft.title} />}
        {selectedImage && <label>Descripción accesible de la imagen<input required value={draft.image_alt || draft.title} onChange={e => setDraft({ ...draft, image_alt: e.target.value })} /></label>}
        {(draft.image_url || imageFile) && <button type="button" className="admin-delete" disabled={busy} onClick={() => { setImageFile(null); setImagePreview(""); setDraft({ ...draft, image_url: null, image_alt: "" }); }}>Quitar imagen</button>}
        <p className="admin-hint">Opcional. JPG, PNG, WebP, GIF o AVIF; máximo 10 MB. La imagen se mostrará en Explorar y en la línea del tiempo.</p>
      </fieldset>
      <fieldset className="admin-fieldset"><legend>Fuente histórica</legend>
        <label>Título de la fuente<input required value={draft.source.title} onChange={e => setSource({ title: e.target.value })} /></label>
        <label>Institución o autoría<input required value={draft.source.institution} onChange={e => setSource({ institution: e.target.value })} /></label>
        <label>Enlace a la fuente<input required type="url" value={draft.source.url} onChange={e => setSource({ url: e.target.value })} /></label>
        <div className="admin-form-pair"><label>Fecha de publicación<input value={draft.source.publication_date} onChange={e => setSource({ publication_date: e.target.value })} /></label><label>Fecha de consulta<input type="date" value={draft.source.accessed_on || ""} onChange={e => setSource({ accessed_on: e.target.value || null })} /></label></div>
        <label>Notas sobre la fuente<textarea rows={2} value={draft.source.notes} onChange={e => setSource({ notes: e.target.value })} /></label>
        <label className="admin-checkbox"><input type="checkbox" checked={draft.source.verified} onChange={e => setSource({ verified: e.target.checked })} /> Fuente consultada</label>
      </fieldset>
      <fieldset className="admin-fieldset"><legend>Ubicación en el mapa</legend>
        <div className="admin-form-pair"><label>Latitud<input type="number" step="any" value={draft.latitude ?? ""} onChange={e => setDraft({ ...draft, latitude: e.target.value === "" ? null : Number(e.target.value) })} /></label><label>Longitud<input type="number" step="any" value={draft.longitude ?? ""} onChange={e => setDraft({ ...draft, longitude: e.target.value === "" ? null : Number(e.target.value) })} /></label></div>
        <p className="admin-hint">Si dejas las coordenadas vacías, el mapa usa la ubicación verificada de la ficha relacionada. Sin ficha ni coordenadas verificadas, el acontecimiento no tendrá marcador.</p>
        {(draft.latitude !== null || draft.longitude !== null) && <>
          <label>Título de la fuente cartográfica<input required value={draft.coordinate_source?.title || ""} onChange={e => setCoordinateSource({ title: e.target.value })} /></label>
          <label>Institución cartográfica<input required value={draft.coordinate_source?.institution || ""} onChange={e => setCoordinateSource({ institution: e.target.value })} /></label>
          <label>Enlace cartográfico<input required type="url" value={draft.coordinate_source?.url || ""} onChange={e => setCoordinateSource({ url: e.target.value })} /></label>
          <label>Notas sobre la ubicación<textarea rows={2} value={draft.coordinate_source?.notes || ""} onChange={e => setCoordinateSource({ notes: e.target.value })} /></label>
          <label className="admin-checkbox"><input type="checkbox" checked={draft.coordinate_source?.verified || false} onChange={e => setCoordinateSource({ verified: e.target.checked })} /> Ubicación verificada</label>
        </>}
      </fieldset>
      <fieldset className="admin-fieldset"><legend>Publicación</legend>
        <label className="admin-checkbox"><input type="checkbox" checked={draft.verified} onChange={e => setDraft({ ...draft, verified: e.target.checked })} /> Acontecimiento verificado</label>
        <label className="admin-checkbox"><input type="checkbox" checked={draft.featured || false} onChange={e => setDraft({ ...draft, featured: e.target.checked })} /> Mostrar en la línea del tiempo como hito relevante</label>
      </fieldset>
      <div className="admin-form-actions"><button type="submit" disabled={busy}>{busy ? "Guardando…" : editing ? "Guardar cambios" : "Agregar acontecimiento"}</button><button type="button" className="secondary" disabled={busy} onClick={closeEditor}>Cancelar</button></div>
    </form></AdminModal>}
  </section>;
}
