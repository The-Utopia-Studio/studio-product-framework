import { ImageResponse } from "next/og";
import { brandColor } from "@/lib/brand-color";
import { PRODUCT_NAME } from "@/lib/product";

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
          alignItems: "center",
          justifyContent: "center",
          background: brandColor(),
          color: "#fff",
          fontSize: 72,
          fontWeight: 700,
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        {PRODUCT_NAME}
      </div>
    ),
    size,
  );
}
