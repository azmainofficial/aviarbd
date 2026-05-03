import BuyClientPage from "./client-page";

export async function generateStaticParams() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/products");
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
