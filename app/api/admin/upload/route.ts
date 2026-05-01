import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

type Section = "collection" | "new_arrival" | "sale";
const VALID_SECTIONS: Section[] = ["collection", "new_arrival", "sale"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const section = (formData.get("section") as string | null) ?? "collection";

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File size exceeds the 10 MB limit." },
        { status: 400 }
      );
    }

    if (!VALID_SECTIONS.includes(section as Section)) {
      return NextResponse.json({ message: "Invalid section" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: `aviar/${section}`,
      transformation: [
        { width: 800, height: 1000, crop: "fill", quality: "auto", fetch_format: "auto" },
      ],
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
