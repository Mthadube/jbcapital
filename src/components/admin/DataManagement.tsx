import React, { useState, useEffect } from "react";
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
import { 
  RefreshCw, 
  Database, 
  Server, 
  Shield, 
  Download, 
  Upload, 
  BarChart3, 
  FileJson, 
  Trash2, 
  Search,
  User,
  FileText,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/utils/AppDataContext";
import * as api from "@/utils/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDatabaseStats, getCollectionData, runDatabaseCleanup, backupDatabase, restoreDatabase } from "@/utils/api";

const DataManagement = () => {
  const { migrateInitialData, refreshData, isLoading, users, loans, applications, documents } = useAppData();
  const [isMigrating, setIsMigrating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>("users");
  const [dbStats, setDbStats] = useState({
    dbSize: "Calculating...",
    collections: 4,
    totalDocuments: users.length + loans.length + applications.length + documents.length,
    lastBackup: "Never"
  });
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch database statistics on component mount
  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  // Fetch database statistics
  const fetchDatabaseStats = async () => {
    try {
      const response = await getDatabaseStats();
      if (response.success && response.data) {
        setDbStats({
          dbSize: formatBytes(response.data.dbSize),
          collections: response.data.collections,
          totalDocuments: response.data.totalDocuments,
          lastBackup: response.data.lastBackup || "Never"
        });
      }
    } catch (error) {
      console.error("Error fetching database stats:", error);
    }
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Load collection data
  const loadCollectionData = async () => {
    setIsLoadingCollection(true);
    try {
      const response = await getCollectionData(selectedCollection, currentPage, 10);
      if (response.success && response.data) {
        setCollectionData(response.data.data);
        setTotalPages(response.data.pages);
        setTotalItems(response.data.total);
      } else {
        toast.error("Failed to load collection data");
      }
    } catch (error) {
      console.error("Error loading collection data:", error);
      toast.error("Error loading collection data");
    } finally {
      setIsLoadingCollection(false);
    }
  };

  // Update collection data when selectedCollection or currentPage changes
  useEffect(() => {
    loadCollectionData();
  }, [selectedCollection, currentPage]);

  // Handle database cleanup
  const handleDatabaseCleanup = async () => {
    try {
      const response = await runDatabaseCleanup();
      if (response.success) {
        toast.success(`Database cleanup completed: ${response.data?.removedDocuments || 0} documents removed`);
        fetchDatabaseStats();
      } else {
        toast.error("Database cleanup failed");
      }
    } catch (error) {
      console.error("Error during database cleanup:", error);
      toast.error("Error during database cleanup");
    }
  };

  // Handle database backup
  const handleBackupDatabase = async () => {
    setIsExporting(true);
    try {
      const response = await backupDatabase();
      if (response.success) {
        toast.success(`Database backup created: ${response.data?.backupId}`);
        fetchDatabaseStats();
        setDbStats({
          ...dbStats,
          lastBackup: new Date().toLocaleString()
        });
      } else {
        toast.error("Database backup failed");
      }
    } catch (error) {
      console.error("Error during database backup:", error);
      toast.error("Error during database backup");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle database import/restore
  const handleImportDatabase = async () => {
    setIsImporting(true);
    try {
      // This is a simplified version. In a real app, you would select a backup ID
      const backupId = "latest"; 
      const response = await restoreDatabase(backupId);
      if (response.success) {
        toast.success("Database restored successfully");
        refreshData();
        fetchDatabaseStats();
      } else {
        toast.error("Database restore failed");
      }
    } catch (error) {
      console.error("Error during database restore:", error);
      toast.error("Error during database restore");
    } finally {
      setIsImporting(false);
    }
  };

  // Helper function to render collection data
  const renderCollectionData = () => {
    if (isLoadingCollection) {
      return (
        <div className="text-center py-10">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading collection data...</p>
        </div>
      );
    }

    if (collectionData.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
          <p>No documents found in this collection</p>
        </div>
      );
    }

    return (
      <div className="overflow-auto max-h-96">
        <Table>
          <TableHeader>
            <TableRow>
              {collectionData[0] && Object.keys(collectionData[0]).slice(0, 4).map(key => (
                <TableHead key={key}>{key}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collectionData.map((item, index) => (
              <TableRow key={index}>
                {Object.keys(item).slice(0, 4).map(key => (
                  <TableCell key={key}>
                    {typeof item[key] === 'object' 
                      ? JSON.stringify(item[key]).substring(0, 50) + '...' 
                      : String(item[key]).substring(0, 50)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {collectionData.length} of {totalItems} items
          </p>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  };

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

  // Get collection count
  const getCollectionCount = (collection: string) => {
    switch (collection) {
      case "users":
        return users.length;
      case "loans":
        return loans.length;
      case "applications":
        return applications.length;
      case "documents":
        return documents.length;
      default:
        return 0;
    }
  };

  // Get collection icon
  const getCollectionIcon = (collection: string) => {
    switch (collection) {
      case "users":
        return <User className="h-4 w-4" />;
      case "loans":
        return <Wallet className="h-4 w-4" />;
      case "applications":
        return <FileText className="h-4 w-4" />;
      case "documents":
        return <FileJson className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
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
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
              <TabsTrigger value="explorer">Data Explorer</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 pt-4">
              {/* Server Status Section */}
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

              {/* Database Statistics */}
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
                  Database Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Database Size</p>
                    <p className="text-sm font-medium">{dbStats.dbSize}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Collections</p>
                    <p className="text-sm font-medium">{dbStats.collections}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Documents</p>
                    <p className="text-sm font-medium">{dbStats.totalDocuments}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Backup</p>
                    <p className="text-sm font-medium">{dbStats.lastBackup}</p>
                  </div>
                </div>
              </div>
              
              {/* Collection Overview */}
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                  Collections Overview
                </h3>
                <div className="space-y-3">
                  {["users", "loans", "applications", "documents"].map((collection) => (
                    <div key={collection} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {getCollectionIcon(collection)}
                          <span className="ml-2 text-sm capitalize">{collection}</span>
                        </div>
                        <span className="text-xs font-medium">{getCollectionCount(collection)} documents</span>
                      </div>
                      <Progress value={(getCollectionCount(collection) / dbStats.totalDocuments) * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="backup" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Export Section */}
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                    Export Database
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Create a backup of your database on MongoDB Atlas
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBackupDatabase}
                    disabled={isExporting}
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating Backup...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Create Backup
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Import Section */}
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                    Restore Database
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Restore data from a previous database backup
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={isImporting}
                        className="w-full"
                      >
                        {isImporting ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Restoring...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Restore Data
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Restore Database</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will replace all existing data with the backup data.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImportDatabase}>
                          <Upload className="mr-2 h-4 w-4" />
                          Restore
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              {/* Schedule Backup */}
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                  Backup Schedule
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  View your current MongoDB Atlas backup schedule
                </p>
                <div className="bg-muted/20 p-3 rounded-md">
                  <p className="text-xs mb-2">
                    <span className="font-medium">Current Backup Schedule:</span> Daily at 2:00 AM UTC
                  </p>
                  <p className="text-xs mb-2">
                    <span className="font-medium">Retention Policy:</span> 7 days
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MongoDB Atlas handles automatic backups based on your cluster's configuration
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="explorer" className="space-y-4 pt-4">
              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    Data Explorer
                  </h3>
                  <select 
                    className="px-2 py-1 border rounded-md text-sm"
                    value={selectedCollection}
                    onChange={(e) => {
                      setSelectedCollection(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="users">Users</option>
                    <option value="loans">Loans</option>
                    <option value="applications">Applications</option>
                    <option value="documents">Documents</option>
                  </select>
                </div>
                <div className="bg-muted/10 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium">
                      {selectedCollection.charAt(0).toUpperCase() + selectedCollection.slice(1)} Collection
                    </p>
          <p className="text-xs text-muted-foreground">
                      {getCollectionCount(selectedCollection)} documents total
                    </p>
                  </div>
                  {renderCollectionData()}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="maintenance" className="space-y-4 pt-4">
              {/* Data Operations */}
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                  Data Operations
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
            Refresh data from the database or migrate initial data
          </p>
                <div className="flex space-x-2">
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
              
              {/* Database Cleanup */}
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Trash2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  Database Cleanup
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Remove redundant data and optimize database performance
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-500 border-red-200">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Run Database Cleanup
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Database Cleanup</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove redundant data and optimize your database.
                        Make sure to back up your data before proceeding.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDatabaseCleanup}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Run Cleanup
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              {/* Connection Information */}
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Server className="h-4 w-4 mr-2 text-muted-foreground" />
                  MongoDB Connection
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Your MongoDB Atlas connection information
                </p>
                <div className="bg-muted/20 p-3 rounded-md">
                  <p className="text-xs mb-2">
                    <span className="font-medium">Cluster:</span> Cluster0
                  </p>
                  <p className="text-xs mb-2">
                    <span className="font-medium">Database:</span> jbcapital
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connection string: mongodb+srv://[username]:[password]@cluster0.hagnbde.mongodb.net/
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
          <p>MongoDB Connection: {"mongodb://localhost:27017/jbcapital"}</p>
      </CardFooter>
    </Card>
    </div>
  );
};

export default DataManagement; 