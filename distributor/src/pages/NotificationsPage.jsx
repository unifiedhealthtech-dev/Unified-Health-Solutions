// pages/NotificationsPage.js
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Clock, Check, Eye, Bell } from "lucide-react";
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from "../services/notificationsApi";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

const NotificationsPage = () => {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const { data, isLoading, refetch } = useGetNotificationsQuery({ role });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = data?.notifications || [];


  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead({ role, notificationId: id }).unwrap();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ role }).unwrap();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getTypeBadge = (type) => {
    const variants = {
      success: "success",
      error: "destructive",
      warning: "warning",
      info: "outline",
    };
    return <Badge variant={variants[type] || "outline"}>{type}</Badge>;
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading notifications...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" onClick={handleMarkAllAsRead} disabled={notifications.every(n => n.is_read)}>
          <Eye className="w-4 h-4 mr-2" /> Mark All as Read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[70vh] rounded-md border p-4">
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.notification_id}
                className={`p-4 rounded-lg border ${
                  n.is_read ? 'bg-muted/30' : 'bg-background border-primary'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{n.title}</h3>
                      {getTypeBadge(n.type)}
                      {!n.is_read && (
                        <Badge variant="secondary">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(n.notification_id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default NotificationsPage;