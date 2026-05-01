async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateAdminToken(): Promise<string> {
  const secret = process.env.ADMIN_SECRET || "fallback-secret-change-in-production";
  return hmacHex(secret, "authenticated");
}

export async function verifyAdminCookie(cookieValue: string): Promise<boolean> {
  const expected = await generateAdminToken();
  return cookieValue === expected;
}
