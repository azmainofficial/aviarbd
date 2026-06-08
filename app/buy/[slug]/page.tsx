import BuyClientPage from "./client-page";
import { apiUrl } from "@/lib/api";

export async function generateStaticParams() {
  try {
    const res = await fetch(apiUrl("/products"));
    const data = await res.json();
    const params = Array.isArray(data) ? data.map((p: any) => ({ slug: String(p.slug || "dummy") })) : [];
    return params.length > 0 ? params : [{ slug: "dummy" }];
  } catch (e) {
    return [{ slug: "dummy" }];
  }
}

export default function Page({ params }: { params: any }) {
  return <BuyClientPage params={params} />;
}
