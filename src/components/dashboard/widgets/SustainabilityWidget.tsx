/**
 * Sustainability Widget - Advanced ESG tracking and environmental impact measurement
 * Displays carbon footprint, ESG metrics, sustainability goals, and environmental impact reporting
 * Single Responsibility: Sustainability visualization and environmental impact tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Leaf, TrendingUp, TrendingDown, Target, Award,
  BarChart3, RefreshCw, CheckCircle, AlertTriangle,
  Zap, Droplets, Recycle, Users, Shield, Globe
} from 'lucide-react';
import { SustainabilityService, CarbonFootprint, ESGMetrics, SustainabilityGoal } from "@/services/dashboard/SustainabilityService";
import { useAuth } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

interface SustainabilityWidgetProps {
  defaultTab?: 'carbon' | 'esg' | 'goals' | 'impact';
  compact?: boolean;
}

export const SustainabilityWidget: React.FC<SustainabilityWidgetProps> = ({
  defaultTab = 'carbon',
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [carbonFootprint, setCarbonFootprint] = useState<CarbonFootprint | null>(null);
  const [esgMetrics, setEsgMetrics] = useState<ESGMetrics | null>(null);
  const [sustainabilityGoals, setSustainabilityGoals] = useState<SustainabilityGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const sustainabilityService = SustainabilityService.getInstance();

  const loadData = async (showRefreshIndicator = false) => {
    if (!user?.id) return;

    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [
        carbonData,
        esgData,
        goalsData
      ] = await Promise.all([
        sustainabilityService.calculateCarbonFootprint(user.id),
        sustainabilityService.calculateESGMetrics(user.id),
        sustainabilityService.getSustainabilityGoals(user.id)
      ]);

      setCarbonFootprint(carbonData);
      setEsgMetrics(esgData);
      setSustainabilityGoals(goalsData);
    } catch (error) {
      console.error('Error loading sustainability data:', error);
      toast({
        title: "Error",
        description: "Failed to load sustainability data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const getESGRatingColor = (rating: string) => {
    switch (rating) {
      case 'AAA': return 'bg-green-100 text-green-800';
      case 'AA': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-blue-100 text-blue-800';
      case 'BBB': return 'bg-yellow-100 text-yellow-800';
      case 'BB': return 'bg-orange-100 text-orange-800';
      case 'B': return 'bg-red-100 text-red-800';
      case 'CCC': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-green-800">
            <Leaf className="h-5 w-5 mr-2 text-green-600 animate-pulse" />
            Sustainability & ESG
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    const esgScore = esgMetrics?.overall.total || 0;
    const carbonScore = carbonFootprint?.netEmissions || 0;

    return (
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <Leaf className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-green-900">
            ESG: {esgScore}/100 • Carbon: {formatNumber(carbonScore)} kg
          </div>
          <div className="text-xs text-green-700">
            {sustainabilityGoals.length} goals • {sustainabilityGoals.filter(g => g.status === 'completed').length} completed
          </div>
        </div>
        <Award className="h-4 w-4 text-green-600" />
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-green-800">
            <Leaf className="h-5 w-5 mr-2 text-green-600" />
            Sustainability & ESG
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-green-600">
          Environmental impact, ESG metrics, and sustainability goals
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="carbon" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">Carbon</span>
            </TabsTrigger>
            <TabsTrigger value="esg" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span className="hidden sm:inline">ESG</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="impact" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">Impact</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="carbon" className="space-y-4">
            {carbonFootprint ? (
              <>
                {/* Carbon Overview */}
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Carbon Footprint</h4>
                    <Badge className={carbonFootprint.reduction.progress > 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {carbonFootprint.reduction.progress}% reduction target
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {formatNumber(carbonFootprint.totalEmissions)}
                      </div>
                      <div className="text-sm text-gray-600">Total Emissions (kg CO2e)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(carbonFootprint.netEmissions)}
                      </div>
                      <div className="text-sm text-gray-600">Net Emissions (kg CO2e)</div>
                    </div>
                  </div>

                  {/* Emission Breakdown */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-900">Emission Sources</h5>
                    {Object.entries(carbonFootprint.breakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-medium">{formatNumber(value)} kg</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benchmarks */}
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Benchmarks</h4>
                  <div className="space-y-3">
                    {carbonFootprint.benchmarks.map((benchmark, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium capitalize">
                            {benchmark.category}
                          </div>
                          <div className="text-xs text-gray-600">
                            Industry avg: {formatNumber(benchmark.industryAverage)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.round(benchmark.percentile)}th percentile
                          </div>
                          <div className="text-xs text-gray-600">
                            Your: {formatNumber(benchmark.userValue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-green-300 mx-auto mb-3" />
                <p className="text-green-600 text-sm">Carbon footprint data not available</p>
                <p className="text-green-500 text-xs mt-1">Complete more farm operations to calculate emissions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="esg" className="space-y-4">
            {esgMetrics ? (
              <>
                {/* ESG Overview */}
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">ESG Score</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(esgMetrics.overall.trend)}
                      <Badge className={getESGRatingColor(esgMetrics.overall.rating)}>
                        {esgMetrics.overall.rating} Rating
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {esgMetrics.overall.environmental}
                      </div>
                      <div className="text-sm text-gray-600">Environmental</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {esgMetrics.overall.social}
                      </div>
                      <div className="text-sm text-gray-600">Social</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {esgMetrics.overall.governance}
                      </div>
                      <div className="text-sm text-gray-600">Governance</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall ESG Score</span>
                      <span className="font-bold">{esgMetrics.overall.total}/100</span>
                    </div>
                    <Progress value={esgMetrics.overall.total} className="h-2" />
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Droplets className="h-4 w-4 mr-2 text-blue-600" />
                      Environmental
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Water Usage</span>
                        <span>{formatNumber(esgMetrics.environmental.waterUsage)}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energy Consumption</span>
                        <span>{formatNumber(esgMetrics.environmental.energyConsumption)}kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Renewable Energy</span>
                        <span>{esgMetrics.environmental.renewableEnergy}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-600" />
                      Social
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Employee Satisfaction</span>
                        <span>{esgMetrics.social.employeeSatisfaction}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Community Engagement</span>
                        <span>{esgMetrics.social.communityEngagement}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fair Trade Score</span>
                        <span>{esgMetrics.social.fairTrade}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-green-300 mx-auto mb-3" />
                <p className="text-green-600 text-sm">ESG metrics not available</p>
                <p className="text-green-500 text-xs mt-1">Complete sustainability assessments to view ESG scores</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            {sustainabilityGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-green-300 mx-auto mb-3" />
                <p className="text-green-600 text-sm">No sustainability goals set</p>
                <p className="text-green-500 text-xs mt-1">Create goals to track your sustainability progress</p>
                <Button className="mt-3" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Set Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sustainabilityGoals.map((goal) => (
                  <div key={goal.id} className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{goal.title}</h4>
                          <Badge className={getGoalStatusColor(goal.status)}>
                            {goal.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{goal.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {goal.target.baseline} → {goal.target.target} {goal.target.unit}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {goal.progress.percentage}% complete
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Progress</span>
                        <span>{goal.progress.percentage}%</span>
                      </div>
                      <Progress value={goal.progress.percentage} className="h-2" />
                    </div>

                    {/* Milestones */}
                    {goal.progress.milestones.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-900 mb-2">Upcoming Milestones</div>
                        <div className="space-y-1">
                          {goal.progress.milestones.slice(0, 2).map((milestone, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{milestone.title}</span>
                              <Badge className={milestone.status === 'achieved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {milestone.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-green-300 mx-auto mb-3" />
              <p className="text-green-600 text-sm">Impact reporting</p>
              <p className="text-green-500 text-xs mt-1">Generate comprehensive sustainability reports</p>
              <Button className="mt-3" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>

            {/* Quick Impact Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-green-200 text-center">
                <Recycle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">
                  {carbonFootprint ? formatNumber(carbonFootprint.offset) : '0'}
                </div>
                <div className="text-sm text-gray-600">Carbon Offset (kg)</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-green-200 text-center">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">
                  {esgMetrics?.overall.total || 0}
                </div>
                <div className="text-sm text-gray-600">ESG Score</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};