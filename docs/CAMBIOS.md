# Registro de cambios frente al Product Backlog

Proyecto: Software Auditor de Cumplimiento del Estatuto del Consumidor (SaaS)
Asignatura: Comercio Electrónico · Universidad de Cartagena · Docente: Heybertt Moreno Díaz
Equipo: Melissa Torres Forero (PO), Daniela Benavides Padilla (SM), Amilcar Soto Romero y Marlon Brandon Mier Gutierrez (Developers)

## 1. Alcance

Se entregan las 18 historias comprometidas para el 1 de diciembre de 2026 (HU-01 a HU-18, 67 puntos). No se recortó ninguna historia del alcance comprometido.

## 2. Cambios de tecnología

| Capa | Backlog (sección 3.3) | Implementado | Justificación |
|---|---|---|---|
| Backend / API | Python + FastAPI (Render) | API de Next.js (Route Handlers y Server Actions) en Vercel | Una sola aplicación y un solo despliegue gratuito, sin el "arranque en frío" del plan gratuito de Render (30-60 s) que incumpliría el criterio de 30 segundos de HU-05. |
| Rastreo web | Playwright + BeautifulSoup | fetch + Cheerio (equivalente de BeautifulSoup en JavaScript) | Playwright no cabe en las funciones de Vercel. Shopify y WooCommerce entregan su HTML renderizado desde el servidor, por lo que no se requiere un navegador para leer los textos legales. |
| Base de datos y autenticación | Supabase (PostgreSQL, Auth, RLS) | Vercel Blob privado + autenticación propia (bcrypt, JWT en cookie httpOnly, verificación de correo, recuperación de contraseña) | Evita la pausa por inactividad del plan gratuito de Supabase y su límite de correos. El control de acceso por propietario reemplaza a RLS: cada usuario solo puede leer sus auditorías y pagos. |
| Documentos | python-docx | librería `docx` (JavaScript) | Mismo resultado (.docx) dentro de la misma aplicación. |
| Pagos | Wompi sandbox | Wompi Web Checkout (sandbox) con firma de integridad, webhook firmado y activación automática del plan; probado con una compra aprobada | Sin cambio de proveedor ni de alcance. |
| Frontend, CI/CD | Next.js + Tailwind, GitHub Actions, Vercel | Sin cambios | — |

## 3. Funcionalidades adelantadas del backlog posterior

- Blog con 3 guías optimizadas para buscadores (base de HU-23).
- Google Analytics 4 con eventos del embudo y medición de campañas UTM (HU-24), y landing para pauta (HU-42).
- Programa de aliados: página y pre-registro de agencias (base de HU-40).
- Boletín de novedades normativas (HU-46).
- Panel de métricas del negocio en /admin (base de HU-39).
- Historial de auditorías e impresión del informe a PDF desde el navegador (base de HU-35 y HU-21).
- Aviso de cookies (HU-30, aplicado al propio sitio).
- Límite de escaneos por IP (base de HU-28).
- 12 patrones de leyendas abusivas (base de HU-29).

## 4. Requisitos de la entrega final

Ver la tabla "Requisitos de la entrega final" en la página /proyecto de la aplicación.
