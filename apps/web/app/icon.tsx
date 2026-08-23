import { ImageResponse } from "next/og";
import { brandColor } from "@/lib/brand-color";
import { PRODUCT_NAME } from "@/lib/product";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const letter = (PRODUCT_NAME.trim()[0] ?? "S").toUpperCase();
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
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        {letter}
      </div>
    ),
    size,
  );
}
