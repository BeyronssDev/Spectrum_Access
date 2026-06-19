import { ShieldCheck, TriangleAlert } from "lucide-react";
import { adminQueues } from "../lib/mock-data";

export default function AdminPage() {
  const signedInUserIsAdmin = false;

  if (!signedInUserIsAdmin) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-4 py-8 text-[#17211b]">
        <section className="mx-auto max-w-2xl rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-[#f5dfc1] text-[#9a5c18]">
            <TriangleAlert aria-hidden="true" size={24} />
          </div>
          <h1 className="text-2xl font-semibold">Zona d'administració restringida</h1>
          <p className="mt-3 text-sm leading-6 text-[#66736b]">
            Aquesta ruta queda reservada a admins i moderadors. La resta de la web continua disponible per a persones registrades i usuàries de la plataforma.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-8 text-[#17211b]">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck aria-hidden="true" className="text-[#2f6f73]" />
          <h1 className="text-3xl font-semibold">Administració</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {adminQueues.map((queue) => (
            <article key={queue.label} className="rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-5">
              <p className="text-sm text-[#66736b]">{queue.label}</p>
              <p className="mt-2 text-3xl font-semibold">{queue.count}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
