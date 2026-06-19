import { ShieldCheck, TriangleAlert } from "lucide-react";

const adminQueues = [
  { label: "Imatges pendents", count: 14 },
  { label: "Comentaris reportats", count: 3 },
  { label: "Verificacions", count: 5 }
];

export default function AdminPage() {
  const signedInUserIsAdmin = false;

  if (!signedInUserIsAdmin) {
    return (
      <main className="spectrum-app">
        <section className="admin-gate panel">
          <TriangleAlert aria-hidden="true" size={30} />
          <h1>Zona d'administració restringida</h1>
          <p>
            Aquesta ruta queda reservada a admins i moderadors. La resta de la web continua disponible segons els
            permisos de cada persona registrada.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="spectrum-app">
      <section className="admin-dashboard">
        <div className="section-intro">
          <ShieldCheck aria-hidden="true" size={32} />
          <h1>Administració</h1>
        </div>
        <div className="admin-queue-grid">
          {adminQueues.map((queue) => (
            <article key={queue.label} className="panel admin-queue-card">
              <p>{queue.label}</p>
              <strong>{queue.count}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
