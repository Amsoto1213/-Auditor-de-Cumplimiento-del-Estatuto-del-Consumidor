import Link from "next/link";
import { FlashScanner } from "@/components/FlashScanner";
import { WaitlistForm } from "@/components/WaitlistForm";
import { countDocs } from "@/lib/db";
import { PLANS, SMMLV_2026, cop } from "@/lib/site";
import { RULES } from "@/lib/audit/rules";

export const dynamic = "force-dynamic";

const maxFine = 2000 * SMMLV_2026;
const basic = PLANS.find((p) => p.id === "basico")!.priceYear;

const FAQ = [
  {
    q: "¿Qué revisa el escáner gratuito?",
    a: "Cinco elementos básicos: aviso de privacidad o política de datos, datos del vendedor (razón social y NIT), canal de PQRS, referencia al derecho de retracto y enlace a la Superintendencia de Industria y Comercio.",
  },
  {
    q: "¿Qué incluye el informe completo?",
    a: `La auditoría completa rastrea hasta 20 páginas de su tienda (inicio, productos, carrito, políticas y contacto) y evalúa ${RULES.length} reglas de la Ley 1480 de 2011, el Decreto 587 de 2016 y la Ley 1581 de 2012. Cada hallazgo trae la norma, una explicación sencilla, la evidencia encontrada y una recomendación.`,
  },
  {
    q: "¿Funciona con mi plataforma?",
    a: "Sí. Está probado con Shopify y WooCommerce, y funciona con Tiendanube y la mayoría de sitios propios. Respetamos el archivo robots.txt de su sitio.",
  },
  {
    q: "¿Reemplaza a un abogado?",
    a: "No. Es una herramienta de diagnóstico preventivo que le muestra qué corregir y le entrega plantillas para hacerlo. Para casos complejos recomendamos asesoría jurídica profesional.",
  },
  {
    q: "¿Cómo pago?",
    a: "Con tarjeta, PSE o Nequi a través de Wompi. Los precios son anuales, en pesos colombianos y con IVA incluido. Tiene derecho de retracto según la Ley 1480.",
  },
];

