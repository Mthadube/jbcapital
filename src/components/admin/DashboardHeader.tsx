import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Bell, HelpCircle, User, Settings, LogOut } from "lucide-react";
import { useAppData } from "@/utils/AppDataContext";

interface DashboardHeaderProps {
  sidebarToggle?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ sidebarToggle = () => {} }) => {
  const { currentUser: user, logout } = useAppData();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const getUserFullName = (user: any): string => {
    return user ? `${user.firstName} ${user.lastName}` : 'Admin User';
  };
  
  return (
    <header className="bg-gradient-to-r from-white to-blue-50 border-b border-blue-100 py-3 px-4 backdrop-blur-sm shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={sidebarToggle} 
            className="hover:bg-blue-100 text-blue-600"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center shadow-sm border border-blue-100">
              <img src="/icon.png" alt="JB Capital" className="h-7 w-7" />
            </div>
            <div className="hidden md:flex md:flex-col">
              <div className="font-medium text-blue-950">JB Capital Admin</div>
              <div className="text-xs text-muted-foreground">Dashboard</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="hover:bg-blue-100 text-blue-600">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hover:bg-blue-100 text-blue-600">
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <div className="font-medium text-blue-950">{getUserFullName(user)}</div>
              <div className="text-xs text-muted-foreground">{user?.email || 'admin@jbcapital.com'}</div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer bg-gradient-to-tr from-blue-600 to-blue-800 hover:shadow-md transition-shadow border-2 border-white">
                  <AvatarFallback className="text-white font-medium">
                    {user ? getInitials(user.firstName, user.lastName) : 'AD'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="flex items-center gap-2 p-2 border-b border-blue-100 mb-2">
                  <Avatar className="h-9 w-9 bg-gradient-to-tr from-blue-600 to-blue-800">
                    <AvatarFallback className="text-white">
                      {user ? getInitials(user.firstName, user.lastName) : 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{getUserFullName(user)}</div>
                    <div className="text-xs text-muted-foreground">{user?.email || 'admin@jbcapital.com'}</div>
                  </div>
                </div>
                
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-blue-100" />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
