"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";

function ProductContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get("slug") || "";

    if (!slug) {
        return (
            <div style={{ padding: "100px", textAlign: "center", color: "#8a8680" }}>
                <p>No product specified.</p>
            </div>
        );
    }

    return <ProductDetail slug={slug} />;
}

export default function DynamicProductPage() {
    return (
        <main>
            <Navbar />
            <div style={{ height: "72px", background: "#0a0a0a" }} />
            <Suspense fallback={
                <div style={{ padding: "100px", textAlign: "center" }}>
                    <div className="skeleton" style={{ height: "400px", width: "100%", maxWidth: "800px", margin: "0 auto" }} />
                </div>
            }>
                <ProductContent />
            </Suspense>
            <Footer />
        </main>
    );
}
