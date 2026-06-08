// app/product/[slug]/page.tsx
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";

import { apiUrl } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(apiUrl(`/products/${encodeURIComponent(slug)}`), { next: { revalidate: 60 } });
    if (res.ok) {
      const product = await res.json();
      const images = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []);
      return {
        title: `${product.name} — AVIAR Premium Collection`,
        description: product.description
          ? String(product.description).slice(0, 160)
          : `Shop ${product.name} at AVIAR. Premium luxury fashion.`,
        openGraph: {
          title: product.name,
          description: product.description ? String(product.description).slice(0, 160) : "",
          images: images.length > 0 ? [{ url: images[0] as string }] : [],
          type: "website",
        },
      };
    }
  } catch {
    // Fallback to generic metadata on DB error
  }
  return {
    title: "Product — AVIAR Premium Collection",
    description: "Shop our curated luxury fashion collection.",
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main>
      <Navbar />
      <div style={{ height: "72px", background: "#0a0a0a" }} />
      <ProductDetail slug={slug} />
      <Footer />
    </main>
  );
}
