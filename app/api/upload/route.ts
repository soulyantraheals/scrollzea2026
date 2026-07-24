import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Simple local image upload (for development / fallback)
// In production, Uploadthing handles image uploads
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const urls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      urls.push(dataUrl);
    }

    return NextResponse.json({ urls });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
