
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Cloud, MapPin, Sprout, TrendingUp } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    unit?: string;
    change?: number;
    higherIsBetter?: boolean;
    icon?: React.ReactNode;
}

export const StatCard = ({ title, value, unit, change, higherIsBetter = true, icon }: StatCardProps) => {
    const isPositiveChange = change && change > 0;
    const isNegativeChange = change && change < 0;

    let changeColorClass = "";
    if (change) {
        if ((isPositiveChange && higherIsBetter) || (isNegativeChange && !higherIsBetter)) {
            changeColorClass = "text-green-500";
        } else {
            changeColorClass = "text-red-500";
        }
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    {icon || <TrendingUp className="h-4 w-4" />}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value} {unit && <span className="text-lg text-muted-foreground">{unit}</span>}</div>
                {change !== undefined && (
                     <p className={`text-xs flex items-center ${changeColorClass}`}>
                        {isPositiveChange ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        {change.toFixed(1)}% from last month
                    </p>
                )}
            </CardContent>
        </Card>
    );
};


interface WeatherCardProps {
    weather: {
        location: string;
        temp: number;
        condition: string;
        date: string;
    }
}
export const WeatherCard = ({ weather }: WeatherCardProps) => {
    return (
        <Card className="bg-blue-500 text-white relative overflow-hidden">
            <div className="absolute -top-4 -right-4 h-24 w-24 text-white/20">
                <Cloud className="h-full w-full"/>
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {weather.location}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{weather.temp}°C</div>
                <p className="text-sm">{weather.condition}</p>
                <p className="text-xs mt-2">{weather.date}</p>
                <a href="#" className="text-xs underline mt-1 block hover:text-white/80 transition-colors">See next forecast details</a>
            </CardContent>
        </Card>
    );
};

    