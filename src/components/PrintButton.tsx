"use client";
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary !py-2 print:hidden">
      🖨️ Imprimir / guardar PDF
    </button>
  );
}
