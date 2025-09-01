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
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  unitCost: number;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock inventory data
  const inventoryItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Tomatoes',
      category: 'vegetables',
      currentStock: 5,
      unit: 'kg',
      minThreshold: 10,
      maxThreshold: 50,
      unitCost: 3.50,
      supplier: 'Fresh Farm Co.',
      lastRestocked: '2024-01-20',
      expiryDate: '2024-01-25',
      status: 'low_stock'
    },
    {
      id: '2',
      name: 'Chicken Breast',
      category: 'meat',
      currentStock: 25,
      unit: 'kg',
      minThreshold: 15,
      maxThreshold: 40,
      unitCost: 12.00,
      supplier: 'Premium Meats Ltd.',
      lastRestocked: '2024-01-22',
      expiryDate: '2024-01-28',
      status: 'in_stock'
    },
    {
      id: '3',
      name: 'Olive Oil',
      category: 'condiments',
      currentStock: 0,
      unit: 'liters',
      minThreshold: 5,
      maxThreshold: 20,
      unitCost: 8.50,
      supplier: 'Mediterranean Imports',
      lastRestocked: '2024-01-15',
      status: 'out_of_stock'
    },
    {
      id: '4',
      name: 'Pasta',
      category: 'grains',
      currentStock: 30,
      unit: 'kg',
      minThreshold: 20,
      maxThreshold: 60,
      unitCost: 2.25,
      supplier: 'Italian Wholesale',
      lastRestocked: '2024-01-21',
      status: 'in_stock'
    }
  ];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string, currentStock: number, minThreshold: number) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-[#4CAF50] text-white">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-[#FF9800] text-white">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-[#E23D28] text-white">Out of Stock</Badge>;
      case 'expired':
        return <Badge className="bg-[#6C757D] text-white">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      vegetables: '#74C365',
      meat: '#E23D28',
      dairy: '#2196F3',
      grains: '#F4C431',
      condiments: '#9C27B0',
      beverages: '#FF5722'
    };
    
    return (
      <Badge 
        style={{ backgroundColor: categoryColors[category as keyof typeof categoryColors] || '#6C757D' }}
        className="text-white capitalize"
      >
        {category}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStockLevel = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    if (current === 0) return { level: 'empty', color: '#E23D28' };
    if (current <= min) return { level: 'low', color: '#FF9800' };
    if (percentage >= 80) return { level: 'high', color: '#4CAF50' };
    return { level: 'medium', color: '#2196F3' };
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Inventory Management
          </h2>
          <p className="text-gray-600 mt-1">
            Track stock levels, manage suppliers, and monitor expiry dates
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <TrendingDown className="h-4 w-4 mr-2" />
            Stock Report
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Enter the details for the new inventory item.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Item Name</label>
                  <Input placeholder="e.g., Tomatoes" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="meat">Meat</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="grains">Grains</SelectItem>
                        <SelectItem value="condiments">Condiments</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Unit</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Min Threshold</label>
                    <Input type="number" placeholder="10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Max Threshold</label>
                    <Input type="number" placeholder="50" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Unit Cost</label>
                  <Input type="number" step="0.01" placeholder="3.50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Supplier</label>
                  <Input placeholder="Supplier name" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
                    Add Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventoryItems.filter(item => item.status === 'in_stock').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-[#4CAF50]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FF9800]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventoryItems.filter(item => item.status === 'low_stock').length}
                </p>
              </div>
              <div className="relative">
                <Package className="h-8 w-8 text-[#FF9800]" />
                <AlertTriangle className="h-4 w-4 text-[#FF9800] absolute -top-1 -right-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#E23D28]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventoryItems.filter(item => item.status === 'out_of_stock').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-[#E23D28]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F4C431]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#F4C431]" />
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
                  placeholder="Search items by name or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="meat">Meat</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="condiments">Condiments</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items ({filteredItems.length})</CardTitle>
          <CardDescription>
            Manage your restaurant inventory and stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const stockLevel = getStockLevel(item.currentStock, item.minThreshold, item.maxThreshold);
                const expiringSoon = isExpiringSoon(item.expiryDate);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center">
                          {item.name}
                          {expiringSoon && (
                            <AlertTriangle className="h-4 w-4 text-[#FF9800] ml-2" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}
                        </div>
                        {item.expiryDate && (
                          <div className="text-sm text-gray-500">
                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(item.category)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.currentStock} {item.unit}</span>
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: stockLevel.color }}
                          />
                        </div>
                        <div className="text-sm text-gray-500">
                          Min: {item.minThreshold} | Max: {item.maxThreshold}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status, item.currentStock, item.minThreshold)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{item.supplier}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.unitCost)}/{item.unit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(item.currentStock * item.unitCost)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Restock
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
