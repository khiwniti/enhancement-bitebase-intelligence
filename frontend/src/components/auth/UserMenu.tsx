"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, HelpCircle, LogOut, LayoutDashboard, CreditCard } from "lucide-react";

// Mock user data for demo purposes
const mockUser = {
  id: 1,
  email: "user@bitebase.com",
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  role: "restaurant_owner",
  subscription_tier: "pro"
};

export function UserMenu() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Use mock user for now - in production this would use the auth context
  const user = mockUser;
  const signOut = async () => {
    
  };

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : "U";
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      restaurant_owner: "Restaurant Owner",
      new_entrepreneur: "New Entrepreneur",
      existing_owner: "Existing Owner",
      franchise_operator: "Franchise Operator",
      organization: "Organization",
      admin: "Administrator",
    };
    return roleMap[role] || role;
  };

  const getSubscriptionBadge = (tier?: string) => {
    const tierMap: Record<string, { label: string; color: string }> = {
      basic: { label: "Basic", color: "bg-gray-500" },
      FREE: { label: "Free", color: "bg-gray-500" },
      BASIC: { label: "Basic", color: "bg-gray-500" },
      pro: { label: "Pro", color: "bg-blue-500" },
      PROFESSIONAL: { label: "Professional", color: "bg-blue-500" },
      enterprise: { label: "Enterprise", color: "bg-purple-500" },
      ENTERPRISE: { label: "Enterprise", color: "bg-purple-500" },
    };
    
    const subscription = tierMap[tier || "basic"] || tierMap["basic"];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${subscription.color}`}>
        {subscription.label}
      </span>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <div className="flex h-full w-full items-center justify-center bg-primary-600 text-white font-medium">
              {getInitials(user.name, user.email)}
            </div>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">
                {user.name || user.email.split("@")[0]}
              </p>
              {getSubscriptionBadge(user.subscription_tier)}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {getRoleDisplay(user.role)}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push("/billing")}>
          <CreditCard className="mr-2 h-4 w-4" />
          Billing
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push("/help")}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help & Support
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={isLoading ? undefined : handleSignOut}
          className={`text-red-600 focus:text-red-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoading ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
