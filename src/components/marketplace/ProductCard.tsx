
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// This component was previously bugged and contained incorrect code.
// It is now a proper, simple placeholder component.
// The main display logic for marketplace items is now in ItemCard.tsx.

export const ProductCard = ({ product }: { product: any }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{product.name || "Product Name"}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{product.description || "Product description."}</p>
            </CardContent>
        </Card>
    )
}
