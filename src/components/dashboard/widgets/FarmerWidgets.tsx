import React from 'react';
import { CloudRain, TrendingUp, Users, Target, Award, HandHeart, Zap, BookOpen, Shield, Star, Truck, FileText, MapPin, Store, Handshake, Home, Microscope, Bug, BarChart3, Sprout, Lightbulb, Briefcase, DollarSign, Trophy, Globe, Newspaper, Clipboard, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const WeatherWidget: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center space-x-2 mb-4">
      <CloudRain className="h-5 w-5 text-blue-500" />
      <h4 className="font-semibold text-gray-900">Agricultural Weather</h4>
    </div>
    <div className="text-sm text-gray-600 mb-4"><MapPin className="h-4 w-4 inline mr-1" /> Nairobi, Kenya</div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">24°C</div>
        <div className="text-xs text-gray-500">Partly Cloudy</div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">68%</div>
        <div className="text-xs text-gray-500">Soil Moisture</div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-lg font-bold text-gray-700">12 km/h</div>
        <div className="text-xs text-gray-500">Wind Speed</div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-lg font-bold text-orange-600">26°C</div>
        <div className="text-xs text-gray-500">Tomorrow</div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border-l-4 border-green-500">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xs font-semibold text-green-600 uppercase">
          Today's Agricultural Insight
        </span>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          OPTIMAL
        </span>
      </div>
      <p className="text-sm text-gray-700">Perfect planting conditions. Soil moisture optimal for maize & beans. Consider pest monitoring due to humidity.</p>
    </div>
  </div>
);

// [TrendingUp] MARKET INTELLIGENCE - Real-time market data and opportunities
export const MarketIntelligenceWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-blue-800">
        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
        Market Intelligence
      </CardTitle>
      <p className="text-sm text-blue-600 font-normal">Real-time prices & buyer demands</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Price Alerts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
          <div>
            <p className="text-sm font-semibold text-green-800">Tomatoes</p>
            <p className="text-xs text-green-600">↑ 40% this week</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">KSH 120/kg</p>
            <Badge className="bg-green-100 text-green-800 text-xs">High Demand</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
          <div>
            <p className="text-sm font-semibold text-blue-800">Spinach</p>
            <p className="text-xs text-blue-600">Stable prices</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">KSH 85/kg</p>
            <Badge className="bg-blue-100 text-blue-800 text-xs">Steady</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
          <div>
            <p className="text-sm font-semibold text-orange-800">Maize</p>
            <p className="text-xs text-orange-600">↓ 15% oversupply</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-orange-600">KSH 35/kg</p>
            <Badge className="bg-orange-100 text-orange-800 text-xs">Oversupply</Badge>
          </div>
        </div>
      </div>

      {/* Buyer Demands */}
      <div className="pt-3 border-t border-blue-200">
        <p className="text-sm font-medium text-blue-800 mb-2"><Store className="h-4 w-4 inline mr-1" /> Buyer Requests</p>
        <div className="space-y-2">
          <div className="p-2 bg-white rounded border border-blue-200">
            <p className="text-sm font-medium text-blue-800">Organic Kale - 500kg needed</p>
            <p className="text-xs text-blue-600">Premium Restaurant • Nairobi • KSH 150/kg</p>
          </div>
          <div className="p-2 bg-white rounded border border-blue-200">
            <p className="text-sm font-medium text-blue-800">Fresh Herbs - Weekly supply</p>
            <p className="text-xs text-blue-600">Hotel Chain • Mombasa • Contract available</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Handshake] COMMUNITY COLLABORATION - Farmer networks and cooperation
