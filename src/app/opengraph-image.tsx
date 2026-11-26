import { ImageResponse } from "next/og";

export const alt = "Auditor Legal · ¿Su tienda virtual cumple el Estatuto del Consumidor?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 70, background: "linear-gradient(135deg,#172554 0%,#1e3a8a 55%,#1d4ed8 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "white", display: "flex", alignItems: "center", justifyContent: "center", }}>
            <svg width="40" height="40" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          Auditor Legal
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.1 }}>¿Su tienda virtual cumple el Estatuto del Consumidor?</div>
          <div style={{ fontSize: 32, marginTop: 24, color: "#bfdbfe" }}>Escáner gratis en 30 segundos · Ley 1480 · Decreto 587 · Ley 1581</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["#dc2626", "#f59e0b", "#16a34a"].map((c) => (
            <div key={c} style={{ width: 44, height: 44, borderRadius: 22, background: c }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
