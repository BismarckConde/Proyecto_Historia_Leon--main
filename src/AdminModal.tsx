import { useEffect, useRef, type ReactNode } from "react";

export function AdminModal({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = `admin-modal-${title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!element.open) element.showModal();
    element.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    return () => {
      if (element.open) element.close();
      previousFocus?.focus();
    };
  }, []);

  return <dialog ref={dialog} className="admin-modal" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onMouseDown={event => { if (event.target === dialog.current) onClose(); }}>
    <button type="button" className="admin-modal-close secondary" aria-label="Cerrar ventana" onClick={onClose}>×</button>
    <div className="admin-modal-heading" id={titleId}>{title}</div>
    {children}
  </dialog>;
}
