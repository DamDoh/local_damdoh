
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#34D399', '#E5E7EB']; // Green for covered, Gray for free

interface LandOverviewChartProps {
  data: {
    totalArea: number;
    covered: number;
    free: number;
  };
}

export const LandOverviewChart = ({ data }: LandOverviewChartProps) => {
  const chartData = [
    { name: 'Covered Land', value: data.covered },
    { name: 'Free Land', value: data.free },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Land Overview</CardTitle>
        <CardDescription>Total: {data.totalArea.toLocaleString()} acres</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Legend iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

    