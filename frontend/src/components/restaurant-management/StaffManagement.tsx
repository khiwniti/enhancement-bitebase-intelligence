'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Calendar, 
  Clock,
  DollarSign,
  Star,
  Phone,
  Mail
} from 'lucide-react';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  hourlyRate?: number;
  salary?: number;
  performanceRating?: number;
  totalSales: number;
  weeklyHours: number;
}

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock staff data
  const staffMembers: StaffMember[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@restaurant.com',
      phone: '+1 (555) 123-4567',
      role: 'manager',
      status: 'active',
      hireDate: '2023-01-15',
      salary: 55000,
      performanceRating: 4.8,
      totalSales: 125000,
      weeklyHours: 40
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@restaurant.com',
      phone: '+1 (555) 234-5678',
      role: 'server',
      status: 'active',
      hireDate: '2023-03-20',
      hourlyRate: 18.50,
      performanceRating: 4.6,
      totalSales: 89000,
      weeklyHours: 35
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@restaurant.com',
      phone: '+1 (555) 345-6789',
      role: 'chef',
      status: 'active',
      hireDate: '2022-11-10',
      hourlyRate: 25.00,
      performanceRating: 4.9,
      totalSales: 0,
      weeklyHours: 40
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@restaurant.com',
      phone: '+1 (555) 456-7890',
      role: 'server',
      status: 'on_leave',
      hireDate: '2023-05-08',
      hourlyRate: 17.00,
      performanceRating: 4.3,
      totalSales: 45000,
      weeklyHours: 30
    }
  ];

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-[#4CAF50] text-white">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-[#6C757D] text-white">Inactive</Badge>;
      case 'on_leave':
        return <Badge className="bg-[#FF9800] text-white">On Leave</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      manager: '#74C365',
      chef: '#E23D28',
      server: '#2196F3',
      bartender: '#F4C431',
      host: '#9C27B0',
      cashier: '#FF5722'
    };
    
    return (
      <Badge 
        style={{ backgroundColor: roleColors[role as keyof typeof roleColors] || '#6C757D' }}
        className="text-white capitalize"
      >
        {role}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderStarRating = (rating?: number) => {
    if (!rating) return <span className="text-gray-400">No rating</span>;
    
    return (
      <div className="flex items-center space-x-1">
        <Star className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Staff Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your restaurant staff, schedules, and performance
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Enter the details for the new staff member.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input type="email" placeholder="john.doe@restaurant.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input placeholder="+1 (555) 123-4567" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="chef">Chef</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="bartender">Bartender</SelectItem>
                    <SelectItem value="host">Host</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
                  Add Staff Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search staff by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="chef">Chef</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="bartender">Bartender</SelectItem>
                  <SelectItem value="host">Host</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
          <CardDescription>
            Manage your restaurant staff and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Compensation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {staff.firstName} {staff.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Hired: {new Date(staff.hireDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(staff.role)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(staff.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {staff.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-1" />
                        {staff.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {renderStarRating(staff.performanceRating)}
                      {staff.totalSales > 0 && (
                        <div className="text-sm text-gray-600">
                          Sales: {formatCurrency(staff.totalSales)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {staff.salary ? formatCurrency(staff.salary) + '/year' : 
                         staff.hourlyRate ? `$${staff.hourlyRate}/hour` : 'Not set'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {staff.weeklyHours}h/week
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
