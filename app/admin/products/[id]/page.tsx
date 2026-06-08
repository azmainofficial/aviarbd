import EditProductClient from "./client-page";

import { apiUrl } from "@/lib/api";

export async function generateStaticParams() {
  try {
    const res = await fetch(apiUrl("/products"));
    const data = await res.json();
    const params = Array.isArray(data) ? data.map((p: any) => ({ id: String(p._id || p.id || "") })) : [];
    return params.length > 0 ? params : [{ id: "dummy" }];
  } catch (e) {
    return [{ id: "dummy" }];
  }
}

export default function Page({ params }: { params: any }) {
  return <EditProductClient />;
}
