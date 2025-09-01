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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Receipt,
  Download,
  Filter
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'card' | 'digital' | 'check';
  reference?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  averageOrderValue: number;
  transactionCount: number;
  cashFlow: number;
}

export default function FinancialManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);

  // Mock transaction data
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'income',
      category: 'food_sales',
      description: 'Table 5 - Order #ORD-001',
      amount: 66.00,
      date: '2024-01-25T18:30:00',
      paymentMethod: 'card',
      reference: 'ORD-001',
      status: 'completed'
    },
    {
      id: '2',
      type: 'income',
      category: 'beverage_sales',
      description: 'Table 3 - Drinks',
      amount: 24.00,
      date: '2024-01-25T19:15:00',
      paymentMethod: 'cash',
      status: 'completed'
    },
    {
      id: '3',
      type: 'expense',
      category: 'food_costs',
      description: 'Fresh Farm Co. - Vegetables',
      amount: 150.00,
      date: '2024-01-25T10:00:00',
      paymentMethod: 'check',
      reference: 'INV-2024-001',
      status: 'completed'
    },
    {
      id: '4',
      type: 'expense',
      category: 'utilities',
      description: 'Electricity Bill - January',
      amount: 280.00,
      date: '2024-01-25T09:00:00',
      paymentMethod: 'digital',
      reference: 'UTIL-001',
      status: 'completed'
    },
    {
      id: '5',
      type: 'income',
      category: 'food_sales',
      description: 'Table 8 - Order #ORD-003',
      amount: 55.00,
      date: '2024-01-25T19:45:00',
      paymentMethod: 'card',
      reference: 'ORD-003',
      status: 'pending'
    },
    {
      id: '6',
      type: 'expense',
      category: 'staff_wages',
      description: 'Weekly Payroll',
      amount: 2400.00,
      date: '2024-01-25T08:00:00',
      paymentMethod: 'digital',
      reference: 'PAY-W04',
      status: 'completed'
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesPayment = filterPayment === 'all' || transaction.paymentMethod === filterPayment;
    
    return matchesSearch && matchesType && matchesCategory && matchesPayment;
  });

  // Calculate financial summary
  const financialSummary: FinancialSummary = {
    totalRevenue: transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
    netProfit: 0,
    averageOrderValue: 0,
    transactionCount: transactions.filter(t => t.status === 'completed').length,
    cashFlow: 0
  };

  financialSummary.netProfit = financialSummary.totalRevenue - financialSummary.totalExpenses;
  financialSummary.cashFlow = financialSummary.netProfit;
  
  const orderTransactions = transactions.filter(t => t.type === 'income' && t.category === 'food_sales' && t.status === 'completed');
  financialSummary.averageOrderValue = orderTransactions.length > 0 ? 
    orderTransactions.reduce((sum, t) => sum + t.amount, 0) / orderTransactions.length : 0;

  const getTypeIcon = (type: string) => {
    return type === 'income' ? 
      <TrendingUp className="h-4 w-4 text-[#4CAF50]" /> : 
      <TrendingDown className="h-4 w-4 text-[#E23D28]" />;
  };

  const getTypeBadge = (type: string) => {
    return type === 'income' ? 
      <Badge className="bg-[#4CAF50] text-white">Income</Badge> : 
      <Badge className="bg-[#E23D28] text-white">Expense</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      food_sales: '#74C365',
      beverage_sales: '#2196F3',
      food_costs: '#E23D28',
      staff_wages: '#F4C431',
      utilities: '#9C27B0',
      rent: '#FF5722',
      marketing: '#00BCD4',
      equipment: '#795548'
    };
    
    const categoryNames = {
      food_sales: 'Food Sales',
      beverage_sales: 'Beverage Sales',
      food_costs: 'Food Costs',
      staff_wages: 'Staff Wages',
      utilities: 'Utilities',
      rent: 'Rent',
      marketing: 'Marketing',
      equipment: 'Equipment'
    };
    
    return (
      <Badge 
        style={{ backgroundColor: categoryColors[category as keyof typeof categoryColors] || '#6C757D' }}
        className="text-white"
      >
        {categoryNames[category as keyof typeof categoryNames] || category}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4 text-gray-600" />;
      case 'cash':
        return <DollarSign className="h-4 w-4 text-gray-600" />;
      case 'digital':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'check':
        return <Receipt className="h-4 w-4 text-gray-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-[#4CAF50] text-white">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-[#FF9800] text-white">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-[#E23D28] text-white">Failed</Badge>;
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Financial Management
          </h2>
          <p className="text-gray-600 mt-1">
            Track revenue, expenses, and financial performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Record a new financial transaction.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food_sales">Food Sales</SelectItem>
                        <SelectItem value="beverage_sales">Beverage Sales</SelectItem>
                        <SelectItem value="food_costs">Food Costs</SelectItem>
                        <SelectItem value="staff_wages">Staff Wages</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Input placeholder="Transaction description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Amount</label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Payment Method</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Reference (Optional)</label>
                  <Input placeholder="Invoice number, order ID, etc." />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddTransactionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-[#74C365] hover:bg-[#65B356] text-white">
                    Add Transaction
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialSummary.totalRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#4CAF50]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#E23D28]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialSummary.totalExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-[#E23D28]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#74C365]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialSummary.netProfit)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-[#74C365]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#2196F3]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialSummary.averageOrderValue)}</p>
              </div>
              <Receipt className="h-8 w-8 text-[#2196F3]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions by description or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food_sales">Food Sales</SelectItem>
                  <SelectItem value="beverage_sales">Beverage Sales</SelectItem>
                  <SelectItem value="food_costs">Food Costs</SelectItem>
                  <SelectItem value="staff_wages">Staff Wages</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
          <CardDescription>
            Recent financial transactions and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(transaction.type)}
                      {getTypeBadge(transaction.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{transaction.description}</div>
                  </TableCell>
                  <TableCell>
                    {getCategoryBadge(transaction.category)}
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      <span className="capitalize">{transaction.paymentMethod}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDateTime(transaction.date)}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">{transaction.reference || '-'}</div>
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
