
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Lock, Users as ConnectionsIcon, SearchCheck, Save, ShieldOff, Briefcase, Mail, FileText, Sparkles, TrendingUp, Settings as SettingsIconLucide } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Textarea } from "@/components/ui/textarea";
import { STAKEHOLDER_ROLES } from "@/lib/constants"; 

// Super App Vision Note: This Settings page becomes a critical hub for user trust and control.
// The new "Privacy & Visibility" section introduces the concept of data consent management,
// which is foundational for a super app that shares data between modules (e.g., sharing
// marketplace history with a financial institution for a loan). This empowers users
// and builds the trust needed for a vibrant digital ecosystem.

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <CardHeader className="p-0 mb-2"> {/* Reduced bottom margin */}
        <div className="flex items-center gap-2">
            <SettingsIconLucide className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Settings</CardTitle>
        </div>
        <CardDescription>Manage your account, agricultural profile, and platform preferences.</CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="account"><Lock className="mr-2 h-4 w-4" />Account</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="mr-2 h-4 w-4" />Privacy</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Stakeholder Profile Settings</CardTitle>
              <CardDescription>Update your public information for the agricultural supply chain network.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6"> 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                <div className="space-y-1.5"> 
                  <Label htmlFor="name" className="flex items-center gap-1.5"><User className="h-4 w-4 text-muted-foreground" />Full Name / Organization Name</Label>
                  <Input id="name" defaultValue="Aisha Bello / Sahel Organics" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-muted-foreground" />Contact Email</Label>
                  <Input id="email" type="email" defaultValue="contact@sahelorganics.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role" className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-muted-foreground" />Primary Role in Supply Chain</Label>
                <Select defaultValue="Farmer">
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Select your primary role" />
                    </SelectTrigger>
                    <SelectContent>
                        {STAKEHOLDER_ROLES.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-summary" className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-muted-foreground" />Profile Summary / Headline</Label>
                <Textarea id="profile-summary" placeholder="e.g., Exporter of fair-trade coffee, specializing in East African beans..." defaultValue="Founder, Sahel Organics | Connecting smallholder farmers to sustainable markets for premium hibiscus and sesame." className="min-h-[80px]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio" className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-muted-foreground" />Detailed Bio / About Your Organization</Label>
                <Textarea id="bio" placeholder="Share more about your operations, mission, products, services, or what you're seeking in the supply chain..." defaultValue="Sahel Organics is a social enterprise empowering women farmer cooperatives in Northern Nigeria. We focus on organic certification, quality improvement, and direct market access for hibiscus, sesame, and moringa. Seeking partnerships with international buyers and impact investors." className="min-h-[120px]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="areas-of-interest" className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-muted-foreground" />Areas of Interest / Specialties (comma-separated)</Label>
                <Input id="areas-of-interest" placeholder="e.g., Organic farming, Supply chain logistics, Export, Cashew processing" defaultValue="Organic certification, Fair trade, Hibiscus, Sesame, Women empowerment, Export to EU" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="needs" className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-muted-foreground" />Currently Seeking / Offering (comma-separated)</Label>
                <Input id="needs" placeholder="e.g., Buyers for cocoa beans, Warehousing space, Agronomy consulting" defaultValue="Bulk buyers for dried hibiscus, Logistics partners for shipping, Impact investment" />
              </div>
               <Button><Save className="mr-2 h-4 w-4" />Save Profile Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your login credentials and account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                  <Label htmlFor="current-password" className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-muted-foreground" />Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password" className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-muted-foreground" />New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="confirm-password" className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-muted-foreground" />Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              <Button><Save className="mr-2 h-4 w-4" />Change Password</Button>
              <Separator />
              <Button variant="destructive"><ShieldOff className="mr-2 h-4 w-4" />Deactivate Account</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Choose how you want to be notified about supply chain activity and platform updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Email Notifications Digest</p>
                  <p className="text-sm text-muted-foreground">Receive a summary of important updates, market news, and connection requests.</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">New Connection Requests</p>
                  <p className="text-sm text-muted-foreground">Notify me in-app and optionally by email for new stakeholder connection requests.</p>
                </div>
                <Switch id="connection-requests-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Forum Contributions & Mentions</p>
                  <p className="text-sm text-muted-foreground">Notify me for replies to my forum posts or when I'm mentioned.</p>
                </div>
                <Switch id="forum-mentions-notifications" defaultChecked />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Marketplace Activity</p>
                  <p className="text-sm text-muted-foreground">Notify me about inquiries on my listings or updates to saved searches.</p>
                </div>
                <Switch id="marketplace-updates-notifications" />
              </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Merged Marketplace Updates (Jobs, Services, etc.)</p>
                  <p className="text-sm text-muted-foreground">Notify me about applications to my job/service listings or new relevant offerings.</p>
                </div>
                <Switch id="talent-exchange-notifications" defaultChecked/>
              </div>
              <Button><Save className="mr-2 h-4 w-4" />Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Visibility Settings</CardTitle>
              <CardDescription>Control who can see your agricultural profile and supply chain activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><User className="mr-2 h-4 w-4 text-primary" />Profile Visibility</p>
                  <p className="text-sm text-muted-foreground ml-6">Control who can view your full stakeholder profile details.</p>
                </div>
                <Select defaultValue="everyone">
                    <SelectTrigger className="w-[220px]"> 
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">All DamDoh Members</SelectItem>
                        <SelectItem value="connections">My Connections Only</SelectItem>
                        <SelectItem value="private">Only Me (Not Recommended for Networking)</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><ConnectionsIcon className="mr-2 h-4 w-4 text-primary" />Connection Requests</p>
                  <p className="text-sm text-muted-foreground ml-6">Control who can send you connection requests.</p>
                </div>
                <Select defaultValue="everyone">
                    <SelectTrigger className="w-[220px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">All DamDoh Members</SelectItem>
                        <SelectItem value="connections-of-connections">Connections of Connections</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-primary" />Business/Contact Information Visibility</p>
                  <p className="text-sm text-muted-foreground ml-6">Control who sees your email, phone, or website if provided.</p>
                </div>
                 <Select defaultValue="connections">
                    <SelectTrigger className="w-[220px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">All DamDoh Members</SelectItem>
                        <SelectItem value="connections">My Connections Only</SelectItem>
                    </SelectContent>
                </Select>
              </div>

               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><Bell className="mr-2 h-4 w-4 text-primary" />Activity Status</p>
                  <p className="text-sm text-muted-foreground ml-6">Let others see when you are online or last active.</p>
                </div>
                <Switch id="activity-status" defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><SearchCheck className="mr-2 h-4 w-4 text-primary" />External Search Engine Indexing</p>
                  <p className="text-sm text-muted-foreground ml-6">Allow search engines (e.g., Google) to link to your DamDoh profile (public parts only).</p>
                </div>
                <Switch id="search-engine-indexing" defaultChecked />
              </div>
              <Button><Save className="mr-2 h-4 w-4" />Save Privacy Settings</Button>
              
              {/* Super App Vision Note: This section is key for trust. It allows users to control how their data is used across different modules. */}
              <Separator className="my-8" /> 
              <CardTitle className="text-xl flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> Data Consent Management</CardTitle>
              <CardDescription>Manage how your data is used and shared with other stakeholders or integrated services.</CardDescription>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium flex items-center"><FileText className="mr-2 h-4 w-4 text-primary" /> Marketplace History</p>
                    <p className="text-sm text-muted-foreground ml-6">Allows Financial Institutions to view your sales history when you apply for a loan or service, to assess your eligibility.</p>
                  </div>
                  <Switch id="consent-marketplace-fi" defaultChecked /> 
                </div>

                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium flex items-center"><SearchCheck className="mr-2 h-4 w-4 text-primary" /> Traceability Data</p>
                    <p className="text-sm text-muted-foreground ml-6">Allows buyers to view the public traceability log of products you have listed, building trust and transparency.</p>
                  </div>
                   <Switch id="consent-traceability-public" defaultChecked /> 
                 </div>

                 <div className="flex items-center justify-between rounded-lg border p-4">
                   <div>
                     <p className="font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-primary" /> Financial Application Data</p>
                     <p className="text-sm text-muted-foreground ml-6">Allow DamDoh's AI to analyze your application data to recommend other relevant financial products or services to you.</p>
                   </div>
                    <Switch id="consent-financial-ai" defaultChecked /> 
                 </div>
              </div>
              <Button><Save className="mr-2 h-4 w-4" />Save Consent Settings</Button>

            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the DamDoh platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">Select your preferred theme (Light/Dark).</p>
                    </div>
                    <ThemeToggle />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
