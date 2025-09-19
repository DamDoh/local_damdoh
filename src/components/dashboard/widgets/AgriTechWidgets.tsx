/**
 * AgriTech Widgets - Specialized widgets for agritech innovators and researchers
 * Handles innovation management, research tools, pilot programs, and funding
 */

import React from 'react';
import Link from 'next/link';
import {
  Microscope, Lightbulb, TestTube, TrendingUp, Users, DollarSign,
  BarChart3, BookOpen, Zap, Target, FlaskConical, Award,
  Calendar, FileText, Wallet, CheckCircle, Clock, Star,
  Beaker, Cpu, Database, Rocket, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// [Microscope] RESEARCH & DEVELOPMENT - Innovation tools and R&D management
export const ResearchDevelopmentWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-purple-800">
        <Microscope className="h-5 w-5 mr-2 text-purple-600" />
        Research & Development
      </CardTitle>
      <p className="text-sm text-purple-600 font-normal">Manage your innovation projects</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Active Projects */}
      <div className="space-y-2">
        <Link href="/knowledge-hub">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200">
            <BookOpen className="h-4 w-4 mr-3 text-purple-600" />
            <div className="text-left">
              <div className="font-semibold text-purple-800">Research Library</div>
              <div className="text-xs text-purple-600">Access scientific papers & data</div>
            </div>
          </Button>
        </Link>

        <Link href="/ai-assistant">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <Cpu className="h-4 w-4 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-blue-800">AI Research Assistant</div>
              <div className="text-xs text-blue-600">Data analysis & insights</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Research Metrics */}
      <div className="pt-3 border-t border-purple-200">
        <p className="text-sm font-medium text-purple-800 mb-2"><BarChart3 className="h-4 w-4 inline mr-1" /> Research Impact</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-xs text-purple-700">Papers Published</div>
            <div className="text-xs text-green-600 mt-1">+3 this year</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-blue-600">89%</div>
            <div className="text-xs text-purple-700">Success Rate</div>
            <div className="text-xs text-blue-600 mt-1">Pilot programs</div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Rocket] SOLUTION MANAGEMENT - Product development and deployment
export const SolutionManagementWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-blue-800">
        <Rocket className="h-5 w-5 mr-2 text-blue-600" />
        Solution Management
      </CardTitle>
      <p className="text-sm text-blue-600 font-normal">Develop and deploy your innovations</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Product Portfolio */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-800">AI Crop Disease Detector</p>
            <Badge className="bg-green-100 text-green-800">Live</Badge>
          </div>
          <p className="text-xs text-blue-700 mb-2">95% accuracy • 500+ farmers using</p>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="text-xs">Update</Button>
            <Button size="sm" variant="outline" className="text-xs">Analytics</Button>
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-800">Smart Irrigation System</p>
            <Badge className="bg-yellow-100 text-yellow-800">Beta</Badge>
          </div>
          <p className="text-xs text-blue-700 mb-2">IoT sensors • Pilot testing</p>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="text-xs">Monitor</Button>
            <Button size="sm" variant="outline" className="text-xs">Deploy</Button>
          </div>
        </div>
      </div>

      {/* Innovation Pipeline */}
      <div className="pt-3 border-t border-blue-200">
        <p className="text-sm font-medium text-blue-800 mb-2"><Microscope className="h-4 w-4 inline mr-1" /> Innovation Pipeline</p>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <span className="text-blue-700">3 ideas in research</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TestTube className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700">2 in development</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Rocket className="h-4 w-4 text-green-600" />
            <span className="text-blue-700">1 ready for launch</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Target] PILOT PROGRAM MANAGEMENT - Field testing and validation
export const PilotProgramWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-green-800">
        <Target className="h-5 w-5 mr-2 text-green-600" />
        Pilot Programs
      </CardTitle>
      <p className="text-sm text-green-600 font-normal">Manage field testing and validation</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Active Pilots */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-800">Precision Farming Pilot</p>
            <Badge className="bg-blue-100 text-blue-800">Phase 2</Badge>
          </div>
          <p className="text-xs text-green-700 mb-2">15 farms • 3 months • +40% yield increase</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs text-green-600">75% complete • Data collection ongoing</p>
        </div>

        <div className="p-3 bg-white rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-800">Mobile App Testing</p>
            <Badge className="bg-yellow-100 text-yellow-800">Phase 1</Badge>
          </div>
          <p className="text-xs text-green-700 mb-2">50 users • User feedback collection</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '30%' }}></div>
          </div>
          <p className="text-xs text-yellow-600">30% complete • Beta testing</p>
        </div>
      </div>

      {/* Pilot Metrics */}
      <div className="pt-3 border-t border-green-200">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-green-600">5</p>
            <p className="text-xs text-green-700">Active Pilots</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">127</p>
            <p className="text-xs text-blue-700">Participants</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600">87%</p>
            <p className="text-xs text-purple-700">Success Rate</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [DollarSign] FUNDING & GRANTS - Financial support and investment
