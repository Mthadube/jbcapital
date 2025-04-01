import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, BellOff, Check, CheckCheck, Clock, Settings, Trash2, Volume2, VolumeX, XCircle,
  MessageSquare, FileText, AlertCircle, DollarSign, BadgeCheck, PieChart, User
} from "lucide-react";
import { useAppData } from "@/utils/AppDataContext";
import type { Notification } from "@/utils/AppDataContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    notificationSettings,
    updateNotificationSettings
  } = useAppData();
  
  const [activeTab, setActiveTab] = useState("all");
  const [requestedPermission, setRequestedPermission] = useState(false);
  
  // Request browser notification permission if enabled
  useEffect(() => {
    if (notificationSettings.browserNotificationsEnabled && !requestedPermission) {
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
        setRequestedPermission(true);
      }
    }
  }, [notificationSettings.browserNotificationsEnabled, requestedPermission]);
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "high") return notification.importance === "high";
    if (activeTab === "medium") return notification.importance === "medium";
    if (activeTab === "low") return notification.importance === "low";
    return true;
  });
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "document":
        return <FileText className="h-5 w-5 text-teal-500" />;
      case "payment":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "user":
        return <User className="h-5 w-5 text-purple-500" />;
      case "system":
        return <PieChart className="h-5 w-5 text-gray-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-primary" />;
    }
  };
  
  // Get notification priority badge color
  const getPriorityBadge = (importance: string) => {
    switch (importance) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Toggle sound notifications
  const toggleSoundNotifications = () => {
    updateNotificationSettings({
      soundEnabled: !notificationSettings.soundEnabled
    });
    
    toast.success(
      notificationSettings.soundEnabled 
        ? "Sound notifications disabled" 
        : "Sound notifications enabled"
    );
  };
  
  // Toggle browser notifications
  const toggleBrowserNotifications = () => {
    const newValue = !notificationSettings.browserNotificationsEnabled;
    
    // Request permission if enabling
    if (newValue && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          updateNotificationSettings({
            browserNotificationsEnabled: true
          });
          toast.success("Browser notifications enabled");
        } else {
          toast.error("Browser notification permission denied");
          updateNotificationSettings({
            browserNotificationsEnabled: false
          });
        }
      });
    } else {
      updateNotificationSettings({
        browserNotificationsEnabled: newValue
      });
      
      toast.success(
        newValue 
          ? "Browser notifications enabled" 
          : "Browser notifications disabled"
      );
    }
  };
  
  // Toggle email notifications
  const toggleEmailNotifications = () => {
    updateNotificationSettings({
      emailNotificationsEnabled: !notificationSettings.emailNotificationsEnabled
    });
    
    toast.success(
      notificationSettings.emailNotificationsEnabled 
        ? "Email notifications disabled" 
        : "Email notifications enabled"
    );
  };
  
  // Update volume
  const handleVolumeChange = (value: number[]) => {
    updateNotificationSettings({
      soundVolume: value[0]
    });
  };
  
  // Create a test notification
  const createTestNotification = () => {
    // Generate test notification
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      title: "Test Notification",
      message: "This is a test notification to check your settings",
      type: "system",
      date: new Date().toISOString(),
      read: false,
      importance: "medium"
    };
    
    // Add the notification to the context
    const { addNotification } = useAppData();
    addNotification(testNotification);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Notification Center</h2>
          <p className="text-muted-foreground">Manage system notifications and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsAsRead}
            disabled={unreadNotificationsCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearNotifications}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              All <Badge variant="outline" className="ml-2">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Unread <Badge variant="outline" className="ml-2">{unreadNotificationsCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="high" className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              High Priority
            </TabsTrigger>
          </TabsList>
          
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("settings")}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                        notification.read 
                          ? "bg-muted/40" 
                          : "bg-primary/5 border border-primary/10"
                      }`}
                    >
                      <div className="rounded-full p-2 bg-background">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium leading-none">{notification.title}</h4>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(notification.importance)}
                            <Badge variant="outline" className="font-mono text-xs">
                              {formatDate(notification.date)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-end mt-2 gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark as Read
                            </Button>
                          )}
                          {notification.link && (
                            <Button variant="link" size="sm" asChild>
                              <a href={notification.link}>View Details</a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <BellOff className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium text-lg">No Notifications</h3>
                  <p className="text-muted-foreground">
                    You don't have any notifications at the moment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unread" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="flex items-start gap-4 p-3 rounded-lg bg-primary/5 border border-primary/10"
                    >
                      <div className="rounded-full p-2 bg-background">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium leading-none">{notification.title}</h4>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(notification.importance)}
                            <Badge variant="outline" className="font-mono text-xs">
                              {formatDate(notification.date)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-end mt-2 gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Mark as Read
                          </Button>
                          {notification.link && (
                            <Button variant="link" size="sm" asChild>
                              <a href={notification.link}>View Details</a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <CheckCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium text-lg">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    You have no unread notifications
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="high" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                        notification.read 
                          ? "bg-muted/40" 
                          : "bg-primary/5 border border-primary/10"
                      }`}
                    >
                      <div className="rounded-full p-2 bg-background">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium leading-none">{notification.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">High</Badge>
                            <Badge variant="outline" className="font-mono text-xs">
                              {formatDate(notification.date)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-end mt-2 gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark as Read
                            </Button>
                          )}
                          {notification.link && (
                            <Button variant="link" size="sm" asChild>
                              <a href={notification.link}>View Details</a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium text-lg">No High Priority Alerts</h3>
                  <p className="text-muted-foreground">
                    You have no high priority notifications at the moment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Sound Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sounds when new notifications arrive
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.soundEnabled} 
                      onCheckedChange={toggleSoundNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show desktop notifications even when the app is in background
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.browserNotificationsEnabled} 
                      onCheckedChange={toggleBrowserNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send important notifications to your email
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotificationsEnabled} 
                      onCheckedChange={toggleEmailNotifications}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Sound Settings</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="volume">Volume</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(notificationSettings.soundVolume * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        id="volume"
                        defaultValue={[notificationSettings.soundVolume]}
                        max={1}
                        step={0.1}
                        value={[notificationSettings.soundVolume]}
                        onValueChange={handleVolumeChange}
                        className="flex-1"
                      />
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={createTestNotification}
                    className="w-full"
                  >
                    Test Notification Sound
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
