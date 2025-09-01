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
  Clock,
  DollarSign,
  Users,
  ChefHat,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  tableNumber: number;
  customerName?: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  orderTime: string;
  estimatedReadyTime?: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  serverName: string;
  specialInstructions?: string;
}

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock order data
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      tableNumber: 5,
      customerName: 'John Smith',
      items: [
        { id: '1', name: 'Grilled Salmon', quantity: 1, unitPrice: 28.00 },
        { id: '2', name: 'Caesar Salad', quantity: 1, unitPrice: 14.00 },
        { id: '3', name: 'Red Wine', quantity: 2, unitPrice: 12.00 }
      ],
      status: 'preparing',
      orderTime: '2024-01-25T18:30:00',
      estimatedReadyTime: '2024-01-25T19:00:00',
      totalAmount: 66.00,
      paymentStatus: 'pending',
      serverName: 'Sarah Johnson',
      specialInstructions: 'No onions in salad'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      tableNumber: 3,
      customerName: 'Emily Rodriguez',
      items: [
        { id: '4', name: 'Margherita Pizza', quantity: 2, unitPrice: 18.00 },
        { id: '5', name: 'Garlic Bread', quantity: 1, unitPrice: 8.00 },
        { id: '6', name: 'Soft Drinks', quantity: 3, unitPrice: 4.00 }
      ],
      status: 'ready',
      orderTime: '2024-01-25T19:15:00',
      estimatedReadyTime: '2024-01-25T19:45:00',
      totalAmount: 56.00,
      paymentStatus: 'pending',
      serverName: 'Mike Chen'
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      tableNumber: 8,
      items: [
        { id: '7', name: 'Beef Steak', quantity: 1, unitPrice: 35.00, specialInstructions: 'Medium rare' },
        { id: '8', name: 'Mashed Potatoes', quantity: 1, unitPrice: 8.00 },
        { id: '9', name: 'Beer', quantity: 2, unitPrice: 6.00 }
      ],
      status: 'pending',
      orderTime: '2024-01-25T19:45:00',
      totalAmount: 55.00,
      paymentStatus: 'pending',
      serverName: 'Sarah Johnson'
    },
    {
      id: '4',
      orderNumber: 'ORD-004',
      tableNumber: 12,
      customerName: 'David Wilson',
      items: [
        { id: '10', name: 'Chicken Pasta', quantity: 1, unitPrice: 22.00 },
        { id: '11', name: 'House Salad', quantity: 1, unitPrice: 12.00 }
      ],
      status: 'completed',
      orderTime: '2024-01-25T17:30:00',
      totalAmount: 34.00,
      paymentStatus: 'paid',
      serverName: 'Mike Chen'
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.tableNumber.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-[#FF9800] text-white">Pending</Badge>;
      case 'preparing':
        return <Badge className="bg-[#2196F3] text-white">Preparing</Badge>;
      case 'ready':
        return <Badge className="bg-[#4CAF50] text-white">Ready</Badge>;
      case 'served':
        return <Badge className="bg-[#74C365] text-white">Served</Badge>;
      case 'completed':
        return <Badge className="bg-[#6C757D] text-white">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-[#E23D28] text-white">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-[#FF9800] text-[#FF9800]">Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="border-[#4CAF50] text-[#4CAF50]">Paid</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="border-[#E23D28] text-[#E23D28]">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeDifference = (orderTime: string, readyTime?: string) => {
    const order = new Date(orderTime);
    const ready = readyTime ? new Date(readyTime) : new Date();
    const diffMinutes = Math.floor((ready.getTime() - order.getTime()) / (1000 * 60));
    return diffMinutes;
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalAmount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Order Management
          </h2>
          <p className="text-gray-600 mt-1">
            Track orders, manage kitchen workflow, and monitor service
          </p>
        </div>
        <Dialog open={isAddOrderDialogOpen} onOpenChange={setIsAddOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Start a new order for a table.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Table Number</label>
                  <Input type="number" placeholder="5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Server</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select server" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="mike">Mike Chen</SelectItem>
                      <SelectItem value="emily">Emily Rodriguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Customer Name (Optional)</label>
                <Input placeholder="John Smith" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Special Instructions</label>
                <Input placeholder="Any special requests..." />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOrderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
                  Create Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-[#74C365]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-[#74C365]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FF9800]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-[#FF9800]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#2196F3]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Preparing</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.preparing}</p>
              </div>
              <ChefHat className="h-8 w-8 text-[#2196F3]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.ready}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-[#4CAF50]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#E23D28]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(orderStats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-[#E23D28]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number, customer, or table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Current orders and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const timeDiff = getTimeDifference(order.orderTime, order.estimatedReadyTime);
                const isOverdue = order.estimatedReadyTime && new Date() > new Date(order.estimatedReadyTime);
                
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{order.orderNumber}</div>
                        {order.customerName && (
                          <div className="text-sm text-gray-500">{order.customerName}</div>
                        )}
                        <div className="text-sm text-gray-500">Server: {order.serverName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="font-medium">Table {order.tableNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="text-sm">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(order.status)}
                        {isOverdue && order.status !== 'completed' && (
                          <div className="flex items-center text-sm text-red-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          Ordered: {formatTime(order.orderTime)}
                        </div>
                        {order.estimatedReadyTime && (
                          <div className="text-sm text-gray-500">
                            Ready: {formatTime(order.estimatedReadyTime)}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {timeDiff} min ago
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {order.status === 'pending' && (
                          <Button size="sm" className="bg-[#2196F3] hover:bg-[#1976D2] text-white">
                            Start
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45A049] text-white">
                            Serve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription>
                Complete order information and items
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Order Information</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Table: {selectedOrder.tableNumber}</div>
                    <div>Customer: {selectedOrder.customerName || 'Walk-in'}</div>
                    <div>Server: {selectedOrder.serverName}</div>
                    <div>Order Time: {formatTime(selectedOrder.orderTime)}</div>
                    {selectedOrder.estimatedReadyTime && (
                      <div>Ready Time: {formatTime(selectedOrder.estimatedReadyTime)}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <div className="space-y-2">
                    {getStatusBadge(selectedOrder.status)}
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.specialInstructions && (
                              <div className="text-sm text-gray-500">
                                Note: {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end mt-4">
                  <div className="text-lg font-bold">
                    Total: {formatCurrency(selectedOrder.totalAmount)}
                  </div>
                </div>
              </div>
              
              {selectedOrder.specialInstructions && (
                <div>
                  <h4 className="font-medium text-gray-900">Special Instructions</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.specialInstructions}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
