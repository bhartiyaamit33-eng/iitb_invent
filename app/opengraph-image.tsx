import { ImageResponse } from "next/og";

export const alt = "INV.ENT · IIT Bombay · 30-31 January 2027";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07111F",
          color: "#EEF2F7",
          padding: "64px 72px",
          fontFamily: "Georgia, Times New Roman, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9FE561" }}>
          IIT Bombay · DSSE
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, letterSpacing: "-0.04em", lineHeight: 1 }}>
            INV.ENT
          </div>
          <div style={{ display: "flex", marginTop: 16, fontSize: 32, color: "#A7B0C3" }}>
            Entrepreneurship Research and Venture Practice Conference
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#A7B0C3" }}>
          <span>30-31 January 2027 · Day Zero 30 Jan</span>
          <span>iitbinvent.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
