
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon,
  LineChart as LineChartIcon, Info, Download, Maximize2
} from 'lucide-react';

interface CostEstimationChartProps {
  data: {
    month: string;
    profit: number;
    cost: number;
    revenue?: number;
    expenses?: number;
  }[];
  title?: string;
  showControls?: boolean;
}

type ChartType = 'line' | 'area' | 'bar' | 'pie';

const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'];

export const CostEstimationChart = ({
  data,
  title = "Cost Estimation & Profit Analysis",
  showControls = true
}: CostEstimationChartProps) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedMetric, setSelectedMetric] = useState<'profit' | 'cost' | 'revenue' | 'all'>('all');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate derived metrics
  const enhancedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      netIncome: (item.profit || 0) - (item.cost || 0),
      profitMargin: item.cost ? ((item.profit || 0) / item.cost) * 100 : 0,
      roi: item.cost && item.profit ? (((item.profit || 0) - item.cost) / item.cost) * 100 : 0
    }));
  }, [data]);

  // Filter data based on selected metric
  const filteredData = useMemo(() => {
    if (selectedMetric === 'all') return enhancedData;
    return enhancedData.map(item => ({
      month: item.month,
      [selectedMetric]: item[selectedMetric as keyof typeof item] || 0
    }));
  }, [enhancedData, selectedMetric]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalProfit = enhancedData.reduce((sum, item) => sum + (item.profit || 0), 0);
    const totalCost = enhancedData.reduce((sum, item) => sum + (item.cost || 0), 0);
    const avgProfitMargin = enhancedData.reduce((sum, item) => sum + item.profitMargin, 0) / enhancedData.length;
    const bestMonth = enhancedData.reduce((best, current) =>
      (current.netIncome || 0) > (best.netIncome || 0) ? current : best
    );

    return {
      totalProfit,
      totalCost,
      netIncome: totalProfit - totalCost,
      avgProfitMargin,
      bestMonth: bestMonth.month,
      trend: enhancedData.length > 1 ?
        (enhancedData[enhancedData.length - 1].netIncome || 0) > (enhancedData[0].netIncome || 0) ? 'up' : 'down' : 'stable'
    };
  }, [enhancedData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.name.includes('Margin') || entry.name.includes('ROI') ?
                  `${entry.value.toFixed(1)}%` :
                  `$${entry.value.toLocaleString()}`
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Pie chart data for cost breakdown
  const pieData = useMemo(() => {
    const latestData = enhancedData[enhancedData.length - 1];
    return [
      { name: 'Profit', value: latestData?.profit || 0, color: '#10B981' },
      { name: 'Cost', value: latestData?.cost || 0, color: '#EF4444' }
    ].filter(item => item.value > 0);
  }, [enhancedData]);

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{fontSize: 12}} />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetric === 'all' ? (
              <>
                <Area type="monotone" dataKey="profit" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Profit" />
                <Area type="monotone" dataKey="cost" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Cost" />
              </>
            ) : (
              <Area type="monotone" dataKey={selectedMetric} stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name={selectedMetric} />
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{fontSize: 12}} />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetric === 'all' ? (
              <>
                <Bar dataKey="profit" fill="#10B981" name="Profit" />
                <Bar dataKey="cost" fill="#EF4444" name="Cost" />
              </>
            ) : (
              <Bar dataKey={selectedMetric} fill="#3B82F6" name={selectedMetric} />
            )}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{fontSize: 12}} />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetric === 'all' ? (
              <>
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Profit" />
                <Line type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Cost" />
                <Line type="monotone" dataKey="netIncome" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Net Income" />
              </>
            ) : (
              <Line type="monotone" dataKey={selectedMetric} stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name={selectedMetric} />
            )}
          </LineChart>
        );
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center text-blue-800">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              {title}
            </CardTitle>
            <CardDescription className="text-blue-600">
              Interactive profit & cost analysis with drill-down capabilities
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setShowDetails(!showDetails)}>
              <Info className="h-4 w-4 mr-1" />
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-green-600">
              ${summaryStats.totalProfit.toLocaleString()}
            </div>
            <div className="text-xs text-blue-700">Total Profit</div>
            <div className="flex items-center justify-center mt-1">
              {summaryStats.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : summaryStats.trend === 'down' ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-red-600">
              ${summaryStats.totalCost.toLocaleString()}
            </div>
            <div className="text-xs text-blue-700">Total Cost</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">
              ${summaryStats.netIncome.toLocaleString()}
            </div>
            <div className="text-xs text-blue-700">Net Income</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-purple-600">
              {summaryStats.avgProfitMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-blue-700">Avg Margin</div>
          </div>
        </div>

        {/* Chart Controls */}
        {showControls && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">Chart Type:</span>
              <div className="flex gap-1">
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className="h-8 px-2"
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'area' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('area')}
                  className="h-8 px-2"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="h-8 px-2"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                  className="h-8 px-2"
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">Metric:</span>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="text-sm border border-blue-200 rounded px-2 py-1 bg-white"
              >
                <option value="all">All Metrics</option>
                <option value="profit">Profit Only</option>
                <option value="cost">Cost Only</option>
                <option value="netIncome">Net Income</option>
              </select>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-[300px] bg-white rounded-lg border border-blue-200 p-4">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Detailed Insights */}
        {showDetails && (
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">Key Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Badge className="bg-green-100 text-green-800 mb-2">Best Performer</Badge>
                <p className="text-gray-700">{summaryStats.bestMonth} had the highest net income</p>
              </div>
              <div>
                <Badge className="bg-blue-100 text-blue-800 mb-2">Trend Analysis</Badge>
                <p className="text-gray-700">
                  {summaryStats.trend === 'up' ? 'Upward trend' :
                   summaryStats.trend === 'down' ? 'Downward trend' : 'Stable performance'}
                  in net income over the period
                </p>
              </div>
              <div>
                <Badge className="bg-purple-100 text-purple-800 mb-2">Efficiency</Badge>
                <p className="text-gray-700">
                  Average profit margin of {summaryStats.avgProfitMargin.toFixed(1)}%
                </p>
              </div>
              <div>
                <Badge className="bg-orange-100 text-orange-800 mb-2">Recommendation</Badge>
                <p className="text-gray-700">
                  {summaryStats.netIncome > 0 ?
                    'Strong financial performance - consider expansion' :
                    'Focus on cost optimization to improve profitability'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