export const CommunityCollaborationWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-purple-800">
        <Users className="h-5 w-5 mr-2 text-purple-600" />
        Farmer Networks
      </CardTitle>
      <p className="text-sm text-purple-600 font-normal">Connect with cooperatives & experts</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Local Cooperatives */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-purple-800"><Home className="h-4 w-4 inline mr-1" /> Local Cooperatives</h4>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-800">Kiambu Organic Farmers Coop</p>
              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
            </div>
            <p className="text-xs text-purple-600 mb-2">45 members • Organic certification • Bulk marketing</p>
            <Button size="sm" variant="outline" className="w-full bg-purple-50 hover:bg-purple-100 border-purple-200" asChild>
              <Link href="/network">Join Cooperative</Link>
            </Button>
          </div>

          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-800">Nairobi County Agribusiness</p>
              <Badge className="bg-blue-100 text-blue-800 text-xs">Growing</Badge>
            </div>
            <p className="text-xs text-purple-600 mb-2">28 members • Equipment sharing • Training programs</p>
            <Button size="sm" variant="outline" className="w-full bg-purple-50 hover:bg-purple-100 border-purple-200" asChild>
              <Link href="/knowledge-hub">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Expert Networks */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-purple-800"><Shield className="h-4 w-4 inline mr-1" /> Expert Networks</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Soil Health Experts</p>
                <p className="text-xs text-purple-600">12 certified agronomists</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="bg-purple-50 hover:bg-purple-100" asChild>
              <Link href="/network">Connect</Link>
            </Button>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Pest Management Group</p>
                <p className="text-xs text-purple-600">8 IPM specialists</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="bg-purple-50 hover:bg-purple-100" asChild>
              <Link href="/network">Join</Link>
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Microscope] ADVANCED AGRICULTURAL INSIGHTS - AI-powered farming intelligence
export const AdvancedInsightsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-emerald-800">
        <Zap className="h-5 w-5 mr-2 text-emerald-600" />
        Smart Farming Insights
      </CardTitle>
      <p className="text-sm text-emerald-600 font-normal">AI-powered agricultural intelligence</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Disease Alerts */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-emerald-800"><Bug className="h-4 w-4 inline mr-1" /> Disease Monitoring</h4>
        <div className="p-3 bg-white rounded-lg border border-red-200">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Early Blight Detected</p>
              <p className="text-xs text-red-700">3 tomato fields in your region affected. Apply copper fungicide immediately.</p>
              <p className="text-xs text-red-600 mt-1">Risk Level: High • Spread Rate: 15%/day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Yield Predictions */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-emerald-800"><BarChart3 className="h-4 w-4 inline mr-1" /> Yield Predictions</h4>
        <div className="p-3 bg-white rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-emerald-800">Your Maize Crop</p>
            <Badge className="bg-green-100 text-green-800">+8% above average</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-emerald-600">3.2t</p>
              <p className="text-xs text-emerald-700">Predicted Yield</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">92%</p>
              <p className="text-xs text-blue-700">Health Score</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-600">18 days</p>
              <p className="text-xs text-orange-700">To Harvest</p>
            </div>
          </div>
        </div>
      </div>

      {/* Soil Health */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-emerald-800"><Sprout className="h-4 w-4 inline mr-1" /> Soil Intelligence</h4>
        <div className="p-3 bg-white rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-emerald-800">Field A Soil Analysis</p>
            <Badge className="bg-emerald-100 text-emerald-800">Optimal</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-emerald-700">pH Level: <span className="font-semibold">6.8</span></p>
              <p className="text-emerald-700">Nitrogen: <span className="font-semibold">High</span></p>
            </div>
            <div>
              <p className="text-emerald-700">Phosphorus: <span className="font-semibold">Medium</span></p>
              <p className="text-emerald-700">Potassium: <span className="font-semibold">High</span></p>
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2"><Lightbulb className="h-3 w-3 inline mr-1" /> Recommendation: Maintain current fertilization schedule</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Briefcase] BUSINESS OPPORTUNITIES - Grants, contracts, certifications
export const BusinessOpportunitiesWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-amber-800">
        <Award className="h-5 w-5 mr-2 text-amber-600" />
        Business Opportunities
      </CardTitle>
      <p className="text-sm text-amber-600 font-normal">Grants, contracts & certifications</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Funding Opportunities */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-amber-800"><DollarSign className="h-4 w-4 inline mr-1" /> Available Funding</h4>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-amber-800">Climate Smart Agriculture Grant</p>
              <Badge className="bg-green-100 text-green-800 text-xs">Open</Badge>
            </div>
            <p className="text-xs text-amber-700 mb-2">Up to KSH 500,000 for sustainable farming practices</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-600">Deadline: March 15</p>
              <Button size="sm" variant="outline" className="bg-amber-50 hover:bg-amber-100 border-amber-200" asChild>
                <Link href="/fi/applications">Apply</Link>
              </Button>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-amber-800">Youth in Agribusiness Fund</p>
              <Badge className="bg-blue-100 text-blue-800 text-xs">Priority</Badge>
            </div>
            <p className="text-xs text-amber-700 mb-2">KSH 200,000 - KSH 1M for young farmers</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-600">Rolling applications</p>
              <Button size="sm" variant="outline" className="bg-amber-50 hover:bg-amber-100 border-amber-200" asChild>
                <Link href="/knowledge-hub">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts & Partnerships */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-amber-800"><Handshake className="h-4 w-4 inline mr-1" /> Contracts Available</h4>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <p className="text-sm font-medium text-amber-800 mb-1">Organic Vegetables Supply Contract</p>
            <p className="text-xs text-amber-700 mb-2">Premium Hotel Chain • 2-year contract • Guaranteed pricing</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-600">Volume: 1,000kg/week</p>
              <Button size="sm" variant="outline" className="bg-amber-50 hover:bg-amber-100 border-amber-200" asChild>
                <Link href="/marketplace">Express Interest</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-amber-800"><Trophy className="h-4 w-4 inline mr-1" /> Certification Programs</h4>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-800 cursor-pointer hover:bg-green-200">
            <Sprout className="h-3 w-3 inline mr-1" /> Organic Certified
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200">
            <Globe className="h-3 w-3 inline mr-1" /> Fair Trade
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200">
            <Microscope className="h-3 w-3 inline mr-1" /> GAP Certified
          </Badge>
          <Badge className="bg-orange-100 text-orange-800 cursor-pointer hover:bg-orange-200">
            <Star className="h-3 w-3 inline mr-1" /> Rainforest Alliance
          </Badge>
        </div>
        <p className="text-xs text-amber-600 mt-2">Click badges to learn about certification benefits</p>
      </div>
    </CardContent>
  </Card>
);

