# Auditor de Cumplimiento del Estatuto del Consumidor

SaaS RegTech que escanea tiendas virtuales colombianas (Shopify, WooCommerce, Tiendanube y sitios propios) y verifica el cumplimiento de la **Ley 1480 de 2011**, el **Decreto 587 de 2016** y la **Ley 1581 de 2012**. Entrega un semáforo de riesgo, hallazgos con evidencia y plantillas de corrección en Word.

Proyecto académico · Comercio Electrónico · Ingeniería de Sistemas · Universidad de Cartagena.
Equipo: Melissa Torres Forero (PO), Daniela Benavides Padilla (SM), Amilcar Soto Romero y Marlon Brandon Mier Gutierrez (Developers).

## Qué incluye (MVP del 1 de diciembre · HU-01 a HU-18)

| Historia | Funcionalidad | Dónde verla |
|---|---|---|
| HU-01 | CI con GitHub Actions (lint, tipos, pruebas y build) + despliegue continuo en Vercel | `.github/workflows/ci.yml` |
| HU-02 | Arquitectura y modelo de datos | sección *Arquitectura* |
| HU-03 | Matriz normativa de 21 reglas | `/normativa`, `src/lib/audit/rules.ts` |
| HU-05 a HU-07 | Escáner flash gratuito (5 elementos, < 30 s, semáforo) | `/` |
| HU-08 | Lista de espera Beta con contador frente a la meta de 100 | `/#beta` |
| HU-09 | Registro, verificación de correo, inicio de sesión y recuperación de contraseña | `/registro`, `/ingresar`, `/recuperar` |
| HU-10, HU-13 a HU-15 | Auditoría completa: hasta 20 páginas, robots.txt, deber de información, retracto, reversión, 12 leyendas abusivas, Ley 1581 | `/panel/nueva` |
| HU-11 | Página de precios (COP, IVA incluido) | `/precios` |
| HU-12 | Cumplimiento legal propio: razón social, NIT, dirección, PQRS con radicado, términos, política de datos, enlace a la SIC. El propio escáner califica el sitio en **riesgo bajo (100/100)** | pie de página, `/pqrs`, `/legal/*` |
| HU-16 | Panel de resultados: puntaje 0–100, semáforo, hallazgos por norma (Legal Design), filtro por riesgo | `/panel/auditoria/[id]` |
| HU-17 | Tres plantillas Word prellenadas | `/panel/plantillas` |
| HU-18 | Checkout con subtotal, IVA 19 % y total; Wompi Web Checkout (sandbox) con firma de integridad, webhook firmado y activación del plan | `/checkout?plan=basico` |

Adelantos del backlog posterior: blog con 3 guías (HU-23), programa de aliados (HU-40), métricas del embudo en `/admin` (HU-24/HU-39), historial de auditorías e impresión a PDF (HU-35/HU-21), límite de escaneos por IP (HU-28).

## Requisitos de la entrega final

- **Legales y datos:** páginas en `/legal/*`, `/pqrs`, aviso de cookies con consentimiento.
- **Seguridad de pagos:** `/seguridad` (Wompi, firma de integridad, webhook verificado, HTTPS).
- **Multicanalidad:** escáner gratis, lista Beta, blog, boletín, WhatsApp, redes sociales, aliados y landing de anuncios; cada registro guarda su canal (UTM).
- **SEO/SEM:** metadatos, Open Graph, sitemap, robots, schema.org, blog y landing `/escaner-gratis?utm_source=google&utm_medium=cpc&utm_campaign=multas-sic`.
- **Analítica:** Google Analytics 4 (`G-Y1RR7PTG8K`, configurable con `NEXT_PUBLIC_GA_ID`) con eventos del embudo, cargado solo con consentimiento; panel `/admin`.
- **Cambios documentados:** `docs/CAMBIOS.md` y borrador de correo al docente en `docs/CORREO_DOCENTE.md`.

## Cómo probar la demo

1. Abra la página de inicio y escanee una tienda (por ejemplo, cualquier tienda Shopify o WooCommerce).
2. Clic en **Ver informe completo** → cree una cuenta. Si no hay servidor de correo configurado, la app muestra en pantalla el enlace de verificación (*modo demostración*).
3. Ingrese, vaya a **Precios → Elegir plan Básico**, acepte los términos y pague.
   - Se abre el **checkout oficial de Wompi en modo de pruebas (sandbox)**, con tarjeta, PSE, Nequi, DaviPlata, Bancolombia y QR.
   - Tarjeta de prueba aprobada: `4242 4242 4242 4242`; rechazada: `4111 1111 1111 1111`. Cualquier fecha futura, CVC `123`, cualquier nombre y documento, y marque las dos casillas de aceptación.
   - Al terminar, Wompi regresa a la app (`/pago/resultado`) y envía el aviso automático (`/api/wompi/webhook`); el plan queda activo por 12 meses y el pago aparece en **Plan y pagos**.
   - Si se quitan las llaves de Wompi (`WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`), la app usa un simulador sandbox de respaldo con las mismas tarjetas de prueba.
4. En **Nueva auditoría** escriba la URL de la tienda → informe completo con semáforo.
5. En **Empresa y plantillas** complete los datos y descargue los tres .docx.
6. Si su correo está en `ADMIN_EMAILS`, verá **/admin** con el embudo de conversión.

## Arquitectura

- **Next.js 16 (App Router) + Tailwind CSS 4**: frontend y API en una sola aplicación desplegada en Vercel.
- **Motor de auditoría** (`src/lib/audit/`): `crawler.ts` (rastreo con protección SSRF, robots.txt, pausas, límite de 20 páginas, rutas conocidas de Shopify/WooCommerce/Tiendanube), `engine.ts` (parseo con Cheerio, puntaje y semáforo), `rules.ts` (matriz normativa).
- **Almacenamiento**: Vercel Blob en modo **privado** (documentos JSON accesibles solo desde el servidor); en desarrollo, carpeta `.data/`.
- **Autenticación**: contraseñas con hash bcrypt, sesión JWT firmada en cookie `httpOnly` + `Secure`, verificación de correo y tokens de un solo uso. Cada auditoría solo la puede leer su propietario.
- **Pagos**: Wompi Web Checkout en sandbox (firma de integridad SHA-256), confirmación por redirección consultando el API de Wompi y por webhook (`/api/wompi/webhook`, URL de eventos configurada en Wompi) con verificación del checksum y del valor pagado. Probado de punta a punta con una compra aprobada.
- **Documentos**: librería `docx` para generar las plantillas Word.
- Modelo de datos: usuario (con empresa y autorizaciones con fecha), auditoría (con hallazgos), regla, plan, pago, lista de espera, PQRS, aliados.

> Cambio frente al plan inicial: el backend en Python/FastAPI + Playwright y Supabase se reemplazó por API de Next.js + Cheerio y Vercel Blob para poder desplegar todo gratis en Vercel en una sola aplicación. Las tiendas Shopify y WooCommerce entregan su HTML renderizado desde el servidor, por lo que no se requiere un navegador.

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 35 pruebas unitarias del motor de auditoría
npm run lint && npm run typecheck && npm run build
```

Variables de entorno: ver `.env.example`.

## Aviso

Los informes son una herramienta de apoyo preventivo y no reemplazan la asesoría jurídica profesional. Los datos de la empresa del propio sitio (razón social, NIT) son ilustrativos por tratarse de un proyecto académico; se cambian con las variables `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_NIT`, `NEXT_PUBLIC_ADDRESS`, `NEXT_PUBLIC_CONTACT_EMAIL` y `NEXT_PUBLIC_PHONE`.
