"use client";

import { Link } from '@/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ArrowRight,
  Info,
  TrendingUp,
  MoreHorizontal,
  RefreshCw,
  AlertTriangle,
  Ticket,
  Users,
  MapPin,
  Calendar,
  Shield,
  FileText,
  Bell,
  BarChart3,
  Target
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";

interface NetworkSuggestion {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  reason?: string;
  location?: string;
  creditScore?: number;
}

interface RiskAlert {
  id: string;
  type: 'weather' | 'market' | 'regulatory' | 'portfolio';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: boolean;
  timestamp: string;
}

interface FieldVisit {
  id: string;
  farmerName: string;
  location: string;
  scheduledDate: string;
  purpose: string;
  status: 'scheduled' | 'overdue' | 'completed';
}

export function FiRightSidebar() {
  const t = useTranslations('FiRightSidebar');
  const { toast } = useToast();

  const [networkSuggestions, setNetworkSuggestions] = useState<NetworkSuggestion[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [fieldVisits, setFieldVisits] = useState<FieldVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const fetchSidebarData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [suggestionsResult, alertsResult, visitsResult] = await Promise.all([
        api.get<NetworkSuggestion[]>('/api/fi/network-suggestions'),
        api.get<RiskAlert[]>('/api/fi/risk-alerts'),
        api.get<FieldVisit[]>('/api/fi/field-visits/upcoming')
      ]);

      setNetworkSuggestions(suggestionsResult || []);
      setRiskAlerts(alertsResult || []);
      setFieldVisits(visitsResult || []);
    } catch (error) {
      console.error("Error fetching FI sidebar data:", error);
      // Set default empty arrays
      setNetworkSuggestions([]);
      setRiskAlerts([]);
      setFieldVisits([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSidebarData();
  }, [fetchSidebarData]);

  const handleConnect = async (userId: string) => {
    setFollowedUsers(prev => new Set(prev).add(userId));
    try {
      await api.post('/api/network/connect', { recipientId: userId });
      toast({
        title: t('connectionSent'),
        description: t('connectionSentDescription')
      });
    } catch (error: any) {
      toast({
        title: t('connectionFailed'),
        description: error.message,
        variant: "destructive"
      });
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sticky top-20">
      {/* Network Connections Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-semibold">{t('networkTitle')}</CardTitle>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={fetchSidebarData} className="h-7 w-7" title={t('refreshData')}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Info className="h-4 w-4 text-muted-foreground cursor-pointer ml-1" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-7 w-20 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : networkSuggestions.length > 0 ? (
            <ul className="space-y-4">
              {networkSuggestions.map(suggestion => (
                <li key={suggestion.id} className="flex items-start gap-3">
                  <Link href={`/profiles/${suggestion.id}`}>
                    <Avatar className="h-12 w-12 rounded-md cursor-pointer">
                      <AvatarImage src={suggestion.avatarUrl} alt={suggestion.name} />
                      <AvatarFallback>{suggestion.name?.substring(0, 1) || '?'}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/profiles/${suggestion.id}`} className="hover:underline">
                      <h4 className="text-sm font-semibold">{suggestion.name}</h4>
                    </Link>
                    <p className="text-xs text-muted-foreground">{suggestion.role}</p>
                    {suggestion.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {suggestion.location}
                      </p>
                    )}
                    {suggestion.creditScore && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Credit Score: {suggestion.creditScore}
                      </p>
                    )}
                    {suggestion.reason && (
                      <p className="text-xs text-muted-foreground/80 mt-0.5 italic">
                        "{suggestion.reason}"
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1.5 h-7 px-2 text-xs"
                      onClick={() => handleConnect(suggestion.id)}
                      disabled={followedUsers.has(suggestion.id)}
                    >
                      {followedUsers.has(suggestion.id) ? (
                        t('connected')
                      ) : (
                        <>
                          <Plus className="mr-1 h-3 w-3" /> {t('connect')}
                        </>
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t('noSuggestions')}</p>
          )}

          {networkSuggestions.length > 0 && (
            <Button variant="link" className="px-0 text-xs text-muted-foreground hover:text-primary mt-2" asChild>
              <Link href="/network/fi-network">
                {t('viewAllNetwork')} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Risk Alerts Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t('riskAlerts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded" />
              <Skeleton className="h-16 w-full rounded" />
            </div>
          ) : riskAlerts.length > 0 ? (
            <div className="space-y-3">
              {riskAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-semibold">{alert.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs mb-2">{alert.description}</p>
                  {alert.actionRequired && (
                    <Button size="sm" variant="outline" className="w-full text-xs h-7">
                      {t('takeAction')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t('noAlerts')}</p>
          )}
        </CardContent>
      </Card>

      {/* Field Visits Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            {t('upcomingVisits')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
            </div>
          ) : fieldVisits.length > 0 ? (
            <div className="space-y-3">
              {fieldVisits.slice(0, 3).map(visit => (
                <div key={visit.id} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold">{visit.farmerName}</h4>
                    <Badge className={`text-xs ${getVisitStatusColor(visit.status)}`}>
                      {visit.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" />
                    {visit.location}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(visit.scheduledDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{visit.purpose}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t('noVisits')}</p>
          )}

          {fieldVisits.length > 0 && (
            <Button variant="link" className="px-0 text-xs text-muted-foreground hover:text-primary mt-2" asChild>
              <Link href="/fi/field-visits">
                {t('viewAllVisits')} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Market Intelligence Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            {t('marketIntelligence')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-green-800">Maize Prices</span>
                <Badge className="bg-green-100 text-green-800 text-xs">+5.2%</Badge>
              </div>
              <p className="text-xs text-green-700">Strong demand from export markets</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-blue-800">Weather Risk</span>
                <Badge className="bg-blue-100 text-blue-800 text-xs">Monitor</Badge>
              </div>
              <p className="text-xs text-blue-700">Heavy rainfall expected next week</p>
            </div>
          </div>

          <Button variant="link" className="px-0 text-xs text-muted-foreground hover:text-primary mt-3" asChild>
            <Link href="/fi/market-intelligence">
              {t('viewMarketReport')} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}