export const NewsEventsWidget: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center space-x-2 mb-4">
      <Newspaper className="h-5 w-5 text-gray-600" />
      <h4 className="font-semibold text-gray-900">Agricultural News & Events</h4>
    </div>

    <div className="space-y-4">
      <div>
        <h5 className="font-medium text-orange-600 mb-2">Upcoming Event</h5>
        <div className="text-sm">
          <div className="font-medium text-gray-900">Kenya Agricultural Show - February 15-20, Nairobi</div>
          <div className="text-gray-500 text-xs mt-1">Don't miss the biggest agricultural event of the year!</div>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-blue-600 mb-2">Government Policy</h5>
        <div className="text-sm">
          <div className="font-medium text-gray-900">New subsidies for organic farming inputs announced</div>
          <div className="text-gray-500 text-xs mt-1">Applications open March 1st</div>
        </div>
      </div>
    </div>
  </div>
);

// [Truck] SUPPLY CHAIN INTEGRATION - Connect with buyers and logistics
export const SupplyChainWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-green-800">
        <Truck className="h-5 w-5 mr-2 text-green-600" />
        Supply Chain Hub
      </CardTitle>
      <p className="text-sm text-green-600 font-normal">Connect buyers & logistics</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Active Contracts */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-green-800"><Clipboard className="h-4 w-4 inline mr-1" /> Active Contracts</h4>
        <div className="p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-800">Nairobi Fresh Market</p>
            <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
          </div>
          <p className="text-xs text-green-700 mb-2">Weekly delivery • 200kg tomatoes • KSH 110/kg</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-600">Next delivery: Tomorrow</span>
            <Button size="sm" variant="outline" className="text-xs" asChild>
              <Link href="/marketplace">View Details</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Logistics Partners */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-green-800"><Truck className="h-4 w-4 inline mr-1" /> Logistics Partners</h4>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-800">Cold Chain Express</p>
              <Badge className="bg-blue-100 text-blue-800 text-xs">Refrigerated</Badge>
            </div>
            <p className="text-xs text-green-700 mb-2">Temperature-controlled transport for perishable goods</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-600">Rate: KSH 25/kg</span>
              <Button size="sm" variant="outline" className="text-xs" asChild>
                <Link href="/marketplace">Book Now</Link>
              </Button>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-800">AgriLogistics Kenya</p>
              <Badge className="bg-orange-100 text-orange-800 text-xs">Bulk Transport</Badge>
            </div>
            <p className="text-xs text-green-700 mb-2">Bulk transport for grains and tubers</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-600">Capacity: 5 tons</span>
              <Button size="sm" variant="outline" className="text-xs" asChild>
                <Link href="/marketplace">Schedule</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Assurance */}
      <div className="pt-3 border-t border-green-200">
        <h4 className="text-sm font-semibold text-green-800 mb-2"><CheckCircle className="h-4 w-4 inline mr-1" /> Quality Assurance</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">Last inspection</span>
            <Badge className="bg-green-100 text-green-800">Grade A</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">Next audit</span>
            <span className="text-xs text-green-600">March 15, 2024</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3 bg-white hover:bg-green-50 border-green-200" asChild>
          <Link href="/traceability">
            <FileText className="h-4 w-4 mr-2" />
            View Quality Reports
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const AgriculturalWeatherWidget: React.FC = () => (
  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm p-6 border border-blue-200">
    <div className="flex items-center space-x-2 mb-4">
      <CloudRain className="h-5 w-5 text-blue-600" />
      <h4 className="font-semibold text-blue-900">Agricultural Weather</h4>
    </div>
    <div className="text-sm text-blue-700 mb-4 flex items-center">
      <MapPin className="h-4 w-4 mr-1" />
      Nairobi, Kenya
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
        <div className="text-2xl font-bold text-blue-600">24°C</div>
        <div className="text-xs text-blue-700">Temperature</div>
      </div>
      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
        <div className="text-2xl font-bold text-blue-600">Partly Cloudy</div>
        <div className="text-xs text-blue-700">Conditions</div>
      </div>
      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
        <div className="text-2xl font-bold text-blue-600">68%</div>
        <div className="text-xs text-blue-700">Soil Moisture</div>
      </div>
      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
        <div className="text-2xl font-bold text-blue-600">12 km/h</div>
        <div className="text-xs text-blue-700">Wind Speed</div>
      </div>
    </div>

    <div className="mb-4">
      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
        <div className="text-lg font-bold text-orange-600">26°C</div>
        <div className="text-xs text-orange-700">Tomorrow's Forecast</div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border-l-4 border-green-500">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xs font-semibold text-green-600 uppercase">
          Today's Agricultural Insight
        </span>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          OPTIMAL
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-3">Perfect planting conditions. Soil moisture optimal for maize & beans. Consider pest monitoring due to humidity.</p>
      <div className="flex gap-2">
        <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors">
          View Forecast
        </button>
        <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
          Irrigation Tips
        </button>
      </div>
    </div>
  </div>
);

