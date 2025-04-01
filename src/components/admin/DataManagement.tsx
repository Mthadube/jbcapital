import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Server, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/utils/AppDataContext";
import * as api from "@/utils/api";

const DataManagement = () => {
  const { migrateInitialData, refreshData, isLoading } = useAppData();
  const [isMigrating, setIsMigrating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  // Handle migration
  const handleMigrateData = async () => {
    try {
      setIsMigrating(true);
      const success = await migrateInitialData();
      
      if (success) {
        toast.success("Data migration completed successfully");
      } else {
        toast.error("Data migration failed");
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("An error occurred during migration");
    } finally {
      setIsMigrating(false);
    }
  };

  // Handle refresh
  const handleRefreshData = async () => {
    try {
      toast.info("Refreshing data from database...");
      await refreshData();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("An error occurred while refreshing data");
    }
  };

  // Check server status
  const checkServerStatus = async () => {
    try {
      setIsChecking(true);
      setServerStatus('unknown');
      
      const response = await api.checkHealth();
      
      if (response.success) {
        setServerStatus('online');
        toast.success(`MongoDB server is online. Server time: ${response.data?.time}`);
      } else {
        setServerStatus('offline');
        toast.error(`Failed to connect to MongoDB server: ${response.error}`);
      }
    } catch (error) {
      console.error("Server check error:", error);
      setServerStatus('offline');
      toast.error("Failed to connect to MongoDB server");
    } finally {
      setIsChecking(false);
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (serverStatus) {
      case 'online':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Online</span>;
      case 'offline':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Offline</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Database Management</span>
        </CardTitle>
        <CardDescription>
          Manage your MongoDB database connection and data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-md bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Server className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium">MongoDB Server Status</h3>
                <p className="text-xs text-muted-foreground">Connection to your cloud database</p>
              </div>
            </div>
            <div>
              {getStatusBadge()}
            </div>
          </div>
          <Button 
            onClick={checkServerStatus} 
            disabled={isChecking}
            variant="outline" 
            size="sm"
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Connection
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Data Operations</h3>
          <p className="text-xs text-muted-foreground">
            Refresh data from the database or migrate initial data
          </p>
          <div className="flex space-x-2 mt-2">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={handleRefreshData}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </>
              )}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isMigrating}>
                  {isMigrating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Migrate Data
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Migrate Data to MongoDB</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear your MongoDB database and migrate all data from the initial mock data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleMigrateData}>
                    <Shield className="mr-2 h-4 w-4" />
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>MongoDB Connection: {process.env.MONGODB_URI || "Using environment variables"}</p>
      </CardFooter>
    </Card>
  );
};

export default DataManagement; 