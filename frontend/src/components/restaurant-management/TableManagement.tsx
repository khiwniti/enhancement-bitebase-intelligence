'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Users, 
  Clock,
  Calendar,
  MapPin,
  Phone,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location: string;
  currentReservation?: {
    id: string;
    customerName: string;
    customerPhone: string;
    partySize: number;
    reservationTime: string;
    specialRequests?: string;
  };
}

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  tableNumber?: number;
  status: 'confirmed' | 'pending' | 'seated' | 'completed' | 'cancelled';
  specialRequests?: string;
  notes?: string;
}

export default function TableManagement() {
  const [activeView, setActiveView] = useState<'tables' | 'reservations'>('tables');
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [isAddReservationDialogOpen, setIsAddReservationDialogOpen] = useState(false);

  // Mock table data
  const tables: Table[] = [
    {
      id: '1',
      number: 1,
      capacity: 2,
      status: 'occupied',
      location: 'Main Dining',
      currentReservation: {
        id: 'r1',
        customerName: 'John Smith',
        customerPhone: '+1 (555) 123-4567',
        partySize: 2,
        reservationTime: '19:00',
        specialRequests: 'Window seat'
      }
    },
    {
      id: '2',
      number: 2,
      capacity: 4,
      status: 'available',
      location: 'Main Dining'
    },
    {
      id: '3',
      number: 3,
      capacity: 6,
      status: 'reserved',
      location: 'Private Section',
      currentReservation: {
        id: 'r2',
        customerName: 'Sarah Johnson',
        customerPhone: '+1 (555) 234-5678',
        partySize: 6,
        reservationTime: '20:30',
        specialRequests: 'Birthday celebration'
      }
    },
    {
      id: '4',
      number: 4,
      capacity: 2,
      status: 'cleaning',
      location: 'Patio'
    },
    {
      id: '5',
      number: 5,
      capacity: 8,
      status: 'available',
      location: 'Private Section'
    },
    {
      id: '6',
      number: 6,
      capacity: 4,
      status: 'occupied',
      location: 'Main Dining',
      currentReservation: {
        id: 'r3',
        customerName: 'Mike Chen',
        customerPhone: '+1 (555) 345-6789',
        partySize: 4,
        reservationTime: '18:30'
      }
    }
  ];

  // Mock reservation data
  const reservations: Reservation[] = [
    {
      id: 'r1',
      customerName: 'John Smith',
      customerPhone: '+1 (555) 123-4567',
      customerEmail: 'john.smith@email.com',
      partySize: 2,
      reservationDate: '2024-01-25',
      reservationTime: '19:00',
      tableNumber: 1,
      status: 'seated',
      specialRequests: 'Window seat'
    },
    {
      id: 'r2',
      customerName: 'Sarah Johnson',
      customerPhone: '+1 (555) 234-5678',
      customerEmail: 'sarah.johnson@email.com',
      partySize: 6,
      reservationDate: '2024-01-25',
      reservationTime: '20:30',
      tableNumber: 3,
      status: 'confirmed',
      specialRequests: 'Birthday celebration',
      notes: 'Requested chocolate cake'
    },
    {
      id: 'r4',
      customerName: 'Emily Rodriguez',
      customerPhone: '+1 (555) 456-7890',
      customerEmail: 'emily.rodriguez@email.com',
      partySize: 4,
      reservationDate: '2024-01-25',
      reservationTime: '21:00',
      status: 'pending'
    },
    {
      id: 'r5',
      customerName: 'David Wilson',
      customerPhone: '+1 (555) 567-8901',
      customerEmail: 'david.wilson@email.com',
      partySize: 2,
      reservationDate: '2024-01-26',
      reservationTime: '19:30',
      status: 'confirmed'
    }
  ];

  const getTableStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-[#4CAF50] text-white">Available</Badge>;
      case 'occupied':
        return <Badge className="bg-[#E23D28] text-white">Occupied</Badge>;
      case 'reserved':
        return <Badge className="bg-[#F4C431] text-white">Reserved</Badge>;
      case 'cleaning':
        return <Badge className="bg-[#6C757D] text-white">Cleaning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReservationStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-[#4CAF50] text-white">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-[#FF9800] text-white">Pending</Badge>;
      case 'seated':
        return <Badge className="bg-[#2196F3] text-white">Seated</Badge>;
      case 'completed':
        return <Badge className="bg-[#6C757D] text-white">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-[#E23D28] text-white">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLocationBadge = (location: string) => {
    const locationColors = {
      'Main Dining': '#74C365',
      'Private Section': '#E23D28',
      'Patio': '#F4C431',
      'Bar Area': '#2196F3'
    };
    
    return (
      <Badge 
        style={{ backgroundColor: locationColors[location as keyof typeof locationColors] || '#6C757D' }}
        className="text-white"
      >
        {location}
      </Badge>
    );
  };

  const tableStats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length
  };

  const reservationStats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    today: reservations.filter(r => r.reservationDate === '2024-01-25').length
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Table Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage table layouts, reservations, and seating arrangements
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={activeView === 'tables' ? 'default' : 'outline'}
            onClick={() => setActiveView('tables')}
            className={activeView === 'tables' ? 'bg-[#74C365] hover:bg-[#65B356] text-white' : ''}
          >
            Tables
          </Button>
          <Button 
            variant={activeView === 'reservations' ? 'default' : 'outline'}
            onClick={() => setActiveView('reservations')}
            className={activeView === 'reservations' ? 'bg-[#74C365] hover:bg-[#65B356] text-white' : ''}
          >
            Reservations
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {activeView === 'tables' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-[#74C365]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tables</p>
                  <p className="text-2xl font-bold text-gray-900">{tableStats.total}</p>
                </div>
                <MapPin className="h-8 w-8 text-[#74C365]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#4CAF50]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{tableStats.available}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-[#4CAF50]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#E23D28]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-gray-900">{tableStats.occupied}</p>
                </div>
                <XCircle className="h-8 w-8 text-[#E23D28]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#F4C431]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reserved</p>
                  <p className="text-2xl font-bold text-gray-900">{tableStats.reserved}</p>
                </div>
                <Calendar className="h-8 w-8 text-[#F4C431]" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-[#74C365]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                  <p className="text-2xl font-bold text-gray-900">{reservationStats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-[#74C365]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#4CAF50]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{reservationStats.confirmed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-[#4CAF50]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#FF9800]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{reservationStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-[#FF9800]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#2196F3]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-gray-900">{reservationStats.today}</p>
                </div>
                <Calendar className="h-8 w-8 text-[#2196F3]" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tables View */}
      {activeView === 'tables' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Restaurant Tables</CardTitle>
                <CardDescription>
                  Current table status and seating arrangements
                </CardDescription>
              </div>
              <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Table
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Table</DialogTitle>
                    <DialogDescription>
                      Configure a new table for your restaurant.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Table Number</label>
                        <Input type="number" placeholder="7" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Capacity</label>
                        <Input type="number" placeholder="4" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main_dining">Main Dining</SelectItem>
                          <SelectItem value="private_section">Private Section</SelectItem>
                          <SelectItem value="patio">Patio</SelectItem>
                          <SelectItem value="bar_area">Bar Area</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAddTableDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
                        Add Table
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <Card key={table.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">Table {table.number}</h3>
                        {getTableStatusBadge(table.status)}
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        Capacity: {table.capacity} guests
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {getLocationBadge(table.location)}
                      </div>
                      
                      {table.currentReservation && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-900">
                            {table.currentReservation.customerName}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {table.currentReservation.reservationTime}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-3 w-3 mr-1" />
                            Party of {table.currentReservation.partySize}
                          </div>
                          {table.currentReservation.specialRequests && (
                            <div className="text-sm text-gray-600 mt-1">
                              Note: {table.currentReservation.specialRequests}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      {table.status === 'available' && (
                        <Button size="sm" className="flex-1 bg-[#74C365] hover:bg-[#65B356] text-white">
                          Seat Guests
                        </Button>
                      )}
                      {table.status === 'occupied' && (
                        <Button size="sm" variant="outline" className="flex-1">
                          Clear Table
                        </Button>
                      )}
                      {table.status === 'reserved' && (
                        <Button size="sm" className="flex-1 bg-[#2196F3] hover:bg-[#1976D2] text-white">
                          Check In
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reservations View */}
      {activeView === 'reservations' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Reservations</CardTitle>
                <CardDescription>
                  Manage customer reservations and bookings
                </CardDescription>
              </div>
              <Dialog open={isAddReservationDialogOpen} onOpenChange={setIsAddReservationDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Reservation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>New Reservation</DialogTitle>
                    <DialogDescription>
                      Create a new reservation for a customer.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Customer Name</label>
                      <Input placeholder="John Smith" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <Input placeholder="+1 (555) 123-4567" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Party Size</label>
                        <Input type="number" placeholder="4" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Date</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Time</label>
                        <Input type="time" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Special Requests</label>
                      <Input placeholder="Window seat, birthday celebration..." />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAddReservationDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
                        Create Reservation
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{reservation.customerName}</h3>
                          {getReservationStatusBadge(reservation.status)}
                          {reservation.tableNumber && (
                            <Badge variant="outline">Table {reservation.tableNumber}</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {reservation.customerPhone}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(reservation.reservationDate).toLocaleDateString()} at {reservation.reservationTime}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Party of {reservation.partySize}
                          </div>
                        </div>
                        
                        {reservation.specialRequests && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Special Requests:</strong> {reservation.specialRequests}
                          </div>
                        )}
                        
                        {reservation.notes && (
                          <div className="mt-1 text-sm text-gray-600">
                            <strong>Notes:</strong> {reservation.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {reservation.status === 'confirmed' && (
                          <Button size="sm" className="bg-[#2196F3] hover:bg-[#1976D2] text-white">
                            Seat Now
                          </Button>
                        )}
                        {reservation.status === 'pending' && (
                          <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45A049] text-white">
                            Confirm
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