export const AgriculturalNewsEventsWidget: React.FC = () => (
  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-sm p-6 border border-amber-200">
    <div className="flex items-center space-x-2 mb-4">
      <Newspaper className="h-5 w-5 text-amber-600" />
      <h4 className="font-semibold text-amber-900">Agricultural News & Events</h4>
    </div>

    <div className="space-y-4">
      <div>
        <h5 className="font-medium text-orange-600 mb-2 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Upcoming Event
        </h5>
        <div className="text-sm bg-white p-3 rounded-lg border border-orange-200">
          <div className="font-medium text-gray-900">Kenya Agricultural Show</div>
          <div className="text-gray-600 text-xs mt-1">February 15-20, Nairobi</div>
          <div className="text-gray-500 text-xs mt-1">Don't miss the biggest agricultural event of the year!</div>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-blue-600 mb-2 flex items-center">
          <Globe className="h-4 w-4 mr-1" />
          Government Policy
        </h5>
        <div className="text-sm bg-white p-3 rounded-lg border border-blue-200">
          <div className="font-medium text-gray-900">New subsidies for organic farming</div>
          <div className="text-gray-600 text-xs mt-1">Applications open March 1st</div>
          <div className="text-gray-500 text-xs mt-1 mb-2">Recently announced - check eligibility requirements</div>
          <div className="flex gap-2">
            <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
              Apply Now
            </button>
            <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const RealTimeMarketWidget: React.FC = () => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border border-green-200">
    <div className="flex items-center space-x-2 mb-4">
      <TrendingUp className="h-5 w-5 text-green-600" />
      <h4 className="font-semibold text-green-900">Real-Time Market</h4>
    </div>

    {/* Price Alerts */}
    <div className="space-y-3 mb-4">
      <div className="bg-white p-3 rounded-lg border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-800">Tomatoes</span>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">↑ 15%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">KSH 85/kg</span>
          <span className="text-xs text-green-600">High Demand</span>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-800">Maize</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Stable</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">KSH 35/kg</span>
          <span className="text-xs text-green-600">Good Supply</span>
        </div>
      </div>
    </div>

    {/* Market Alerts */}
    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
      <div className="flex items-start space-x-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-800">Price Alert</p>
          <p className="text-xs text-yellow-700">Organic kale prices expected to rise 20% next week</p>
        </div>
      </div>
    </div>

    {/* Buyer Requests */}
    <div>
      <h5 className="text-sm font-medium text-green-800 mb-2">Buyer Requests</h5>
      <div className="space-y-2">
        <div className="bg-white p-2 rounded border border-green-200">
          <p className="text-sm font-medium text-green-800">Fresh Herbs - 200kg needed</p>
          <p className="text-xs text-green-600">Hotel Chain • Nairobi • KSH 180/kg</p>
          <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1 hover:bg-green-200 transition-colors">
            Contact Buyer
          </button>
        </div>
        <div className="bg-white p-2 rounded border border-green-200">
          <p className="text-sm font-medium text-green-800">Organic Vegetables - Weekly</p>
          <p className="text-xs text-green-600">Restaurant • Contract available</p>
          <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1 hover:bg-green-200 transition-colors">
            View Contract
          </button>
        </div>
      </div>
      <button className="w-full text-sm bg-green-600 text-white py-2 rounded mt-3 hover:bg-green-700 transition-colors">
        Browse Marketplace
      </button>
    </div>
  </div>
);

