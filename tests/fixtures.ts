export const COMPLIANT_HOME = `<!doctype html><html><head><title>Tienda Ejemplo</title></head><body>
<header><a href="/productos">Productos</a></header>
<main><h1>Camisetas</h1><p>Camiseta básica $59.900 IVA incluido</p>
<p>Envíos a todo el país. Costo de envío desde $9.900, envío gratis por compras superiores a $150.000.</p></main>
<footer>
 <p>Tienda Ejemplo S.A.S. · NIT 901.234.567-8 · Calle 30 # 20-15, Cartagena</p>
 <p>Contacto: <a href="mailto:hola@tiendaejemplo.co">hola@tiendaejemplo.co</a> · Tel. 300 123 4567</p>
 <a href="/terminos-y-condiciones">Términos y condiciones</a>
 <a href="/politica-de-tratamiento-de-datos">Política de tratamiento de datos personales</a>
 <a href="/aviso-de-privacidad">Aviso de privacidad</a>
 <a href="/pqrs">PQRS</a>
 <a href="https://www.sic.gov.co">Superintendencia de Industria y Comercio</a>
</footer>
<form action="/newsletter"><input type="email" name="email" placeholder="Correo">
<label><input type="checkbox" name="autorizacion"> Autorizo el tratamiento de mis datos personales</label><button>Enviar</button></form>
</body></html>`;

export const COMPLIANT_POLICIES = `<html><body><h1>Política de retracto, devoluciones y garantía</h1>
<p>El consumidor puede ejercer el derecho de retracto dentro de los cinco (5) días hábiles siguientes a la entrega. El dinero se devolverá en un plazo máximo de treinta (30) días calendario.</p>
<p>Reversión del pago: puede solicitarla dentro de los cinco (5) días hábiles siguientes a la fecha en que tuvo noticia de la operación fraudulenta.</p>
<p>Todos los productos tienen garantía legal.</p>
<h2>Derechos del titular</h2><p>Usted puede conocer, actualizar y rectificar sus datos.</p>
</body></html>`;

export const BAD_HOME = `<html><head><title>Mala Tienda</title></head><body>
<h1>Ofertas</h1><p>Zapatos $120.000</p>
<p>IMPORTANTE: No se devuelve dinero. No hay cambios ni devoluciones. Todas las ventas son finales.</p>
<form action="/registro"><input type="text" name="nombre"><input type="email" name="email">
<label><input type="checkbox" name="newsletter" checked> Quiero recibir el boletín</label><button>Registrarme</button></form>
<footer><a href="https://instagram.com/malatienda">Instagram</a></footer>
</body></html>`;
