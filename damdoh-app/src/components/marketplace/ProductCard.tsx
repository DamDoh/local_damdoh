
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export const ProductCard = ({ product }: { product: any }) => {
    const { t } = useTranslation('common');
    return (
        <Card>
            <CardHeader>
                <CardTitle>{product.name || t('productCard.placeholderName')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{product.description || t('productCard.placeholderDescription')}</p>
            </CardContent>
        </Card>
    )
}
