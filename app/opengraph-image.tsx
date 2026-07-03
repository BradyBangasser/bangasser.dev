import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#090c11",
          backgroundImage:
            "radial-gradient(ellipse 60% 60% at 10% 0%, rgba(47,139,255,0.20), transparent)",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 22,
            color: "#2f8bff",
            marginBottom: 24,
          }}
        >
          {"// " + siteConfig.role}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#e8edf3",
            marginBottom: 20,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#93a1b0",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    size
  );
}
