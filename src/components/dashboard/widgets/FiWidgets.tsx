import React from 'react';
import { Landmark, FileCheck, MapPin, TrendingUp, Shield, Users, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, BarChart3, PieChart, Activity, Download, Wallet, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// 📊 LOAN PORTFOLIO OVERVIEW - Real-time portfolio metrics
export const LoanPortfolioWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-blue-800">
        <Landmark className="h-5 w-5 mr-2 text-blue-600" />
        Loan Portfolio Overview
      </CardTitle>
      <p className="text-sm text-blue-600 font-normal">Real-time portfolio performance</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">$2.4M</div>
          <div className="text-xs text-blue-700">Total Portfolio</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">94.2%</div>
          <div className="text-xs text-green-700">Repayment Rate</div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-800"><PieChart className="h-4 w-4 inline mr-1" /> Risk Distribution</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
            <span className="text-sm text-green-800">Low Risk</span>
            <div className="flex items-center space-x-2">
              <Progress value={65} className="w-16 h-2" />
              <span className="text-xs text-green-700">65%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200">
            <span className="text-sm text-yellow-800">Medium Risk</span>
            <div className="flex items-center space-x-2">
              <Progress value={30} className="w-16 h-2" />
              <span className="text-xs text-yellow-700">30%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
            <span className="text-sm text-red-800">High Risk</span>
            <div className="flex items-center space-x-2">
              <Progress value={5} className="w-16 h-2" />
              <span className="text-xs text-red-700">5%</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 🔍 RISK ASSESSMENT DASHBOARD - AI-powered risk analysis
export const RiskAssessmentWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-red-800">
        <Shield className="h-5 w-5 mr-2 text-red-600" />
        Risk Assessment Center
      </CardTitle>
      <p className="text-sm text-red-600 font-normal">AI-powered risk analysis</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Risk Alerts */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-red-800"><AlertTriangle className="h-4 w-4 inline mr-1" /> Critical Alerts</h4>
        <div className="p-3 bg-white rounded-lg border border-red-200">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Weather Risk Detected</p>
              <p className="text-xs text-red-700">3 loans in drought-prone areas. Consider rescheduling payments.</p>
              <p className="text-xs text-red-600 mt-1">Impact: High • Affected: $450K portfolio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Scores */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-red-800"><BarChart3 className="h-4 w-4 inline mr-1" /> Risk Scoring</h4>
        <div className="p-3 bg-white rounded-lg border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-red-800">Portfolio Risk Score</p>
            <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">72</p>
              <p className="text-xs text-green-700">Credit Score</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">85%</p>
              <p className="text-xs text-blue-700">Collateral Value</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-600">3.2</p>
              <p className="text-xs text-orange-700">Risk Factor</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 📄 DOCUMENT VERIFICATION STATUS - Real-time verification tracking
export const DocumentVerificationWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-green-800">
        <FileCheck className="h-5 w-5 mr-2 text-green-600" />
        Document Verification
      </CardTitle>
      <p className="text-sm text-green-600 font-normal">Real-time verification status</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Verification Queue */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-green-800"><Clock className="h-4 w-4 inline mr-1" /> Pending Verifications</h4>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-yellow-800">Land Deed - Farm A</p>
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">In Progress</Badge>
            </div>
            <p className="text-xs text-yellow-700">AI analysis: 85% confidence • Manual review pending</p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-800">ID Document - John Doe</p>
              <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
            </div>
            <p className="text-xs text-green-700">All checks passed • Ready for approval</p>
          </div>
        </div>
      </div>

      {/* Verification Stats */}
      <div className="pt-3 border-t border-green-200">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-green-600">24</p>
            <p className="text-xs text-green-700">Verified Today</p>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-600">8</p>
            <p className="text-xs text-yellow-700">Pending</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-600">2</p>
            <p className="text-xs text-red-700">Rejected</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 🗺️ FIELD VISIT SCHEDULER - GPS-enabled field assessments
export const FieldVisitSchedulerWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-purple-800">
        <MapPin className="h-5 w-5 mr-2 text-purple-600" />
        Field Visit Scheduler
      </CardTitle>
      <p className="text-sm text-purple-600 font-normal">GPS-enabled field assessments</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Today's Schedule */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-purple-800"><Calendar className="h-4 w-4 inline mr-1" /> Today's Visits</h4>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-800">Farm Assessment - Kiambu</p>
              <Badge className="bg-blue-100 text-blue-800 text-xs">10:00 AM</Badge>
            </div>
            <p className="text-xs text-purple-700 mb-2">Collateral evaluation • GPS: -1.2833, 36.8167</p>
            <Button size="sm" variant="outline" className="w-full bg-purple-50 hover:bg-purple-100 border-purple-200">
              Start Navigation
            </Button>
          </div>

          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-800">Risk Assessment - Nakuru</p>
              <Badge className="bg-green-100 text-green-800 text-xs">2:00 PM</Badge>
            </div>
            <p className="text-xs text-purple-700 mb-2">Weather impact analysis • GPS: -0.3031, 36.0800</p>
            <Button size="sm" variant="outline" className="w-full bg-purple-50 hover:bg-purple-100 border-purple-200">
              View Details
            </Button>
          </div>
        </div>
      </div>

      {/* Visit Stats */}
      <div className="pt-3 border-t border-purple-200">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-purple-600">12</p>
            <p className="text-xs text-purple-700">Visits This Week</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">98%</p>
            <p className="text-xs text-green-700">On-Time Rate</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 📈 FINANCIAL ANALYTICS - Advanced portfolio insights
export const FinancialAnalyticsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-cyan-800">
        <TrendingUp className="h-5 w-5 mr-2 text-cyan-600" />
        Financial Analytics
      </CardTitle>
      <p className="text-sm text-cyan-600 font-normal">Advanced portfolio insights</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Performance Metrics */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-cyan-800"><Activity className="h-4 w-4 inline mr-1" /> Performance Metrics</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-cyan-200">
            <p className="text-sm font-medium text-cyan-800">Portfolio Growth</p>
            <p className="text-lg font-bold text-green-600">+12.5%</p>
            <p className="text-xs text-cyan-700">vs last quarter</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-cyan-200">
            <p className="text-sm font-medium text-cyan-800">Default Rate</p>
            <p className="text-lg font-bold text-red-600">2.1%</p>
            <p className="text-xs text-cyan-700">industry avg: 3.2%</p>
          </div>
        </div>
      </div>

      {/* Revenue Streams */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-cyan-800"><DollarSign className="h-4 w-4 inline mr-1" /> Revenue Breakdown</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-cyan-200">
            <span className="text-sm text-cyan-800">Interest Income</span>
            <span className="text-sm font-semibold text-cyan-700">$185K</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-cyan-200">
            <span className="text-sm text-cyan-800">Fee Income</span>
            <span className="text-sm font-semibold text-cyan-700">$42K</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-cyan-200">
            <span className="text-sm text-cyan-800">Service Charges</span>
            <span className="text-sm font-semibold text-cyan-700">$28K</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 👥 CLIENT RELATIONSHIP MANAGEMENT - Borrower engagement
export const ClientRelationshipWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-amber-800">
        <Users className="h-5 w-5 mr-2 text-amber-600" />
        Client Relationships
      </CardTitle>
      <p className="text-sm text-amber-600 font-normal">Borrower engagement & support</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Client Satisfaction */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-amber-800"><CheckCircle className="h-4 w-4 inline mr-1" /> Client Satisfaction</h4>
        <div className="p-3 bg-white rounded-lg border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-amber-800">Overall Satisfaction</p>
            <Badge className="bg-green-100 text-green-800">Excellent</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">4.8</p>
              <p className="text-xs text-green-700">Rating</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">95%</p>
              <p className="text-xs text-blue-700">Retention</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-600">24h</p>
              <p className="text-xs text-purple-700">Response Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Requests */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-amber-800"><Clock className="h-4 w-4 inline mr-1" /> Recent Support</h4>
        <div className="space-y-2">
          <div className="p-2 bg-white rounded border border-amber-200">
            <p className="text-sm font-medium text-amber-800">Loan restructuring request</p>
            <p className="text-xs text-amber-700">Resolved • 2 hours ago</p>
          </div>
          <div className="p-2 bg-white rounded border border-amber-200">
            <p className="text-sm font-medium text-amber-800">Payment extension inquiry</p>
            <p className="text-xs text-amber-700">In progress • 4 hours ago</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-3 border-t border-amber-200">
        <div className="space-y-2">
          <Link href="/fi/applications">
            <Button variant="outline" className="w-full justify-start bg-white hover:bg-amber-50 border-amber-200">
              <FileText className="h-4 w-4 mr-3 text-amber-600" />
              <div className="text-left">
                <div className="font-semibold text-amber-800">Review Applications</div>
                <div className="text-xs text-amber-600">Process loan requests</div>
              </div>
            </Button>
          </Link>

          <Link href="/wallet">
            <Button variant="outline" className="w-full justify-start bg-white hover:bg-amber-50 border-amber-200">
              <Wallet className="h-4 w-4 mr-3 text-amber-600" />
              <div className="text-left">
                <div className="font-semibold text-amber-800">Payment Processing</div>
                <div className="text-xs text-amber-600">Manage transactions</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 📊 COMPLIANCE REPORTING - Regulatory compliance tracking
export const ComplianceReportingWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-teal-50 to-green-50 border-teal-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-teal-800">
        <FileCheck className="h-5 w-5 mr-2 text-teal-600" />
        Compliance Center
      </CardTitle>
      <p className="text-sm text-teal-600 font-normal">Regulatory compliance tracking</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Compliance Status */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-teal-800"><Shield className="h-4 w-4 inline mr-1" /> Compliance Status</h4>
        <div className="p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-teal-800">Overall Compliance</p>
            <Badge className="bg-green-100 text-green-800">98.5% Compliant</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">✓</p>
              <p className="text-xs text-green-700">KYC</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">✓</p>
              <p className="text-xs text-green-700">AML</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">✓</p>
              <p className="text-xs text-green-700">Reporting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-teal-800"><Calendar className="h-4 w-4 inline mr-1" /> Upcoming Deadlines</h4>
        <div className="space-y-2">
          <div className="p-2 bg-white rounded border border-teal-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-teal-800">Q4 Regulatory Report</p>
              <Badge className="bg-orange-100 text-orange-800 text-xs">Due: Dec 31</Badge>
            </div>
          </div>
          <div className="p-2 bg-white rounded border border-teal-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-teal-800">Annual AML Review</p>
              <Badge className="bg-blue-100 text-blue-800 text-xs">Due: Jan 15</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="pt-3 border-t border-teal-200">
        <Button variant="outline" size="sm" className="w-full bg-white hover:bg-teal-50 border-teal-200">
          <Download className="h-4 w-4 mr-2" />
          Generate Compliance Report
        </Button>
      </div>
    </CardContent>
  </Card>
);