/**
 * Crowdfunder Widgets - Specialized widgets for crowdfunding and impact investors
 * Handles portfolio management, project discovery, impact tracking, and returns
 */

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp, Heart, DollarSign, BarChart3, Users, Target,
  Calendar, Award, Star, CheckCircle, Clock, MapPin,
  PieChart, Wallet, FileText, Globe, Leaf, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// [BarChart3] PORTFOLIO MANAGEMENT - Investment portfolio tracking
export const PortfolioManagementWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-blue-800">
        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
        Investment Portfolio
      </CardTitle>
      <p className="text-sm text-blue-600 font-normal">Track your impact investments</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-green-600">KSH 1.2M</div>
          <div className="text-xs text-blue-700">Total Invested</div>
          <div className="text-xs text-green-600 mt-1">+15% this year</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">24</div>
          <div className="text-xs text-blue-700">Projects Funded</div>
          <div className="text-xs text-blue-600 mt-1">8 active</div>
        </div>
      </div>

      {/* Active Investments */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-800">Green Valley Irrigation</p>
            <Badge className="bg-green-100 text-green-800">Performing</Badge>
          </div>
          <p className="text-xs text-blue-700 mb-2">KSH 150K invested • 18 months</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">ROI: +12%</span>
            <span className="text-green-600 font-semibold">KSH 18K returns</span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-800">Urban Farm Collective</p>
            <Badge className="bg-yellow-100 text-yellow-800">Monitoring</Badge>
          </div>
          <p className="text-xs text-blue-700 mb-2">KSH 200K invested • 12 months</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">ROI: +8%</span>
            <span className="text-blue-600 font-semibold">KSH 16K returns</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Target] PROJECT DISCOVERY - Find investment opportunities
export const ProjectDiscoveryWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-green-800">
        <Target className="h-5 w-5 mr-2 text-green-600" />
        Project Discovery
      </CardTitle>
      <p className="text-sm text-green-600 font-normal">Find vetted investment opportunities</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Featured Projects */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-800">Solar-Powered Cold Storage</p>
            <Badge className="bg-blue-100 text-blue-800">High Impact</Badge>
          </div>
          <p className="text-xs text-green-700 mb-2">Reduces post-harvest losses by 60% • Nairobi region</p>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm">
              <span className="text-green-700">Seeking: </span>
              <span className="font-semibold text-green-800">KSH 500K</span>
            </div>
            <div className="text-sm">
              <span className="text-green-700">ROI: </span>
              <span className="font-semibold text-green-800">18-22%</span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full bg-green-50 hover:bg-green-100 border-green-200">
            View Details
          </Button>
        </div>

        <div className="p-3 bg-white rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-800">Women-Led Vegetable Coop</p>
            <Badge className="bg-purple-100 text-purple-800">Social Impact</Badge>
          </div>
          <p className="text-xs text-green-700 mb-2">Empowering 50 women farmers • Organic produce</p>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm">
              <span className="text-green-700">Seeking: </span>
              <span className="font-semibold text-green-800">KSH 300K</span>
            </div>
            <div className="text-sm">
              <span className="text-green-700">ROI: </span>
              <span className="font-semibold text-green-800">15-20%</span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full bg-purple-50 hover:bg-purple-100 border-purple-200">
            Learn More
          </Button>
        </div>
      </div>

      {/* Discovery Filters */}
      <div className="pt-3 border-t border-green-200">
        <p className="text-sm font-medium text-green-800 mb-2"><Target className="h-4 w-4 inline mr-1" /> Investment Focus</p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-800 cursor-pointer hover:bg-green-200">Climate Tech</Badge>
          <Badge className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200">Food Security</Badge>
          <Badge className="bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200">Women-Led</Badge>
          <Badge className="bg-orange-100 text-orange-800 cursor-pointer hover:bg-orange-200">Youth Projects</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Heart] IMPACT TRACKING - Measure social and environmental impact
export const ImpactTrackingWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-purple-800">
        <Heart className="h-5 w-5 mr-2 text-purple-600" />
        Impact Tracking
      </CardTitle>
      <p className="text-sm text-purple-600 font-normal">Measure your social and environmental impact</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Impact Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-green-600">180</div>
          <div className="text-xs text-purple-700">Farmers Supported</div>
          <div className="text-xs text-green-600 mt-1">+25 this quarter</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-blue-600">2.4t</div>
          <div className="text-xs text-purple-700">CO₂ Reduced</div>
          <div className="text-xs text-blue-600 mt-1">Carbon credits</div>
        </div>
      </div>

      {/* Impact Categories */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-purple-800"><Leaf className="h-4 w-4 inline mr-1" /> Impact Categories</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
            <span className="text-sm text-purple-800">Food Security</span>
            <div className="flex items-center space-x-1">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="text-xs text-green-600 font-semibold">85%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
            <span className="text-sm text-purple-800">Climate Resilience</span>
            <div className="flex items-center space-x-1">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <span className="text-xs text-blue-600 font-semibold">72%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
            <span className="text-sm text-purple-800">Economic Empowerment</span>
            <div className="flex items-center space-x-1">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '91%' }}></div>
              </div>
              <span className="text-xs text-purple-600 font-semibold">91%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stories */}
      <div className="pt-3 border-t border-purple-200">
        <p className="text-sm font-medium text-purple-800 mb-2"><Zap className="h-4 w-4 inline mr-1" /> Impact Stories</p>
        <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-300">
          <p className="text-sm font-medium text-purple-800 mb-1">"Thanks to the irrigation investment, our yields increased by 40% and we're now food secure year-round."</p>
          <p className="text-xs text-purple-700">- Mary Wanjiku, Smallholder Farmer</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [DollarSign] RETURNS MANAGEMENT - Track investment returns and payouts
