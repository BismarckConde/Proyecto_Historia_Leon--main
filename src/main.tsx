import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route as RouterRoute,
  Routes,
  useParams,
  useLocation,
} from "react-router-dom";
import type { Place, HistoricalEvent, Route } from "./types";
import { PlaceMap } from "./PlaceMap";
import { Quiz } from "./Quiz";
import { OfflineStatus } from "./OfflineStatus";
import territoryImage from "./assets/leon-territory.svg";
import "leaflet/dist/leaflet.css";
import "./style.css";
import { readContent } from "./content";
import { ContentEditor } from "./ContentEditor";
import cathedralImage from "./assets/catedral-leon.png";
function useData<T>(path: string) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let current = true;
    setData(undefined);
    setError("");
    readContent<T>(path)
      .then((x) => {
        if (current) setData(x);
      })
      .catch((e) => {
        if (current) setError(e.message);
      });
    return () => {
      current = false;
    };
  }, [path, retry]);
  return { data, error, retry: () => setRetry((x) => x + 1) };
}
function State({ error, retry }: { error: string; retry: () => void }) {
  return error ? (
    <div role="alert" className="notice">
      {error} <button onClick={retry}>Reintentar</button>
    </div>
  ) : (
    <p role="status">Cargando contenidos…</p>
  );
}
function Status({ place }: { place: Place }) {
  return (
    <span
      className={
        "badge " + (place.review_status === "reviewed" ? "reviewed" : "")
      }
    >
      {place.review_status === "reviewed"
        ? "Revisado con fuentes"
        : "Pendiente de verificación"}
    </span>
  );
}
function PlaceCard({ place }: { place: Place }) {
  return (
    <article className="card">
      <h3>
        <Link to={"/lugares/" + place.slug}>{place.name}</Link>
      </h3>
      <Status place={place} />
      <p>{place.description}</p>
      <Link className="text-link" to={"/lugares/" + place.slug}>
        Explorar ficha →
      </Link>
    </article>
  );
}
function CathedralArtwork() {
  return <figure className="cathedral-artwork"><img src={cathedralImage} alt="Ilustración tridimensional de la Catedral de León, Nicaragua" /></figure>;
}
function Home() {
  return (
    <>
      <section className="hero hero-home">
        <div className="hero-copy">
          <h1>
            León
            <br />
            <em>en el tiempo.</em>
          </h1>
          <p>
            Un recorrido educativo por la memoria, los lugares y las expresiones
            culturales del departamento de León, Nicaragua.
          </p>
          <div className="actions">
            <Link className="button" to="/explorar">
              Iniciar recorrido →
            </Link>
            <Link className="button secondary" to="/rutas">
              Ver rutas educativas
            </Link>
          </div>
          <div className="hero-note">Investigar · comprender · compartir</div>
        </div>
        <CathedralArtwork />
      </section>
      <section>
        <div className="section-heading">
          <h2>La memoria comienza con una pregunta</h2>
          
        </div>
        <div className="grid">
          <article className="card">
            <span className="number">01</span>
            <h3>Ubica los lugares</h3>
            <p>
              Distingue la ciudad del departamento de León. León Viejo se
              investigará como parte del municipio de La Paz Centro.
            </p>
            <Link to="/explorar">Mapa y catálogo →</Link>
          </article>
          <article className="card">
            <span className="number">02</span>
            <h3>Relaciona acontecimientos</h3>
            <p>
              Consulta fechas respaldadas por fuentes. Los hechos históricos y
              la tradición oral se identifican por separado.
            </p>
            <Link to="/tiempo">Línea del tiempo →</Link>
          </article>
          <article className="card">
            <span className="number">03</span>
            <h3>Aprende con criterio</h3>
            <p>
              Lee las fuentes y reconoce qué información falta comprobar antes
              de compartirla.
            </p>
            <Link to="/actividad">Actividad educativa →</Link>
          </article>
        </div>
      </section>
      <aside className="notice">
        Prototipo universitario en investigación. León Viejo y Catedral tienen
        una revisión documental inicial; las otras fichas están pendientes de
        ampliación. Consulta el estado y las fuentes antes de compartir
        información.
      </aside>
    </>
  );
}
function Explore() {
  const state = useData<Place[]>("places/");
  const [q, setQ] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState("");
  if (!state.data) return <State {...state} />;
  const all = state.data;
  const normalized = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = all.filter(
    (p) =>
      normalized(p.name + " " + p.description).includes(normalized(q)) &&
      (!municipality || p.municipality === municipality) &&
      (!category || p.category === category) &&
      (!period || p.period === period),
  );
  return (
    <>
      <div className="page-title">
        <h1>Explorar León</h1>
        <p>
          Un departamento, distintos espacios de historia. Consulta cada ficha y
          su estado de revisión.
        </p>
      </div>
      <div className="filters">
        <label>
          Buscar un lugar
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre o descripción"
          />
        </label>
        <label>
          Municipio
          <select
            aria-label="Municipio"
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
          >
            <option value="">Todos los municipios</option>
            {[...new Set(all.map((p) => p.municipality))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>

        {all.some((p) => p.period) && (
          <label>
            Período
            <select
              aria-label="Período"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="">Todos los períodos</option>
              {[...new Set(all.map((p) => p.period).filter(Boolean))].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </label>
        )}
      </div>
<div className="filter-chips" role="group" aria-label="Filtrar por tema">
        {["", ...new Set(all.map(p => p.category))].map(value => <button key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value || "Todos los temas"}</button>)}
      </div>
      <PlaceMap places={filtered} />
      <h2>
        Lista de lugares <span className="small">({filtered.length})</span>
      </h2>
      {!filtered.length && (
        <p role="status">
          No hay lugares que coincidan. Cambia la búsqueda o los filtros.
        </p>
      )}
      <div className="grid">
        {filtered.map((p) => (
          <PlaceCard key={p.id} place={p} />
        ))}
      </div>
    </>
  );
}
function PlaceDetail() {
  const { slug } = useParams();
  const state = useData<Place>("places/" + slug + "/");
  if (!state.data) return <State {...state} />;
  const p = state.data;
  return (
    <>
      <Link to="/explorar">← Volver al catálogo</Link>
      <div className="page-title">
        <h1>{p.name}</h1>
        <Status place={p} />
      </div>
      {p.slug === "catedral" && (
        <figure className="cathedral-detail-image">
          <img
            src={cathedralImage}
            alt="Ilustración tridimensional de la Catedral de León, Nicaragua"
            loading="lazy"
          />
          <figcaption>Ilustración de la Catedral de León, Nicaragua.</figcaption>
        </figure>
      )}
      <div className="detail-grid">
        <article>
          <h2>Descripción</h2>
          <p>{p.description}</p>
          <h2>Contexto histórico</h2>
          <p>{p.context || "Pendiente de investigación."}</p>
          <h2>Importancia cultural</h2>
          <p>{p.significance || "Pendiente de investigación."}</p>
          <h2>Afirmaciones y respaldo</h2>
          {p.claims.length ? (
            p.claims.map((c) => (
              <div className="claim" key={c.id}>
                <span className="badge">
                  {c.kind === "oral"
                    ? "Tradición oral"
                    : c.kind === "fact"
                      ? "Hecho histórico"
                      : "Propuesta por verificar"}{" "}
                  ·{" "}
                  {c.source.verified ? "fuente consultada" : "fuente pendiente"}
                </span>
                <p>{c.text}</p>
                <a href={c.source.url} target="_blank" rel="noreferrer">
                  {c.source.institution}: {c.source.title}
                </a>
                <p className="small">{c.locator}</p>
              </div>
            ))
          ) : (
            <p>No hay afirmaciones históricas verificadas incorporadas.</p>
          )}
          <h2>Acontecimientos relacionados</h2>
          {p.events
            .filter((e) => e.verified && e.source.verified)
            .map((e) => (
              <p key={e.id}>
                <strong>
                  {e.year} · {e.title}
                </strong>
                <br />
                {e.description}
              </p>
            ))}
          {!p.events.some((e) => e.verified && e.source.verified) && (
            <p>Pendientes de comprobar con fuentes.</p>
          )}
          <h2>Recursos y créditos</h2>
          {p.media.length ? (
            p.media.map((m) => (
              <figure key={m.id}>
                {m.kind === "image" ? (
                  <img src={m.url} alt={m.alt_text} loading="lazy" />
                ) : m.kind === "audio" ? (
                  <audio controls src={m.url} />
                ) : (
                  <a href={m.url}>{m.title}</a>
                )}
                <figcaption>
                  {m.title} · {m.creator} ·{" "}
                  <a href={m.permission_url}>{m.license}</a>
                </figcaption>
              </figure>
            ))
          ) : (
            <p>No se han incorporado recursos de terceros sin autorización.</p>
          )}
        </article>
        <aside className="card facts">
          <h2>Ubicación y revisión</h2>
          <dl>
            <dt>Municipio</dt>
            <dd>{p.municipality}</dd>
            <dt>Tema</dt>
            <dd>{p.category}</dd>
            <dt>Período</dt>
            <dd>{p.period || "Sin verificar"}</dd>
            <dt>Coordenadas</dt>
            <dd>
              {p.latitude !== null && p.coordinate_source?.verified
                ? `${p.latitude}, ${p.longitude}`
                : "Pendientes de verificación"}
            </dd>
          </dl>
          <h3>Fuentes de la ficha</h3>
          {p.sources.length ? (
            p.sources.map((s) => (
              <div key={s.id} className="source">
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
                <p>{s.institution}</p>
                <p className="small">
                  {s.verified ? "Consultada" : "Referencia por consultar"} ·{" "}
                  {s.accessed_on || "Sin fecha de consulta"}
                  {s.publication_date && " · " + s.publication_date}
                </p>
                <p className="small">{s.notes}</p>
              </div>
            ))
          ) : (
            <p>Se agregarán fuentes institucionales después de consultarlas.</p>
          )}
        </aside>
      </div>
    </>
  );
}
function Timeline() {
  const state = useData<HistoricalEvent[]>("events/");
  const [selected, setSelected] = useState("");
  if (!state.data) return <State {...state} />;
  const verified = state.data.filter((e) => e.verified && e.source.verified);
  const events = verified.filter((e) => !selected || e.place_slug === selected);
  return (
    <>
      <div className="page-title">
        <h1>León a través del tiempo</h1>
        <p>
          Relaciona las fechas con los lugares y consulta la fuente de cada
          acontecimiento.
        </p>
      </div>
      <label>
        Filtrar por lugar
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Todos los lugares</option>
          {[
            ...new Map(
              verified.map((e) => [e.place_slug, e.place_name]),
            ).entries(),
          ].map(([s, n]) => (
            <option key={s} value={s}>
              {n}
            </option>
          ))}
        </select>
      </label>
      {!events.length ? (
        <div className="notice">
          Aún no hay acontecimientos con fechas verificadas. La línea del tiempo
          se poblará al completar la revisión documental; no se muestran fechas
          supuestas.
        </div>
      ) : (
        <><nav className="timeline-anchors" aria-label="Saltar a un acontecimiento">{events.map(e => <a key={e.id} href={"#evento-" + e.id}>{e.year}</a>)}</nav><ol className="timeline">
          {events.map((e) => (
            <li key={e.id} id={"evento-" + e.id}>
              <span className="year">{e.year}</span>
              <img className="timeline-image" src={e.place_slug === "catedral" ? cathedralImage : territoryImage} alt={e.place_slug === "catedral" ? "Ilustración de la Catedral de León" : "Mapa del departamento con la ubicación de León Viejo"} loading="lazy" />
              <div>
                <h2>{e.title}</h2>
                <p className="clamp-three">{e.description}</p>
                <details className="event-description"><summary>Leer contexto completo</summary><p>{e.description}</p></details>
                <Link to={"/lugares/" + e.place_slug}>
                  Abrir ficha de {e.place_name} →
                </Link>
                <p>
                  <a href={e.source.url}>Fuente: {e.source.institution}</a>
                </p>
              </div>
            </li>
          ))}
        </ol></>
      )}
    </>
  );
}
function RouteList() {
  const state = useData<Route[]>("routes/");
  if (!state.data) return <State {...state} />;
  return (
    <>
      <div className="page-title">
        <h1>Rutas temáticas digitales</h1>
        <p>
          Recorridos educativos por las fichas. No son indicaciones de traslado
          físico.
        </p>
      </div>
      <div className="grid">
        {state.data.map((r) => (
          <article className="card" key={r.id}>
            <span className="number">
              {String(r.stops.length).padStart(2, "0")}
            </span>
            <h2>{r.title}</h2>
            <p>{r.description}</p>
            <Link className="button" to={"/rutas/" + r.slug}>
              Comenzar ruta →
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
function RouteDetail() {
  const { slug } = useParams();
  const state = useData<Route>("routes/" + slug + "/");
  const [step, setStep] = useState(0);
  useEffect(() => setStep(0), [slug]);
  if (!state.data) return <State {...state} />;
  const r = state.data;
  const stop = r.stops[step];
  return (
    <>
      <Link to="/rutas">← Todas las rutas</Link>
      <div className="page-title">
        <h1>{r.title}</h1>
        <p>{r.description}</p>
      </div>
      {stop ? (
        <>
          <p role="status">
            Parada {step + 1} de {r.stops.length}
          </p>
          <progress
            value={step + 1}
            max={r.stops.length}
            aria-label="Progreso de la ruta"
          />
          <PlaceCard place={stop.place} />
          <p className="notice">Para reflexionar: {stop.prompt}</p>
          <div className="actions route-actions">
            <button disabled={step === 0} onClick={() => setStep(step - 1)}>
              Anterior
            </button>
            {step < r.stops.length - 1 ? (
              <button onClick={() => setStep(step + 1)}>
                Siguiente parada
              </button>
            ) : (
              <Link className="button" to="/actividad">
                Ruta terminada · Ir a la actividad
              </Link>
            )}
          </div>
        </>
      ) : (
        <p>Esta ruta aún no tiene paradas.</p>
      )}
    </>
  );
}
function Fair() {
  const [url, setUrl] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setQr("");
    try {
      const u = new URL(url);
      if (!["http:", "https:"].includes(u.protocol))
        throw new Error("Usa una dirección HTTP o HTTPS.");
      if (
        ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(
          u.hostname,
        )
      )
        throw new Error(
          "Usa una dirección accesible desde los teléfonos, no localhost.",
        );
      const { default: QRCode } = await import("qrcode");
      setQr(await QRCode.toDataURL(u.href, { width: 320, margin: 2 }));
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <>
      <div className="page-title">
        <h1>Preparar la feria</h1>
        <p>
          Genera un QR cuando tengas la dirección real de la demostración, en
          una red local accesible o un sitio publicado.
        </p>
      </div>
      <form className="card" onSubmit={generate}>
        <label>
          Dirección de inicio o de una ruta
          <input
            type="url"
            required
            placeholder="https://tu-sitio/rutas/origenes"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setQr("");
            }}
          />
        </label>
        <button>Generar QR</button>
        {error && <p role="alert">{error}</p>}
        {qr && (
          <figure>
            <img src={qr} alt="Código QR de la dirección de la demostración" />
            <figcaption>{url}</figcaption>
            <a href={qr} download="leon-en-el-tiempo-qr.png">
              Descargar QR
            </a>
          </figure>
        )}
      </form>
      <p className="notice">
        El QR no publica el sitio. Prueba el enlace y el código en un teléfono
        antes de imprimirlo.
      </p>
    </>
  );
}
function ScrollToPage() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}
function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = window.localStorage.getItem("leon-theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return "light";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("leon-theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <ScrollToPage />
      <a className="skip" href="#main">
        Saltar al contenido
      </a>
      <header>
        <Link to="/" className="brand">
          LEÓN <span>EN EL TIEMPO</span>
        </Link>
        <div className="header-controls">
          <nav aria-label="Navegación principal">
            {[
              ["/explorar", "Explorar"],
              ["/tiempo", "Historia"],
              ["/rutas", "Rutas"],
              ["/actividad", "Quiz"],
            ].map(([to, label]) => (
              <NavLink key={to} to={to}>
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="theme-toggle"
            aria-label={`Cambiar a tema ${theme === "light" ? "oscuro" : "claro"}`}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "Modo oscuro" : "Modo claro"}
          </button>
        </div>
      </header>
      <main id="main">
        <OfflineStatus />
        <Routes>
          <RouterRoute path="/" element={<Home />} />
          <RouterRoute path="/explorar" element={<Explore />} />
          <RouterRoute path="/lugares/:slug" element={<PlaceDetail />} />
          <RouterRoute path="/tiempo" element={<Timeline />} />
          <RouterRoute path="/rutas" element={<RouteList />} />
          <RouterRoute path="/rutas/:slug" element={<RouteDetail />} />
          <RouterRoute path="/actividad" element={<Quiz />} />
          <RouterRoute path="/feria" element={<Fair />} />
          <RouterRoute path="/admin" element={<ContentEditor />} />
          <RouterRoute
            path="*"
            element={
              <>
                <h1>Página no encontrada</h1>
                <Link to="/">Volver al inicio</Link>
              </>
            }
          />
        </Routes>
      </main>
      <footer>
        <div className="brand">
          LEÓN <span>EN EL TIEMPO</span>
        </div>
        <p>
          Proyecto universitario · Historia e Identidad Nacional · UNI
          <br />
          Memoria con fuentes, tecnología con propósito.
        </p>
        <div className="footer-links"><Link to="/feria">Preparar feria y QR</Link><Link to="/admin">Administrar contenidos locales</Link></div>
      </footer>
    </BrowserRouter>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
