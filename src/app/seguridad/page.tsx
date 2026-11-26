import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Seguridad y métodos de pago", description: "Cómo protegemos sus pagos y sus datos: Wompi, HTTPS, firmas de integridad y control de acceso." };

const ITEMS = [
  { i: "💳", t: "Pagos procesados por Wompi", d: "Los pagos con tarjeta, PSE y Nequi se procesan en la pasarela Wompi (Bancolombia), certificada PCI DSS. Los datos de su tarjeta se escriben en el checkout de Wompi: nunca pasan por nuestros servidores ni se almacenan en nuestra plataforma." },
  { i: "✍️", t: "Firma de integridad en cada transacción", d: "Cada compra lleva una firma SHA-256 calculada con un secreto que solo conoce el servidor (referencia + valor + moneda). Así nadie puede alterar el precio o la referencia en el navegador." },
  { i: "🔔", t: "Confirmación verificada del pago", d: "El plan solo se activa cuando Wompi confirma la transacción: por el webhook firmado (se valida el checksum del evento) o consultando el API de Wompi. También se verifica que el valor pagado coincida con el del pedido." },
  { i: "🔒", t: "Conexión cifrada HTTPS", d: "Todo el sitio funciona sobre HTTPS con HSTS, y envía cabeceras de seguridad (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)." },
  { i: "🔑", t: "Contraseñas y sesiones protegidas", d: "Las contraseñas se guardan solo como hash bcrypt. La sesión usa una cookie httpOnly y Secure firmada; las cuentas requieren verificación del correo y hay límites contra intentos repetidos." },
  { i: "🗄️", t: "Datos privados y control de acceso", d: "La información se guarda en almacenamiento privado accesible solo desde el servidor. Cada usuario solo puede ver sus propias auditorías, plantillas y pagos." },
  { i: "🛡️", t: "Rastreo responsable", d: "El rastreador bloquea direcciones internas (protección SSRF), respeta robots.txt y hace pausas entre peticiones para no afectar las tiendas analizadas." },
  { i: "⚖️", t: "Derechos del consumidor", d: "Usted tiene derecho de retracto (5 días hábiles) y de reversión del pago en caso de fraude, operación no solicitada o servicio no prestado." },
];

export default function Page() {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold text-slate-900">Seguridad y métodos de pago</h1>
      <p className="mt-3 max-w-3xl text-slate-600">Medios de pago aceptados: <strong>tarjeta de crédito y débito (Visa, Mastercard, American Express), PSE y Nequi</strong>, a través de Wompi. Precios en pesos colombianos con IVA incluido.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {ITEMS.map((x) => (
          <div key={x.t} className="card p-6">
            <span className="text-3xl" aria-hidden="true">{x.i}</span>
            <h2 className="mt-2 font-semibold text-slate-900">{x.t}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{x.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-600">
        Más información: <Link href="/legal/retracto" className="text-brand-600 underline">retracto y reversión del pago</Link> · <Link href="/legal/datos" className="text-brand-600 underline">tratamiento de datos</Link> · <Link href="/pqrs" className="text-brand-600 underline">PQRS</Link>
      </p>
    </div>
  );
}
