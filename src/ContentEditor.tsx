import { useState } from "react";
import { loadCatalog, originalCatalog, saveCatalog, validateCatalog } from "./content";

export function ContentEditor() {
  const [initial] = useState(() => {
    try { return { text: JSON.stringify(loadCatalog(), null, 2), error: "" }; }
    catch (error) { return { text: JSON.stringify(originalCatalog(), null, 2), error: (error as Error).message }; }
  });
  const [text, setText] = useState(initial.text);
  const [error, setError] = useState(initial.error);
  const [message, setMessage] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const update = (value: string) => { setText(value); setError(""); setMessage(""); setConfirmReset(false); };
  const run = (action: () => void) => {
    setError(""); setMessage("");
    try { action(); } catch (error) { setError((error as Error).message); }
  };
  return <>
    <div className="page-title"><h1>Administrar contenidos locales</h1>
      <p>Edita el catálogo JSON, importa un respaldo o exporta tus cambios.</p></div>
    <p className="notice">Los cambios se guardan únicamente en este navegador y esta dirección.
      No hay cuentas ni sincronización entre dispositivos. Exporta un respaldo antes de borrar
      los datos del navegador. Para distribuir el catálogo, reemplaza src/data/catalog.json
      con el archivo exportado y vuelve a compilar.</p>
    <p>Conserva los identificadores y las referencias de lugares. Las coordenadas y los
      acontecimientos revisados requieren fuentes verificadas. Incorpora recursos solo con
      autor, licencia y permiso. Las respuestas de la actividad están incluidas en el JSON;
      la actividad es educativa, no un examen protegido.</p>
    <label>Importar catálogo JSON<input type="file" accept=".json,application/json" onChange={async e => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const catalog = validateCatalog(JSON.parse(await file.text()));
        update(JSON.stringify(catalog, null, 2));
        setMessage("Catálogo importado para revisión. Pulsa Guardar cambios para aplicarlo.");
      } catch (error) { setError((error as Error).message); }
    }} /></label>
    <form onSubmit={e => { e.preventDefault(); run(() => {
      saveCatalog(JSON.parse(text)); setMessage("Cambios guardados en este navegador.");
    }); }}>
      <label htmlFor="catalog-editor">Catálogo JSON</label>
      <textarea id="catalog-editor" className="catalog-editor" spellCheck={false} value={text}
        onChange={e => update(e.target.value)} />
      <div className="actions">
        <button type="submit">Guardar cambios</button>
        <button type="button" onClick={() => run(() => {
          const catalog = validateCatalog(JSON.parse(text));
          const url = URL.createObjectURL(new Blob([JSON.stringify(catalog, null, 2) + "\n"], { type: "application/json" }));
          const link = document.createElement("a");
          link.href = url; link.download = "catalog.json"; link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setMessage("Catálogo exportado.");
        })}>Exportar JSON</button>
        <button type="button" onClick={() => setConfirmReset(true)}>Restaurar catálogo original</button>
      </div>
    </form>
    {confirmReset && <div className="notice"><p>Se reemplazarán los cambios locales por el catálogo incluido con la aplicación.</p>
      <button onClick={() => run(() => {
        const catalog = originalCatalog(); saveCatalog(catalog); update(JSON.stringify(catalog, null, 2));
        setMessage("Catálogo original restaurado.");
      })}>Confirmar restauración</button>{" "}<button onClick={() => setConfirmReset(false)}>Cancelar</button></div>}
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
  </>;
}
