"use client";
import { startTransition } from "react";

/**
 * Formulario que conserva lo escrito cuando la acción devuelve un error
 * (React 19 reinicia los formularios con `action` tras cada envío).
 */
export function ActionForm({ action, children, className }: { action: (fd: FormData) => void; children: React.ReactNode; className?: string }) {
  return (
    <form
      className={className}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      {children}
    </form>
  );
}
