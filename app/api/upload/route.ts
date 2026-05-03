import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Validate type
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type. Use JPEG, PNG, or WebP." }, { status: 422 });
    }

    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large. Max 5 MB." }, { status: 422 });
    }

    // Generate unique filename
    const ext      = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    // Save to Laravel's public/uploads/products/ (same filesystem)
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });
    const filePath  = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return the public URL — served by Laravel at http://localhost:8000/uploads/products/...
    const laravelBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:8000";
    const url = `${laravelBase}/uploads/products/${filename}`;

    return NextResponse.json({ url, filename }, { status: 201 });

  } catch (err) {
    console.error("[upload] Error:", err);
    return NextResponse.json({ message: "Upload failed", error: String(err) }, { status: 500 });
  }
}
