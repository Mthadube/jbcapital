import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, Bell, Volume2, VolumeX, Mail, 
  Smartphone, Shield, UserCircle, Key, Clock
} from "lucide-react";
import { useAppData } from "@/utils/AppDataContext";
import { toast } from "sonner";

export function UserSettings() {
  const { 
    notificationSettings, 
    updateNotificationSettings,
    addNotification
  } = useAppData();
  
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
  
  // Send test notification
  const sendTestNotification = () => {
    addNotification({
      id: `test-${Date.now()}`,
      userId: undefined, // Will be set to current user
      title: "Test Notification",
      message: "This is a test notification to verify your settings",
      type: "system",
      date: new Date().toISOString(),
      read: false,
      importance: "medium",
      link: "/dashboard/settings"
    });
  };
  
  return (
    <Tabs defaultValue="notifications" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          <span>Profile</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Security</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how you receive notifications about your account activity
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
                  onClick={sendTestNotification}
                  className="w-full"
                >
                  Test Notification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="profile" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Profile settings are managed on the Profile tab of your dashboard.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your account security and login preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Security settings coming soon.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 