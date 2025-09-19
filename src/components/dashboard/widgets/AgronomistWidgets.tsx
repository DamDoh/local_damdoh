/**
 * Agronomist-specific widgets for agricultural consulting and advisory services
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sprout, Users, TrendingUp, Calendar, Microscope, BookOpen, Target, Award } from 'lucide-react';
import Link from 'next/link';

export const CropConsultationWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Sprout className="h-4 w-4" />
        Crop Consultation
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">12</div>
      <p className="text-xs text-muted-foreground">Active consultations</p>
      <Button size="sm" variant="outline" className="w-full" asChild>
        <Link href="/agronomist/consultations">View All</Link>
      </Button>
    </CardContent>
  </Card>
);

export const ClientManagementWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Users className="h-4 w-4" />
        Client Portfolio
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">45</div>
      <p className="text-xs text-muted-foreground">Active clients</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">Maize</Badge>
        <Badge variant="secondary" className="text-xs">Beans</Badge>
      </div>
    </CardContent>
  </Card>
);

export const SoilAnalysisWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Microscope className="h-4 w-4" />
        Soil Analysis
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">8</div>
      <p className="text-xs text-muted-foreground">Pending reports</p>
      <Button size="sm" variant="outline" className="w-full" asChild>
        <Link href="/agronomist/soil-analysis">Review Reports</Link>
      </Button>
    </CardContent>
  </Card>
);

export const AdvisoryServicesWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Advisory Services
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">23</div>
      <p className="text-xs text-muted-foreground">Recommendations given</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Fertilizer advice</span>
          <span className="font-medium">15</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Pest management</span>
          <span className="font-medium">8</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const FieldVisitsWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Field Visits
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">6</div>
      <p className="text-xs text-muted-foreground">Scheduled this week</p>
      <Button size="sm" variant="outline" className="w-full" asChild>
        <Link href="/agronomist/schedule">View Schedule</Link>
      </Button>
    </CardContent>
  </Card>
);

export const CertificationSupportWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Award className="h-4 w-4" />
        Certification Support
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">5</div>
      <p className="text-xs text-muted-foreground">Clients certified</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">Organic</Badge>
        <Badge variant="secondary" className="text-xs">GAP</Badge>
      </div>
    </CardContent>
  </Card>
);