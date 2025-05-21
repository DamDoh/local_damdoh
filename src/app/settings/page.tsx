
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Lock, Users, SearchCheck, Save, ShieldOff } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Textarea } from "@/components/ui/textarea"; // Added Textarea import

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="text-3xl">Settings</CardTitle>
        <CardDescription>Manage your account settings, profile, and preferences.</CardDescription>
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
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information and profile visibility.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Demo Farmer" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="farmer@damdoh.com" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio">Bio / Profile Summary</Label>
                <Textarea id="bio" placeholder="Tell us about your farm, expertise, or agricultural interests..." defaultValue="Dedicated to sustainable farming and connecting with the agricultural community. Specializing in organic vegetable production and soil health improvement." className="min-h-[100px]" />
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
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
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
              <CardDescription>Choose how you want to be notified about agricultural updates and platform activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive important updates, market news, and connection requests via email.</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">New Connection Requests</p>
                  <p className="text-sm text-muted-foreground">Notify me in-app about new stakeholder connection requests.</p>
                </div>
                <Switch id="connection-requests-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Forum Mentions & Replies</p>
                  <p className="text-sm text-muted-foreground">Notify me when someone mentions me or replies to my posts in agricultural forums.</p>
                </div>
                <Switch id="forum-mentions-notifications" defaultChecked />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Marketplace Item Updates</p>
                  <p className="text-sm text-muted-foreground">Notify me about activity on my marketplace listings or saved searches.</p>
                </div>
                <Switch id="marketplace-updates-notifications" />
              </div>
              <Button><Save className="mr-2 h-4 w-4" />Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your agricultural profile and activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><User className="mr-2 h-4 w-4 text-primary" />Profile Visibility</p>
                  <p className="text-sm text-muted-foreground ml-6">Who can see your full agricultural profile details.</p>
                </div>
                <Select defaultValue="everyone">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="connections">Connections Only</SelectItem>
                        <SelectItem value="private">Only Me (Not Recommended for Networking)</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><Users className="mr-2 h-4 w-4 text-primary" />Connection Requests</p>
                  <p className="text-sm text-muted-foreground ml-6">Who can send you connection requests.</p>
                </div>
                <Select defaultValue="everyone">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="connections-of-connections">Connections of Connections</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><Users className="mr-2 h-4 w-4 text-primary" />Connections List Visibility</p>
                  <p className="text-sm text-muted-foreground ml-6">Who can see your list of connections.</p>
                </div>
                <Select defaultValue="connections">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="connections">Connections Only</SelectItem>
                        <SelectItem value="me">Only Me</SelectItem>
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
                  <p className="font-medium flex items-center"><SearchCheck className="mr-2 h-4 w-4 text-primary" />Search Engine Indexing</p>
                  <p className="text-sm text-muted-foreground ml-6">Allow search engines (e.g., Google) to link to your DamDoh profile.</p>
                </div>
                <Switch id="search-engine-indexing" defaultChecked />
              </div>
              <Button><Save className="mr-2 h-4 w-4" />Save Privacy Settings</Button>
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
