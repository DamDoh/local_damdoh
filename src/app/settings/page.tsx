
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Lock, Users, SearchCheck, Save, ShieldOff } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle"; // Added import

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
                  <Input id="name" defaultValue="Demo User" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="user@damdoh.com" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself" defaultValue="Passionate about agriculture and technology." />
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
              <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email.</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">New Connection Requests</p>
                  <p className="text-sm text-muted-foreground">Notify me about new connection requests.</p>
                </div>
                <Switch id="connection-requests-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Forum Mentions</p>
                  <p className="text-sm text-muted-foreground">Notify me when someone mentions me in a forum.</p>
                </div>
                <Switch id="forum-mentions-notifications" />
              </div>
              <Button><Save className="mr-2 h-4 w-4" />Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your information and activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><User className="mr-2 h-4 w-4 text-primary" />Profile Visibility</p>
                  <p className="text-sm text-muted-foreground ml-6">Who can see your full profile.</p>
                </div>
                <Select defaultValue="everyone">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="connections">Connections Only</SelectItem>
                        <SelectItem value="private">Only Me</SelectItem>
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
                  <p className="text-sm text-muted-foreground ml-6">Let others see when you are online.</p>
                </div>
                <Switch id="activity-status" defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><SearchCheck className="mr-2 h-4 w-4 text-primary" />Search Engine Indexing</p>
                  <p className="text-sm text-muted-foreground ml-6">Allow search engines (e.g., Google) to link to your profile.</p>
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
              <CardDescription>Customize the look and feel of the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">Select your preferred theme.</p>
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

