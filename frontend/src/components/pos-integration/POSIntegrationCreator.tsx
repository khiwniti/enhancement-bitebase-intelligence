'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface POSProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  features: string[];
  setupRequirements: string[];
}

interface POSIntegrationCreatorProps {
  onIntegrationCreated: () => void;
}

const POS_PROVIDERS: POSProvider[] = [
  {
    id: 'square',
    name: 'Square POS',
    logo: '🟦',
    description: 'Complete point-of-sale solution with inventory management',
    features: ['Real-time sync', 'Inventory tracking', 'Customer analytics', 'Payment processing'],
    setupRequirements: ['API Key', 'Application ID', 'Location ID']
  },
  {
    id: 'toast',
    name: 'Toast POS',
    logo: '🍞',
    description: 'Restaurant-specific POS with kitchen display integration',
    features: ['Kitchen display system', 'Online ordering', 'Staff management', 'Menu engineering'],
    setupRequirements: ['API Key', 'Restaurant GUID', 'Management Group GUID']
  },
  {
    id: 'clover',
    name: 'Clover',
    logo: '🍀',
    description: 'Flexible POS system with extensive app marketplace',
    features: ['App marketplace', 'Inventory management', 'Customer insights', 'Payment processing'],
    setupRequirements: ['API Token', 'Merchant ID', 'App ID']
  },
  {
    id: 'lightspeed',
    name: 'Lightspeed',
    logo: '⚡',
    description: 'Cloud-based POS for restaurants and retail',
    features: ['Cloud-based', 'Multi-location support', 'Advanced reporting', 'Inventory optimization'],
    setupRequirements: ['API Key', 'Account ID', 'Location ID']
  },
  {
    id: 'revel',
    name: 'Revel Systems',
    logo: '🎯',
    description: 'iPad-based POS system for restaurants',
    features: ['iPad-based', 'Kitchen display', 'Inventory management', 'Customer loyalty'],
    setupRequirements: ['API Key', 'Establishment ID', 'User Credentials']
  }
];

const DATA_TYPES = [
  { id: 'sales', label: 'Sales Data', description: 'Transaction records and revenue data' },
  { id: 'menu_items', label: 'Menu Items', description: 'Product catalog and pricing' },
  { id: 'inventory', label: 'Inventory', description: 'Stock levels and item tracking' },
  { id: 'customers', label: 'Customers', description: 'Customer profiles and contact info' },
  { id: 'orders', label: 'Orders', description: 'Order details and status' },
  { id: 'payments', label: 'Payments', description: 'Payment methods and transactions' },
  { id: 'staff', label: 'Staff', description: 'Employee data and schedules' },
  { id: 'discounts', label: 'Discounts', description: 'Promotional offers and coupons' }
];

export default function POSIntegrationCreator({ onIntegrationCreated }: POSIntegrationCreatorProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<POSProvider | null>(null);
  const [formData, setFormData] = useState({
    providerName: '',
    apiKey: '',
    apiSecret: '',
    endpoint: '',
    locationId: '',
    syncInterval: 15,
    autoSync: true,
    enabledDataTypes: ['sales', 'menu_items']
  });

  const handleProviderSelect = (provider: POSProvider) => {
    setSelectedProvider(provider);
    setFormData(prev => ({ ...prev, providerName: provider.name }));
    setStep(2);
  };

  const handleDataTypeToggle = (dataType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      enabledDataTypes: checked
        ? [...prev.enabledDataTypes, dataType]
        : prev.enabledDataTypes.filter(type => type !== dataType)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Creating integration:', {
        provider: selectedProvider?.id,
        ...formData
      });
      
      // Reset form
      setStep(1);
      setSelectedProvider(null);
      setFormData({
        providerName: '',
        apiKey: '',
        apiSecret: '',
        endpoint: '',
        locationId: '',
        syncInterval: 15,
        autoSync: true,
        enabledDataTypes: ['sales', 'menu_items']
      });
      
      setOpen(false);
      onIntegrationCreated();
    } catch (error) {
      console.error('Error creating integration:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 font-mono mb-4">
          Choose POS Provider
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {POS_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              onClick={() => handleProviderSelect(provider)}
              className="p-4 border border-gray-200 rounded-lg hover:border-[#74C365] hover:bg-[#74C365]/5 cursor-pointer transition-colors"
            >
              <div className="flex items-start space-x-4">
                <span className="text-3xl">{provider.logo}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 font-mono">{provider.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {provider.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">{selectedProvider?.logo}</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 font-mono">
            Configure {selectedProvider?.name}
          </h3>
          <p className="text-sm text-gray-600">
            Enter your {selectedProvider?.name} credentials and settings
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="apiKey">API Key *</Label>
          <Input
            id="apiKey"
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder="Enter your API key"
            className="mt-1"
          />
        </div>

        {selectedProvider?.id !== 'square' && (
          <div>
            <Label htmlFor="apiSecret">API Secret</Label>
            <Input
              id="apiSecret"
              type="password"
              value={formData.apiSecret}
              onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
              placeholder="Enter your API secret"
              className="mt-1"
            />
          </div>
        )}

        <div>
          <Label htmlFor="endpoint">API Endpoint</Label>
          <Input
            id="endpoint"
            value={formData.endpoint}
            onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
            placeholder="https://api.example.com/v1"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="locationId">Location ID</Label>
          <Input
            id="locationId"
            value={formData.locationId}
            onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
            placeholder="Enter location identifier"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
          <Select
            value={formData.syncInterval.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, syncInterval: parseInt(value) }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="240">4 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="autoSync"
            checked={formData.autoSync}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSync: !!checked }))}
          />
          <Label htmlFor="autoSync" className="text-sm">
            Enable automatic synchronization
          </Label>
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">Data Types to Sync</Label>
        <p className="text-sm text-gray-600 mb-4">
          Select which types of data you want to synchronize from your POS system
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DATA_TYPES.map((dataType) => (
            <div key={dataType.id} className="flex items-start space-x-3">
              <Checkbox
                id={dataType.id}
                checked={formData.enabledDataTypes.includes(dataType.id)}
                onCheckedChange={(checked) => handleDataTypeToggle(dataType.id, !!checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor={dataType.id} className="text-sm font-medium">
                  {dataType.label}
                </Label>
                <p className="text-xs text-gray-500">{dataType.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !formData.apiKey || formData.enabledDataTypes.length === 0}
          className="bg-[#74C365] hover:bg-[#74C365]/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Integration
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#74C365] hover:bg-[#74C365]/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono">Create POS Integration</DialogTitle>
          <DialogDescription>
            Connect your POS system to BiteBase Intelligence for automated data synchronization
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? renderStep1() : renderStep2()}
      </DialogContent>
    </Dialog>
  );
}
