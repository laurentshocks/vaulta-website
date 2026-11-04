import Link from "next/link";

export default function NotFound() {
  return (
    <section>
      <div className="container" style={{ textAlign: "center" }}>
        <h1 className="section-title">404</h1>
        <p className="muted" style={{ marginBottom: 24 }}>Page not found · Page introuvable · Pagina niet gevonden</p>
        <Link href="/" className="btn btn-primary">VAULTA</Link>
      </div>
    </section>
  );
}
