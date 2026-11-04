"use client";

import { useState, type ReactNode } from "react";

export default function MobileMenu({ children, label }: { children: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className={`nav-links${open ? " open" : ""}`} onClick={() => setOpen(false)}>
        {children}
      </nav>
      <button className="menu-toggle" aria-label={label} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        ☰
      </button>
    </>
  );
}
