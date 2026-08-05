import { ImageResponse } from "next/og";
import { getBrandMarkElement } from "@/lib/brand-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(getBrandMarkElement(size.width), { ...size });
}
