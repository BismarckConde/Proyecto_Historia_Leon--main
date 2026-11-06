import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { completeLegacyCoordinates, loadCatalog, saveCatalog, validateCatalog, type Catalog } from "./content";
import { supabase, supabaseConfigured } from "./supabase";
import type { Place, Source } from "./types";
import { AdminModal } from "./AdminModal";
import { HistoricalEventEditor } from "./HistoricalEventEditor";

const emptySource = (id: number): Source => ({ id, title: "", institution: "", url: "", verified: false, accessed_on: null, publication_date: "", notes: "" });
const emptyPlace = (): Omit<Place, "events"> => ({
  id: 0, name: "", slug: "", municipality: "León", category: "Cultural", period: "",
  description: "", context: "", significance: "", review_status: "pending",
  latitude: null, longitude: null, coordinate_source: null, sources: [], claims: [], media: [],
});
const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ContentEditor() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [catalog, setCatalog] = useState<Catalog>(() => loadCatalog());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [place, setPlace] = useState<Omit<Place, "events">>(emptyPlace());
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [json, setJson] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const editing = activeId !== null;

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setIsAdmin(false); });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !supabase) return;
    let alive = true;
    (async () => {
      const { data: admin, error: roleError } = await supabase!.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (!alive) return;
      if (roleError) { setError("No se pudo verificar el acceso de administrador. Aplica el esquema SQL incluido en supabase/schema.sql."); return; }
      if (!admin) { setIsAdmin(false); return; }
      setIsAdmin(true);
      const { data: row, error: readError } = await supabase!.from("content_catalog").select("catalog").eq("id", 1).maybeSingle();
      if (!alive) return;
      if (readError) { setError(readError.message); return; }
      try {
        const next = row?.catalog ? completeLegacyCoordinates(validateCatalog(row.catalog)) : loadCatalog();
        setCatalog(next); saveCatalog(next); setJson(JSON.stringify(next, null, 2));
      } catch (e) { setError((e as Error).message); }
    })();
    return () => { alive = false; };
  }, [session]);

  const saveRemote = async (nextValue: unknown) => {
    if (!supabase || !session || !isAdmin) throw new Error("Inicia sesión con una cuenta administradora para guardar cambios.");
    const next = completeLegacyCoordinates(validateCatalog(nextValue));
    const { error: saveError } = await supabase.from("content_catalog").upsert({ id: 1, catalog: next, updated_by: session.user.id }, { onConflict: "id" });
    if (saveError) throw saveError;
    saveCatalog(next); setCatalog(next); setJson(JSON.stringify(next, null, 2));
    return next;
  };
  const saveEvents = async (events: Catalog["events"]) => {
    await saveRemote({ ...catalog, events });
  };

  const login = async () => {
    if (!supabase) return;
    const redirectTo = import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin + "/admin";
    const { error: loginError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (loginError) setError(loginError.message);
  };
  const startEdit = (item?: Omit<Place, "events">) => {
    setActiveId(item?.id ?? null);
    setPlace(item ? structuredClone(item) : { ...emptyPlace(), id: Math.max(0, ...catalog.places.map(p => p.id)) + 1 });
    setPhotoUrl(item?.media.find(m => m.kind === "image")?.url || ""); setPhotoFile(null); setPhotoPreview(""); setError(""); setNotice("");
  };
  const closePlaceEditor = () => {
    setActiveId(null); setPlace(emptyPlace()); setPhotoUrl(""); setPhotoFile(null); setPhotoPreview("");
  };
  const updatePlaceSource = (index: number, patch: Partial<Source>) => setPlace(current => ({
    ...current, sources: current.sources.map((source, sourceIndex) => sourceIndex === index ? { ...source, ...patch } : source),
  }));
  const addPlaceSource = () => setPlace(current => ({
    ...current, sources: [...current.sources, emptySource(Math.max(0, ...current.sources.map(source => source.id)) + 1)],
  }));
  const removePlaceSource = (index: number) => setPlace(current => ({
    ...current, sources: current.sources.filter((_, sourceIndex) => sourceIndex !== index),
  }));
  useEffect(() => {
    if (!photoFile) { setPhotoPreview(""); return; }
    const preview = URL.createObjectURL(photoFile); setPhotoPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [photoFile]);
  const savePlace = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const slug = slugify(place.slug || place.name);
      const sources = place.sources.filter(source => source.title.trim() || source.institution.trim() || source.url.trim() || source.publication_date.trim() || source.notes.trim() || source.verified);
      for (const source of sources) {
        if (!source.title.trim() || !source.institution.trim() || !source.url.trim()) throw new Error("Completa el título, la institución y el enlace de cada fuente del lugar.");
        try { new URL(source.url.trim()); } catch { throw new Error("Revisa el enlace de cada fuente del lugar."); }
      }
      const normalizedSources = sources.map(source => ({ ...source, title: source.title.trim(), institution: source.institution.trim(), url: source.url.trim(), publication_date: source.publication_date.trim(), accessed_on: source.accessed_on || null, notes: source.notes.trim() }));
      let finalPhotoUrl = photoUrl;
      if (photoFile) {
        if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(photoFile.type)) throw new Error("Usa una imagen JPG, PNG, WebP, GIF o AVIF.");
        if (photoFile.size > 10 * 1024 * 1024) throw new Error("La imagen debe pesar menos de 10 MB.");
        if (!supabase) throw new Error("No se pudo conectar con el almacenamiento de Supabase.");
        const safeName = photoFile.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${slug}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("place-photos").upload(path, photoFile, { contentType: photoFile.type, upsert: false });
        if (uploadError) throw new Error(`No se pudo subir la foto: ${uploadError.message}`);
        finalPhotoUrl = supabase.storage.from("place-photos").getPublicUrl(path).data.publicUrl;
      }
      const media = finalPhotoUrl ? [{ id: place.media.find(m => m.kind === "image")?.id || 1, title: place.name, kind: "image" as const, url: finalPhotoUrl, creator: "", license: "", permission_url: finalPhotoUrl, alt_text: `Fotografía de ${place.name}` }, ...place.media.filter(m => m.kind !== "image")] : place.media.filter(m => m.kind !== "image");
      const nextPlace = { ...place, slug, media, sources: normalizedSources };
      const next = { ...catalog, places: editing ? catalog.places.map(p => p.id === activeId ? nextPlace : p) : [...catalog.places, nextPlace] };
      await saveRemote(next); setActiveId(null); setPlace(emptyPlace()); setPhotoUrl(""); setPhotoFile(null); setPhotoPreview("");
      const success = editing ? "Lugar actualizado y publicado." : "Lugar agregado y publicado."; setNotice(success);
      await Swal.fire({ icon: "success", title: "Cambios guardados", text: success, confirmButtonText: "Aceptar", customClass: { popup: "admin-alert", confirmButton: "admin-alert-confirm" }, buttonsStyling: false });
    } catch (e) { const message = (e as Error).message; setError(message); await Swal.fire({ icon: "error", title: "No se pudo guardar", text: message, confirmButtonText: "Entendido", customClass: { popup: "admin-alert", confirmButton: "admin-alert-confirm" }, buttonsStyling: false }); } finally { setBusy(false); }
  };
  const deletePlace = async (item: Omit<Place, "events">) => {
    const confirmation = await Swal.fire({ icon: "warning", title: "¿Eliminar este lugar?", text: `Se eliminará “${item.name}” y se quitarán sus rutas, acontecimientos y preguntas relacionadas.`, showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar", customClass: { popup: "admin-alert", confirmButton: "admin-alert-confirm", cancelButton: "admin-alert-cancel" }, buttonsStyling: false });
    if (!confirmation.isConfirmed) return;
    setBusy(true); setError("");
    try {
      const next = { ...catalog, places: catalog.places.filter(p => p.id !== item.id), events: catalog.events.filter(e => e.place_slug !== item.slug), routes: catalog.routes.map(r => ({ ...r, stops: r.stops.filter(s => s.place_slug !== item.slug) })), questions: catalog.questions.filter(q => q.place__slug !== item.slug) };
      await saveRemote(next); setNotice("Lugar eliminado.");
      await Swal.fire({ icon: "success", title: "Lugar eliminado", confirmButtonText: "Aceptar", customClass: { popup: "admin-alert", confirmButton: "admin-alert-confirm" }, buttonsStyling: false });
    } catch (e) { const message = (e as Error).message; setError(message); await Swal.fire({ icon: "error", title: "No se pudo eliminar", text: message, confirmButtonText: "Entendido", customClass: { popup: "admin-alert", confirmButton: "admin-alert-confirm" }, buttonsStyling: false }); } finally { setBusy(false); }
  };
  const imagePreview = photoPreview || photoUrl;

  if (!supabaseConfigured) return <section className="admin-shell"><div className="page-title"><p className="eyebrow">Administración</p><h1>Configura el acceso al panel</h1><p>Agrega la URL del proyecto Supabase y su clave pública en un archivo <code>.env.local</code>.</p></div><pre className="admin-setup">VITE_SUPABASE_URL=https://tu-proyecto.supabase.co<br/>VITE_SUPABASE_ANON_KEY=tu-clave-publica\nVITE_SUPABASE_REDIRECT_URL=http://localhost:5173/admin</pre><p className="notice">Después aplica <code>supabase/schema.sql</code> en el editor SQL de Supabase, agrega tu usuario a <code>admin_users</code> y registra la ruta <code>/admin</code> en Google OAuth.</p></section>;
  if (!authReady) return <p role="status">Comprobando sesión…</p>;
  if (!session) return <section className="admin-login"><div className="admin-login-mark">L</div><p className="eyebrow">León en el tiempo</p><h1>Panel de administración</h1><p>Inicia sesión con Google para gestionar lugares, relatos e información cultural de León.</p><button onClick={login}>Continuar con Google</button><p className="admin-login-note">El acceso está limitado a cuentas autorizadas.</p>{error && <p role="alert">{error}</p>}</section>;
  if (!isAdmin) return <section className="admin-login"><p className="eyebrow">Acceso restringido</p><h1>Tu cuenta aún no tiene permisos</h1><p>Sesión iniciada como <strong>{session.user.email}</strong>. Solicita que se agregue tu usuario a la lista de administradores en Supabase.</p><button className="secondary" onClick={() => supabase?.auth.signOut()}>Cerrar sesión</button>{error && <p role="alert">{error}</p>}</section>;

  return <section className="admin-shell">
    <div className="admin-topbar"><div><p className="eyebrow">Administración · León, Nicaragua</p><h1>Gestionar contenidos</h1><p>Actualiza las historias y los lugares que aparecen en la guía.</p></div><div className="admin-account"><span>{session.user.email}</span><button className="secondary" onClick={() => supabase?.auth.signOut()}>Salir</button></div></div>
    <div className="admin-stats"><div><strong>{catalog.places.length}</strong><span>Lugares</span></div><div><strong>{catalog.events.length}</strong><span>Acontecimientos</span></div><div><strong>{catalog.routes.length}</strong><span>Rutas</span></div><div><strong>{catalog.questions.length}</strong><span>Preguntas</span></div></div>
    {notice && <p className="admin-success" role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-columns"><div className="admin-main-column">
      <div className="admin-section-heading"><div><p className="eyebrow">Catálogo de lugares</p><h2>Lugares turísticos y culturales</h2></div><button onClick={() => startEdit()}>＋ Agregar lugar</button></div>
      <div className="admin-place-list">{catalog.places.map(item => { const image = item.media.find(m => m.kind === "image")?.url; return <article className="admin-place-row" key={item.id}>{image ? <img src={image} alt="" /> : <div className="admin-place-placeholder">L</div>}<div className="admin-place-info"><span>{item.category} · {item.municipality}</span><h3>{item.name}</h3><p>{item.description}</p></div><div className="admin-row-actions"><button className="secondary" onClick={() => startEdit(item)}>Editar</button><button className="admin-delete" disabled={busy} onClick={() => deletePlace(item)}>Eliminar</button></div></article>; })}</div>
      <HistoricalEventEditor events={catalog.events} places={catalog.places} onSave={saveEvents} />
      <details className="admin-json"><summary>Editor avanzado del catálogo completo</summary><p>Para editar también fuentes, acontecimientos, rutas y preguntas. El contenido se valida antes de publicarse.</p><textarea aria-label="Catálogo JSON" value={json} onChange={e => setJson(e.target.value)} /><button disabled={busy} onClick={async () => { setBusy(true); setError(""); try { await saveRemote(JSON.parse(json)); setNotice("Catálogo completo guardado y publicado."); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }}>Guardar catálogo</button></details>
    </div>
    {activeId === null && place.id === 0 && <aside className="admin-guide"><h3>¿Qué puedes administrar?</h3><p>Agrega destinos, espacios patrimoniales, celebraciones, museos, gastronomía y otras expresiones culturales de León.</p><ul><li>Selecciona una foto desde tu dispositivo; la ficha conserva su URL pública.</li><li>Las fichas se publican al guardar.</li><li>El editor permite actualizar la información y las fuentes de cada lugar.</li></ul></aside>}
    {(activeId !== null || place.id !== 0) && <AdminModal title={editing ? "Editar lugar" : "Agregar lugar"} onClose={() => { if (!busy) closePlaceEditor(); }}>
      <form className="admin-form" onSubmit={savePlace}>
        <p className="eyebrow">{editing ? "Editar ficha" : "Nueva ficha"}</p>
        <h2>{editing ? "Actualizar lugar" : "Agregar un lugar"}</h2>
        <label>Nombre<input required value={place.name} onChange={e => setPlace({ ...place, name: e.target.value, slug: editing ? place.slug : slugify(e.target.value) })} /></label>
        <label>Identificador web<input required value={place.slug} onChange={e => setPlace({ ...place, slug: e.target.value })} /></label>
        <div className="admin-form-pair"><label>Municipio<input required value={place.municipality} onChange={e => setPlace({ ...place, municipality: e.target.value })} /></label><label>Categoría<input required value={place.category} onChange={e => setPlace({ ...place, category: e.target.value })} /></label></div>
        <label>Época o período<input value={place.period} onChange={e => setPlace({ ...place, period: e.target.value })} /></label>
        <label>Descripción corta<textarea required rows={3} value={place.description} onChange={e => setPlace({ ...place, description: e.target.value })} /></label>
        <label>Contexto histórico y cultural<textarea rows={4} value={place.context} onChange={e => setPlace({ ...place, context: e.target.value })} /></label>
        <label>Importancia para la identidad de León<textarea rows={3} value={place.significance} onChange={e => setPlace({ ...place, significance: e.target.value })} /></label>
        <fieldset className="admin-fieldset admin-source-list">
          <legend>Fuentes del lugar</legend>
          <p className="admin-hint">Registra las referencias que respaldan la descripción, el contexto y la importancia del lugar.</p>
          {place.sources.map((source, index) => <div className="admin-source-entry" key={source.id + "-" + index}>
            <div className="admin-source-heading"><h3>Fuente {index + 1}</h3><button type="button" className="admin-delete" disabled={busy} onClick={() => removePlaceSource(index)}>Quitar</button></div>
            <label>Título de la fuente<input required value={source.title} onChange={e => updatePlaceSource(index, { title: e.target.value })} /></label>
            <label>Institución o autoría<input required value={source.institution} onChange={e => updatePlaceSource(index, { institution: e.target.value })} /></label>
            <label>Enlace a la fuente<input required type="url" value={source.url} onChange={e => updatePlaceSource(index, { url: e.target.value })} /></label>
            <div className="admin-form-pair"><label>Fecha de publicación<input value={source.publication_date} onChange={e => updatePlaceSource(index, { publication_date: e.target.value })} /></label><label>Fecha de consulta<input type="date" value={source.accessed_on || ""} onChange={e => updatePlaceSource(index, { accessed_on: e.target.value || null })} /></label></div>
            <label>Notas sobre la fuente<textarea rows={2} value={source.notes} onChange={e => updatePlaceSource(index, { notes: e.target.value })} /></label>
            <label className="admin-checkbox"><input type="checkbox" checked={source.verified} onChange={e => updatePlaceSource(index, { verified: e.target.checked })} /> Fuente consultada</label>
          </div>)}
          <button type="button" className="secondary admin-add-source" disabled={busy} onClick={addPlaceSource}>＋ Agregar fuente</button>
        </fieldset>
        <label>Fotografía del lugar<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={e => setPhotoFile(e.target.files?.[0] ?? null)} /></label>
        {imagePreview && <img className="admin-image-preview" src={imagePreview} alt="Vista previa de la fotografía seleccionada" onError={e => { e.currentTarget.style.display = "none"; }} />}
        <p className="admin-hint">Selecciona una imagen de hasta 10 MB. Se sube a Supabase Storage y el catálogo guarda únicamente su URL pública.</p>
        <div className="admin-form-actions"><button type="submit" disabled={busy}>{busy ? "Guardando…" : editing ? "Guardar cambios" : "Agregar lugar"}</button><button type="button" className="secondary" disabled={busy} onClick={closePlaceEditor}>Cancelar</button></div>
      </form>
    </AdminModal>}
    </div>
  </section>;
}