export const EnhancedSupplyChainWidget: React.FC = () => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-200">
    <div className="flex items-center space-x-2 mb-4">
      <Truck className="h-5 w-5 text-blue-600" />
      <h4 className="font-semibold text-blue-900">Supply Chain Hub</h4>
    </div>

    {/* Transportation Needs */}
    <div className="space-y-3 mb-4">
      <h5 className="text-sm font-medium text-blue-800">Transportation</h5>
      <div className="bg-white p-3 rounded-lg border border-blue-200">
        <p className="text-sm font-medium text-blue-800">Need truck for 2 tons maize</p>
        <p className="text-xs text-blue-600">Nairobi to Mombasa • Today • KSH 15,000</p>
        <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 hover:bg-blue-200">
          Offer Transport
        </button>
      </div>
    </div>

    {/* Storage Available */}
    <div className="space-y-3 mb-4">
      <h5 className="text-sm font-medium text-blue-800">Storage Available</h5>
      <div className="bg-white p-3 rounded-lg border border-blue-200">
        <p className="text-sm font-medium text-blue-800">Cold storage - 50 tons capacity</p>
        <p className="text-xs text-blue-600">Kiambu • Climate controlled • KSH 500/ton/month</p>
        <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 hover:bg-blue-200">
          Reserve Space
        </button>
      </div>
    </div>

    {/* Equipment Sharing */}
    <div className="space-y-3">
      <h5 className="text-sm font-medium text-blue-800">Equipment Sharing</h5>
      <div className="bg-white p-3 rounded-lg border border-blue-200">
        <p className="text-sm font-medium text-blue-800">Harvester available for hire</p>
        <p className="text-xs text-blue-600">John Deere • Nakuru area • KSH 25,000/day</p>
        <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 hover:bg-blue-200">
          Book Equipment
        </button>
      </div>
    </div>
  </div>
);

