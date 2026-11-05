import { useEffect, useState } from "react";

export function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    let active = true;
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready)
        .then(() => { if (active) setReady(true); })
        .catch(() => { if (active) setFailed(true); });
    }
    return () => {
      active = false;
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return <div className="connection-note" role="status">
    <span className={online ? "connection-dot" : "connection-dot offline"} aria-hidden="true" />
    {!online ? "Sin conexión · mapa básico y contenido local" : ready ? "Guía guardada · disponible sin conexión" : failed ? "No se pudo guardar la guía sin conexión. Recarga para reintentar." : import.meta.env.PROD ? "Preparando guía sin conexión…" : "Guía de León · versión de desarrollo"}
  </div>;
}
