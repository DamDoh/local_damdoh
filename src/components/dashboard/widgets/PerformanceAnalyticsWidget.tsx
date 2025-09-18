"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, Clock, Zap, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  unit: string;
}

interface SystemHealth {
  overall: number;
  components: {
    name: string;
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    responseTime: number;
  }[];
}

export function PerformanceAnalyticsWidget() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock performance data - in production this would come from existing performance monitoring
  const mockMetrics: PerformanceMetric[] = [
    {
      name: 'Loan Processing Time',
      value: 2.3,
      target: 3.0,
      trend: 'down',
      status: 'excellent',
      unit: 'days'
    },
    {
      name: 'Document Verification Rate',
      value: 94.2,
      target: 90.0,
      trend: 'up',
      status: 'excellent',
      unit: '%'
    },
    {
      name: 'Customer Satisfaction',
      value: 4.6,
      target: 4.5,
      trend: 'up',
      status: 'good',
      unit: '/5'
    },
    {
      name: 'Portfolio Default Rate',
      value: 2.1,
      target: 3.0,
      trend: 'down',
      status: 'good',
      unit: '%'
    },
    {
      name: 'System Response Time',
      value: 245,
      target: 300,
      trend: 'down',
      status: 'excellent',
      unit: 'ms'
    },
    {
      name: 'API Success Rate',
      value: 99.7,
      target: 99.5,
      trend: 'stable',
      status: 'excellent',
      unit: '%'
    }
  ];

  const mockSystemHealth: SystemHealth = {
    overall: 98.5,
    components: [
      {
        name: 'Loan Processing Engine',
        status: 'healthy',
        uptime: 99.9,
        responseTime: 180
      },
      {
        name: 'Document AI Service',
        status: 'healthy',
        uptime: 99.7,
        responseTime: 250
      },
      {
        name: 'Risk Assessment Module',
        status: 'warning',
        uptime: 98.5,
        responseTime: 320
      },
      {
        name: 'Database Cluster',
        status: 'healthy',
        uptime: 99.9,
        responseTime: 45
      }
    ]
  };

  useEffect(() => {
    setMetrics(mockMetrics);
    setSystemHealth(mockSystemHealth);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComponentStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <BarChart3 className="h-3 w-3 text-gray-500" />;
    }
  };

  const refreshMetrics = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from existing performance monitoring API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Metrics Updated",
        description: "Performance data has been refreshed",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh performance metrics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverallScore = () => {
    if (!metrics.length) return 0;
    const scores = metrics.map(m => {
      const percentage = (m.value / m.target) * 100;
      return Math.min(percentage, 100);
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between text-indigo-800">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Performance Analytics
          </div>
          <Button
            onClick={refreshMetrics}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="h-8 px-2 bg-white hover:bg-indigo-50 border-indigo-200"
          >
            <Zap className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <p className="text-sm text-indigo-600 font-normal">Real-time system performance monitoring</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Performance Score */}
        <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            {calculateOverallScore()}%
          </div>
          <p className="text-sm text-indigo-700 mb-3">Overall Performance Score</p>
          <Progress value={calculateOverallScore()} className="h-2" />
          <p className="text-xs text-indigo-600 mt-2">Target: 95% | Current: Excellent</p>
        </div>

        {/* Key Performance Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-indigo-800">Key Metrics</h4>
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-3">
                {getStatusIcon(metric.status)}
                <div>
                  <p className="text-sm font-medium text-indigo-800">{metric.name}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-indigo-600">
                      {metric.value}{metric.unit} / {metric.target}{metric.unit}
                    </span>
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
                <div className="text-xs text-indigo-600 mt-1">
                  {Math.round((metric.value / metric.target) * 100)}% of target
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Health */}
        {systemHealth && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-indigo-800">System Health</h4>
            <div className="p-3 bg-white rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-indigo-800">Overall Health</span>
                <Badge className="bg-green-100 text-green-800">
                  {systemHealth.overall}% Uptime
                </Badge>
              </div>
              <div className="space-y-2">
                {systemHealth.components.map((component, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-indigo-700">{component.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge className={getComponentStatusColor(component.status)}>
                        {component.status}
                      </Badge>
                      <span className="text-xs text-indigo-600">
                        {component.uptime}% uptime
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="pt-3 border-t border-indigo-200">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-indigo-800">Performance Status</p>
              <p className="text-xs text-indigo-600 mt-1">
                All systems operating within optimal parameters. Loan processing efficiency improved by 15% this month.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}