export const StoriesWidget: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
    <div className="flex items-center space-x-4 overflow-x-auto pb-2">
      {/* Add Story Button */}
      <div className="flex flex-col items-center space-y-1 min-w-[60px]">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <span className="text-blue-600 text-xl font-bold">+</span>
          </div>
        </div>
        <span className="text-xs text-center text-gray-600">Add Story</span>
      </div>

      {/* Story Items */}
      {[
        { name: 'John K.', avatar: '/api/placeholder/56/56', hasStory: true, isLive: false },
        { name: 'Mary W.', avatar: '/api/placeholder/56/56', hasStory: true, isLive: true },
        { name: 'David O.', avatar: '/api/placeholder/56/56', hasStory: true, isLive: false },
        { name: 'Grace M.', avatar: '/api/placeholder/56/56', hasStory: false, isLive: false },
        { name: 'Peter N.', avatar: '/api/placeholder/56/56', hasStory: true, isLive: false },
      ].map((user, index) => (
        <div key={index} className="flex flex-col items-center space-y-1 min-w-[60px]">
          <div className={`relative cursor-pointer hover:scale-105 transition-transform ${user.hasStory ? 'p-0.5 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full' : ''}`}>
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            {user.isLive && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-1 py-0.5 rounded font-bold">
                LIVE
              </div>
            )}
          </div>
          <span className="text-xs text-center text-gray-600 truncate w-full">{user.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export const TrendingTopicsWidget: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
    <div className="flex items-center space-x-2 mb-4">
      <TrendingUp className="h-5 w-5 text-orange-600" />
      <h4 className="font-semibold text-gray-900">Trending Topics</h4>
    </div>

    <div className="space-y-3">
      {[
        { hashtag: '#OrganicFarming', posts: '2.1K', trend: 'up' },
        { hashtag: '#ClimateSmartAg', posts: '1.8K', trend: 'up' },
        { hashtag: '#FarmToTable', posts: '956', trend: 'stable' },
        { hashtag: '#AgriTech', posts: '742', trend: 'up' },
        { hashtag: '#SustainableFarming', posts: '623', trend: 'up' },
      ].map((topic, index) => (
        <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-600">{topic.hashtag}</span>
            {topic.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
          </div>
          <span className="text-xs text-gray-500">{topic.posts} posts</span>
        </div>
      ))}
    </div>

    <button className="w-full text-sm text-blue-600 hover:text-blue-700 mt-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
      View All Trends
    </button>
  </div>
);

export const TrendingFarmersWidget: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h4 className="font-semibold text-gray-900 mb-4">Trending Farmers</h4>
    <div className="space-y-3">
      {['Mary Wanjiku', 'David Ochieng', 'Grace Mutua'].map((name, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={`/api/placeholder/32/32`}
              alt={name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium text-gray-900">{name}</span>
          </div>
          <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
            Follow
          </button>
        </div>
      ))}
    </div>
  </div>
);