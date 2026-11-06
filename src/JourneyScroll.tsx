import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recall, remember } from "./journey";

export function JourneyScroll() {
  const { pathname } = useLocation();
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => { history.scrollRestoration = previous; };
  }, []);
  useEffect(() => {
    let restoring = true;
    let frame = 0;
    const saved = recall<number>("scroll:" + pathname, 0);
    const top = Number.isFinite(saved) ? Math.max(0, saved) : 0;
    let resize: ResizeObserver | undefined;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      resize?.disconnect();
      clearTimeout(settleTimer);
      restoring = false;
      remember("scroll:" + pathname, window.scrollY);
    };
    const restore = () => {
      if (document.querySelector("#main > [role=status]:not(.connection-note)")) { frame = requestAnimationFrame(restore); return; }
      window.scrollTo({ top, behavior: "instant" });
      if (pathname === "/explorar") {
        const slug = recall("selected-place", "");
        const card = [...document.querySelectorAll<HTMLElement>("[data-place-slug]")].find(el => el.dataset.placeSlug === slug);
        if (top > 200) card?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
      }
      // Async map notices can change page height after the first render.
      // Keep the saved position during that brief layout settling period.
      resize = new ResizeObserver(() => window.scrollTo({ top, behavior: "instant" }));
      const main = document.getElementById("main");
      if (main) resize.observe(main);
      settleTimer = setTimeout(finish, 1000);
    };
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(restore); });
    const save = () => { if (!restoring) remember("scroll:" + pathname, window.scrollY); };
    window.addEventListener("scroll", save, { passive: true });
    const interrupt = () => { cancelAnimationFrame(frame); finish(); };
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("pointerdown", interrupt, { passive: true });
    window.addEventListener("keydown", interrupt);
    return () => {
      cancelAnimationFrame(frame);
      resize?.disconnect();
      clearTimeout(settleTimer);
      window.removeEventListener("scroll", save);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("keydown", interrupt);
    };
  }, [pathname]);
  return null;
}
