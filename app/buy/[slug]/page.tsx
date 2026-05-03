import BuyClientPage from "./client-page";

export async function generateStaticParams() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/products");
    const data = await res.json();
    return data.data.map((p: any) => ({ slug: p.slug }));
  } catch (e) {
    return [];
  }
}

export default function Page({ params }: { params: any }) {
  return <BuyClientPage params={params} />;
}