export const FundingGrantsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-yellow-800">
        <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
        Funding & Grants
      </CardTitle>
      <p className="text-sm text-yellow-600 font-normal">Secure funding for your innovations</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Funding Opportunities */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-yellow-800">AgriTech Innovation Grant</p>
            <Badge className="bg-green-100 text-green-800">$50K</Badge>
          </div>
          <p className="text-xs text-yellow-700 mb-2">Sustainable farming solutions • Due: Dec 15</p>
          <Button size="sm" variant="outline" className="w-full bg-yellow-50 hover:bg-yellow-100 border-yellow-200">
            Apply Now
          </Button>
        </div>

        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-yellow-800">Climate Tech Investment</p>
            <Badge className="bg-blue-100 text-blue-800">$200K</Badge>
          </div>
          <p className="text-xs text-yellow-700 mb-2">VC funding • Climate adaptation focus</p>
          <Button size="sm" variant="outline" className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200">
            Learn More
          </Button>
        </div>
      </div>

      {/* Funding Status */}
      <div className="pt-3 border-t border-yellow-200">
        <p className="text-sm font-medium text-yellow-800 mb-2"><DollarSign className="h-4 w-4 inline mr-1" /> Funding Status</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-yellow-700">Grants Applied</span>
            <Badge className="bg-blue-100 text-blue-800">3</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-yellow-700">Funding Secured</span>
            <Badge className="bg-green-100 text-green-800">$125K</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-yellow-700">Success Rate</span>
            <Badge className="bg-purple-100 text-purple-800">67%</Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Users] PARTNERSHIPS & COLLABORATIONS - Network and collaborate
export const PartnershipsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-pink-800">
        <Users className="h-5 w-5 mr-2 text-pink-600" />
        Partnerships & Networks
      </CardTitle>
      <p className="text-sm text-pink-600 font-normal">Build collaborations and networks</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Collaboration Opportunities */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-pink-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-pink-800">University Research Partnership</p>
            <Badge className="bg-blue-100 text-blue-800">Academic</Badge>
          </div>
          <p className="text-xs text-pink-700 mb-2">Joint research on AI crop monitoring</p>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="text-xs">Connect</Button>
            <Button size="sm" variant="outline" className="text-xs">Details</Button>
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-pink-800">AgriCorp Distribution Deal</p>
            <Badge className="bg-green-100 text-green-800">Commercial</Badge>
          </div>
          <p className="text-xs text-pink-700 mb-2">Distribution partnership for irrigation tech</p>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="text-xs">Negotiate</Button>
            <Button size="sm" variant="outline" className="text-xs">Details</Button>
          </div>
        </div>
      </div>

      {/* Network Stats */}
      <div className="pt-3 border-t border-pink-200">
        <p className="text-sm font-medium text-pink-800 mb-2"><Globe className="h-4 w-4 inline mr-1" /> Network Growth</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-pink-200">
            <div className="text-2xl font-bold text-pink-600">47</div>
            <div className="text-xs text-pink-700">Partners</div>
            <div className="text-xs text-pink-600 mt-1">+5 this month</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-pink-200">
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-xs text-pink-700">Active Projects</div>
            <div className="text-xs text-purple-600 mt-1">Collaborative</div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [BarChart3] INNOVATION ANALYTICS - Performance and impact metrics
export const InnovationAnalyticsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-indigo-800">
        <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
        Innovation Analytics
      </CardTitle>
      <p className="text-sm text-indigo-600 font-normal">Track your innovation impact</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
          <div className="text-2xl font-bold text-green-600">500+</div>
          <div className="text-xs text-indigo-700">Farmers Impacted</div>
          <div className="text-xs text-green-600 mt-1">↑ 25% this quarter</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
          <div className="text-2xl font-bold text-blue-600">87%</div>
          <div className="text-xs text-indigo-700">Adoption Rate</div>
          <div className="text-xs text-blue-600 mt-1">Solution acceptance</div>
        </div>
      </div>

      {/* Impact Areas */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-indigo-800"><TrendingUp className="h-4 w-4 inline mr-1" /> Impact Metrics</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-indigo-200">
            <span className="text-sm text-indigo-800">Yield Increase</span>
            <span className="text-sm font-semibold text-green-600">+35%</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-indigo-200">
            <span className="text-sm text-indigo-800">Cost Reduction</span>
            <span className="text-sm font-semibold text-blue-600">-28%</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-indigo-200">
            <span className="text-sm text-indigo-800">Carbon Footprint</span>
            <span className="text-sm font-semibold text-purple-600">-42%</span>
          </div>
        </div>
      </div>

      {/* Innovation Score */}
      <div className="pt-3 border-t border-indigo-200">
        <div className="p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border border-indigo-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-indigo-800">Innovation Impact Score</p>
            <Badge className="bg-green-100 text-green-800">Excellent</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-indigo-200 rounded-full h-3">
              <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '92%' }}></div>
            </div>
            <span className="text-sm font-bold text-indigo-800">92/100</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);