export const ReturnsManagementWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-yellow-800">
        <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
        Returns & Payouts
      </CardTitle>
      <p className="text-sm text-yellow-600 font-normal">Track investment returns and distributions</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Returns Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-green-600">KSH 234K</div>
          <div className="text-xs text-yellow-700">Total Returns</div>
          <div className="text-xs text-green-600 mt-1">19.5% average ROI</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-blue-600">KSH 45K</div>
          <div className="text-xs text-yellow-700">Pending Payouts</div>
          <div className="text-xs text-blue-600 mt-1">Next month</div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-yellow-800"><Clock className="h-4 w-4 inline mr-1" /> Recent Payouts</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Green Valley Irrigation</p>
                <p className="text-xs text-yellow-700">KSH 18,000 • Completed</p>
              </div>
            </div>
            <span className="text-xs text-green-700">Paid</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Urban Farm Collective</p>
                <p className="text-xs text-yellow-700">KSH 16,000 • Processing</p>
              </div>
            </div>
            <span className="text-xs text-blue-700">Pending</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="pt-3 border-t border-yellow-200">
        <p className="text-sm font-medium text-yellow-800 mb-2"><Wallet className="h-4 w-4 inline mr-1" /> Payout Methods</p>
        <Link href="/wallet">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-yellow-50 border-yellow-200">
            <Wallet className="h-4 w-4 mr-3 text-yellow-600" />
            <div className="text-left">
              <div className="font-semibold text-yellow-800">Manage Payment Methods</div>
              <div className="text-xs text-yellow-600">Update payout preferences</div>
            </div>
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

// [TrendingUp] INVESTMENT OPPORTUNITIES - Curated investment pipeline
export const InvestmentOpportunitiesWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-indigo-800">
        <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
        Investment Pipeline
      </CardTitle>
      <p className="text-sm text-indigo-600 font-normal">Curated opportunities matching your criteria</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Pipeline Stages */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-indigo-800">Due Diligence Complete</p>
              <p className="text-xs text-indigo-700">3 projects ready for investment</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">3</Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-indigo-800">Under Review</p>
              <p className="text-xs text-indigo-700">7 projects in evaluation</p>
            </div>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">7</Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-indigo-800">Lead Generation</p>
              <p className="text-xs text-indigo-700">12 potential opportunities</p>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">12</Badge>
        </div>
      </div>

      {/* Investment Criteria */}
      <div className="pt-3 border-t border-indigo-200">
        <p className="text-sm font-medium text-indigo-800 mb-2"><Target className="h-4 w-4 inline mr-1" /> Your Investment Focus</p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-800">Sustainable Agriculture</Badge>
          <Badge className="bg-blue-100 text-blue-800">Climate Resilience</Badge>
          <Badge className="bg-purple-100 text-purple-800">Women-Led Projects</Badge>
          <Badge className="bg-orange-100 text-orange-800">$50K - $200K Range</Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <Button size="sm" variant="outline" className="flex-1 bg-indigo-50 hover:bg-indigo-100 border-indigo-200">
          <Target className="h-4 w-4 mr-2" />
          Browse Pipeline
        </Button>
        <Button size="sm" variant="outline" className="flex-1 bg-indigo-50 hover:bg-indigo-100 border-indigo-200">
          <Users className="h-4 w-4 mr-2" />
          Network
        </Button>
      </div>
    </CardContent>
  </Card>
);

// [Globe] SUSTAINABILITY TRACKING - ESG and sustainability metrics
export const SustainabilityTrackingWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-teal-50 to-green-50 border-teal-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-teal-800">
        <Globe className="h-5 w-5 mr-2 text-teal-600" />
        Sustainability Impact
      </CardTitle>
      <p className="text-sm text-teal-600 font-normal">Track your ESG and sustainability contributions</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* ESG Scores */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-white rounded-lg border border-teal-200">
          <div className="text-2xl font-bold text-green-600">A</div>
          <div className="text-xs text-teal-700">Environmental</div>
          <div className="text-xs text-green-600 mt-1">Carbon reduction</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-teal-200">
          <div className="text-2xl font-bold text-blue-600">A-</div>
          <div className="text-xs text-teal-700">Social</div>
          <div className="text-xs text-blue-600 mt-1">Community impact</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-teal-200">
          <div className="text-2xl font-bold text-purple-600">B+</div>
          <div className="text-xs text-teal-700">Governance</div>
          <div className="text-xs text-purple-600 mt-1">Ethical practices</div>
        </div>
      </div>

      {/* Sustainability Metrics */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-teal-800"><Leaf className="h-4 w-4 inline mr-1" /> Key Sustainability Metrics</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
            <span className="text-sm text-teal-800">Hectares Under Sustainable Practices</span>
            <span className="text-sm font-semibold text-green-600">247 ha</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
            <span className="text-sm text-teal-800">Water Saved (liters/year)</span>
            <span className="text-sm font-semibold text-blue-600">1.2M L</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
            <span className="text-sm text-teal-800">Biodiversity Index Improvement</span>
            <span className="text-sm font-semibold text-purple-600">+23%</span>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="pt-3 border-t border-teal-200">
        <p className="text-sm font-medium text-teal-800 mb-2"><Award className="h-4 w-4 inline mr-1" /> Impact Certifications</p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-800">Carbon Neutral</Badge>
          <Badge className="bg-blue-100 text-blue-800">SDG Aligned</Badge>
          <Badge className="bg-purple-100 text-purple-800">Regenerative Ag</Badge>
          <Badge className="bg-orange-100 text-orange-800">Fair Trade</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);