export default async function Home() {
  const waitlist = await countDocs("waitlist").catch(() => 0);
  return (
    <>
      {/* HERO + ESCÁNER (HU-05) */}
      <section id="escaner" className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,#60a5fa_0,transparent_40%),radial-gradient(circle_at_80%_0,#22c55e_0,transparent_35%)]" />
        <div className="container-page relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
              RegTech para mipymes colombianas · Ley 1480 · Decreto 587 · Ley 1581
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              ¿Su tienda virtual cumple el Estatuto del Consumidor?
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">
              Escanéela gratis en 30 segundos. Detectamos los incumplimientos que más sancionan la SIC y le entregamos un semáforo de riesgo y plantillas para corregirlos, sin contratar un abogado para el diagnóstico inicial.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-blue-100 sm:grid-cols-2">
              <li>✓ Sin registro ni tarjeta</li>
              <li>✓ Shopify, WooCommerce y Tiendanube</li>
              <li>✓ Resultado fácil de entender</li>
              <li>✓ Plantillas en Word listas para publicar</li>
            </ul>
          </div>
          <div className="text-slate-900">
            <FlashScanner />
          </div>
        </div>
      </section>

      {/* CIFRAS */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid gap-6 py-10 text-center sm:grid-cols-3">
          <div>
            <p className="text-4xl font-extrabold text-brand-800">78 %</p>
            <p className="mt-1 text-sm text-slate-600">de las mipymes con tienda virtual omite datos obligatorios del vendedor o del precio final<sup>1</sup></p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-red-600">2.000 SMMLV</p>
            <p className="mt-1 text-sm text-slate-600">multa máxima de la SIC por infracción al Estatuto del Consumidor o a la Ley 1581: {cop(maxFine)}</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-green-600">30 s</p>
            <p className="mt-1 text-sm text-slate-600">para conocer su nivel de riesgo con nuestro escáner gratuito</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="container-page py-16">
        <h2 className="text-center text-3xl font-bold text-slate-900">Cómo funciona</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">Del diagnóstico gratuito a la tienda en regla, en tres pasos.</p>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", t: "Escanee gratis", d: "Escriba la URL de su tienda. En 30 segundos verá su semáforo de riesgo y los elementos básicos que le faltan." },
            { n: "2", t: "Reciba el informe completo", d: `Rastreamos hasta 20 páginas y evaluamos ${RULES.length} reglas. Cada hallazgo con norma, evidencia y explicación en lenguaje sencillo.` },
            { n: "3", t: "Corrija con plantillas", d: "Descargue en Word la política de datos, los términos y condiciones y la política de retracto, prellenados con los datos de su empresa." },
          ].map((s) => (
            <li key={s.n} className="card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">{s.n}</span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{s.t}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* QUÉ REVISAMOS */}
      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold text-slate-900">Qué revisamos en su tienda</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: "📋", t: "Deber de información", l: "Ley 1480, art. 50", d: "Razón social, NIT, dirección, teléfono y correo, precio con IVA, costos de envío, términos, PQRS y enlace a la SIC." },
              { i: "↩️", t: "Retracto y reversión", l: "Ley 1480, arts. 47 y 51 · Decreto 587", d: "Derecho de retracto de 5 días hábiles, reembolso en 30 días y procedimiento de reversión del pago." },
              { i: "🚫", t: "Cláusulas abusivas", l: "Ley 1480, arts. 42 y 43", d: "Leyendas como «no se devuelve dinero» o «no hay cambios ni devoluciones», que no tienen validez legal." },
              { i: "🔒", t: "Protección de datos", l: "Ley 1581 de 2012", d: "Política de tratamiento, aviso de privacidad, autorización en formularios y casillas premarcadas." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-slate-200 p-6">
                <span className="text-3xl" aria-hidden="true">{c.i}</span>
                <h3 className="mt-3 font-semibold text-slate-900">{c.t}</h3>
                <p className="text-xs font-medium text-brand-600">{c.l}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{c.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link href="/normativa" className="font-semibold text-brand-600 hover:underline">Ver la matriz normativa completa →</Link>
          </p>
        </div>
      </section>

      {/* COMPARATIVA Y AHORRO (Ventajas competitivas 7.1 y 7.2) */}
      <section className="container-page py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Prevenir cuesta mucho menos que una multa</h2>
            <p className="mt-4 leading-7 text-slate-600">
              La mayoría de las tiendas que incumplen la ley lo hacen por desconocimiento, no por mala fe. Pero la SIC no distingue: una sola sanción puede comprometer la continuidad de su negocio.
            </p>
            <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">
              <p className="text-sm text-slate-300">Multa máxima (2.000 SMMLV 2026)</p>
              <p className="text-3xl font-bold text-red-400">{cop(maxFine)}</p>
              <p className="mt-4 text-sm text-slate-300">Plan Básico anual, IVA incluido</p>
              <p className="text-3xl font-bold text-green-400">{cop(basic)}</p>
              <p className="mt-4 border-t border-slate-700 pt-4 text-sm">
                Una sola multa máxima equivale a <strong className="text-white">{Math.floor(maxFine / basic).toLocaleString("es-CO")} años</strong> de suscripción.
              </p>
            </div>
          </div>
          <div className="card relative overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="p-4" />
                  <th className="p-4 font-semibold text-slate-500">Consultoría tradicional</th>
                  <th className="p-4 font-semibold text-slate-500">Documentos estáticos</th>
                  <th className="p-4 font-semibold text-brand-700">Auditor Legal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Tiempo del diagnóstico", "Semanas", "No aplica", "30 segundos"],
                  ["Revisa su tienda real", "Sí", "No", "Sí, automáticamente"],
                  ["Lenguaje sencillo", "Rara vez", "No", "Semáforo y Legal Design"],
                  ["Plantillas con sus datos", "Con costo adicional", "Genéricas", "Incluidas"],
                  ["Costo", "Alto", "Bajo", "Desde $0"],
                ].map((r) => (
                  <tr key={r[0]}>
                    <th className="p-4 text-left font-medium text-slate-700">{r[0]}</th>
                    <td className="p-4 text-slate-500">{r[1]}</td>
                    <td className="p-4 text-slate-500">{r[2]}</td>
                    <td className="p-4 font-semibold text-slate-900">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section className="bg-white py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold text-slate-900">Planes desde $0</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">Empiece gratis con el escáner flash. Active el informe completo y las plantillas cuando lo necesite.</p>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.id} className={`rounded-2xl border p-6 ${p.highlight ? "border-brand-600 ring-2 ring-brand-100" : "border-slate-200"}`}>
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{p.priceYear ? cop(p.priceYear) : "Gratis"}</p>
                <p className="text-xs text-slate-500">{p.priceYear ? "al año, IVA incluido" : "para siempre"}</p>
              </div>
            ))}
          </div>
          <Link href="/precios" className="btn-primary mt-8">Comparar planes</Link>
        </div>
      </section>

      {/* LISTA DE ESPERA BETA (HU-08) */}
      <section id="beta" className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Programa Beta</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Pruebe el software antes del lanzamiento oficial</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Buscamos 100 mipymes que vendan en línea para probar la auditoría completa sin costo durante la versión Beta y ayudarnos a mejorarla. Los inscritos reciben acompañamiento para corregir su tienda.
            </p>
          </div>
          <WaitlistForm initialCount={waitlist} />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="container-page max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">Preguntas frecuentes</h2>
          <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900">
                  {f.q}
                  <span className="ml-4 text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">
            <sup>1</sup> Gómez, M. y Rodríguez, C. (2021). Análisis del cumplimiento del deber de información en las tiendas virtuales de las mipymes en Colombia. Vniversitas, Universidad Javeriana.
          </p>
        </div>
      </section>
    </>
  );
}
