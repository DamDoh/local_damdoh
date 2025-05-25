
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertTriangle } from "lucide-react";
import Link from "next/link";

// Dummy data for notifications
const dummyNotifications = [
  {
    id: "notif1",
    type: "policy_update",
    title: "Privacy Policy Updated",
    message: "Our Privacy Policy has been updated. Please review the changes.",
    date: "2023-10-27",
    link: "/privacy",
    read: false,
  },
  {
    id: "notif2",
    type: "system",
    title: "New Feature: AI Assistant",
    message: "Explore our new AI Assistant for farming insights and crop diagnosis!",
    date: "2023-10-26",
    link: "/ai-assistant",
    read: true,
  },
  {
    id: "notif3",
    type: "connection_request",
    title: "New Connection Request",
    message: "AgriLogistics Co-op wants to connect with you.",
    date: "2023-10-25",
    link: "/network",
    read: false,
  },
];


export default function NotificationsPage() {
  const notifications = dummyNotifications; // Using dummy data

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Notifications</CardTitle>
          </div>
          <CardDescription>Stay updated with alerts from your network, marketplace, and platform updates.</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 border rounded-lg shadow-sm transition-colors ${
                    !notification.read ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-accent/30"
                  }`}
                >
                  <Link href={notification.link || "#"} className="block group">
                    <div className="flex items-start gap-3">
                      {notification.type === "policy_update" && <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />}
                      {notification.type !== "policy_update" && <Bell className="h-5 w-5 text-primary mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className={`text-md font-semibold group-hover:underline ${!notification.read ? 'text-primary' : ''}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">{notification.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
              <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No New Notifications</h3>
              <p className="text-muted-foreground max-w-md">
                When there's activity relevant to you—like new messages, connection requests, or important updates—you'll see it here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
