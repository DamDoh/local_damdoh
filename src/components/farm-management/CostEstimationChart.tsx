
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CostEstimationChartProps {
  data: {
    month: string;
    profit: number;
    cost: number;
  }[];
}

export const CostEstimationChart = ({ data }: CostEstimationChartProps) => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Cost Estimation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} unit="%" />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="profit" name="Estimated Profit" stroke="#10B981" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="cost" name="Estimated Cost" stroke="#EF4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
