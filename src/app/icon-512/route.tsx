import { ImageResponse } from "next/og";
import { getBrandMarkElement } from "@/lib/brand-mark";

export const dynamic = "force-static";

const size = 512;

export async function GET() {
  return new ImageResponse(getBrandMarkElement(size), {
    width: size,
    height: size,
  });
}
