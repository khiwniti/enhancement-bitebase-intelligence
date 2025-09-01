'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Plus, 
  Settings, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Building,
  Phone,
  Mail,
  Globe,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface POSLocation {
  id: string;
  restaurantId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  phoneNumber?: string;
  email?: string;
  isActive: boolean;
  integrations: {
    id: string;
    provider: string;
    providerName: string;
    status: string;
    lastSync: string | null;
  }[];
  createdAt: string;
}

export default function POSLocationManager() {
  const [locations, setLocations] = useState<POSLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockLocations: POSLocation[] = [
        {
          id: '1',
          restaurantId: 'rest-1',
          name: 'Downtown Location',
          address: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA',
          latitude: 37.7749,
          longitude: -122.4194,
          timezone: 'America/Los_Angeles',
          phoneNumber: '+1 (555) 123-4567',
          email: 'downtown@restaurant.com',
          isActive: true,
          integrations: [
            {
              id: 'int-1',
              provider: 'square',
              providerName: 'Square POS',
              status: 'connected',
              lastSync: '2024-01-15T10:30:00Z'
            },
            {
              id: 'int-2',
              provider: 'toast',
              providerName: 'Toast POS',
              status: 'syncing',
              lastSync: '2024-01-15T10:25:00Z'
            }
          ],
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          restaurantId: 'rest-1',
          name: 'Airport Terminal',
          address: '1 Airport Blvd, Terminal 2',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94128',
          country: 'USA',
          latitude: 37.6213,
          longitude: -122.3790,
          timezone: 'America/Los_Angeles',
          phoneNumber: '+1 (555) 987-6543',
          email: 'airport@restaurant.com',
          isActive: true,
          integrations: [
            {
              id: 'int-3',
              provider: 'clover',
              providerName: 'Clover',
              status: 'error',
              lastSync: '2024-01-14T15:20:00Z'
            }
          ],
          createdAt: '2024-01-05T00:00:00Z'
        },
        {
          id: '3',
          restaurantId: 'rest-2',
          name: 'Mall Food Court',
          address: '456 Shopping Center Dr',
          city: 'Palo Alto',
          state: 'CA',
          zipCode: '94301',
          country: 'USA',
          latitude: 37.4419,
          longitude: -122.1430,
          timezone: 'America/Los_Angeles',
          phoneNumber: '+1 (555) 456-7890',
          email: 'mall@restaurant.com',
          isActive: false,
          integrations: [],
          createdAt: '2024-01-10T00:00:00Z'
        }
      ];
      setLocations(mockLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { color: 'border-[#74C365] text-[#74C365] bg-[#74C365]/10', icon: CheckCircle },
      syncing: { color: 'border-[#F4C431] text-[#F4C431] bg-[#F4C431]/10', icon: Activity },
      error: { color: 'border-[#E23D28] text-[#E23D28] bg-[#E23D28]/10', icon: AlertTriangle },
      disconnected: { color: 'border-gray-400 text-gray-400 bg-gray-100', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disconnected;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getProviderLogo = (provider: string) => {
    const logos: { [key: string]: string } = {
      square: '🟦',
      toast: '🍞',
      clover: '🍀',
      lightspeed: '⚡',
      revel: '🎯'
    };
    return logos[provider] || '📱';
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const handleAddLocation = () => {
    console.log('Adding new location...');
    // Implement add location
  };

  const handleEditLocation = (locationId: string) => {
    console.log('Editing location:', locationId);
    // Implement edit location
  };

  const handleDeleteLocation = (locationId: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      setLocations(prev => prev.filter(loc => loc.id !== locationId));
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLocations = locations.length;
  const activeLocations = locations.filter(loc => loc.isActive).length;
  const totalIntegrations = locations.reduce((sum, loc) => sum + loc.integrations.length, 0);
  const connectedIntegrations = locations.reduce((sum, loc) => 
    sum + loc.integrations.filter(int => int.status === 'connected').length, 0
  );

  return (
    <div className="space-y-6">
      {/* Location Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#74C365]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Locations</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{totalLocations}</p>
              </div>
              <Building className="w-8 h-8 text-[#74C365]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F4C431]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Locations</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{activeLocations}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-[#F4C431]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{totalIntegrations}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#E23D28]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{connectedIntegrations}</p>
              </div>
              <Globe className="w-8 h-8 text-[#E23D28]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-3">
          <Button 
            onClick={handleAddLocation}
            className="bg-[#74C365] hover:bg-[#74C365]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLocations.map((location) => (
          <Card key={location.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${location.isActive ? 'bg-[#74C365]' : 'bg-gray-400'}`} />
                  <div>
                    <CardTitle className="text-lg font-mono">{location.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{location.city}, {location.state}</span>
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditLocation(location.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Location
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteLocation(location.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address */}
              <div>
                <p className="text-sm text-gray-600">{location.address}</p>
                <p className="text-sm text-gray-600">
                  {location.city}, {location.state} {location.zipCode}
                </p>
              </div>

              {/* Contact Info */}
              <div className="flex flex-col space-y-2">
                {location.phoneNumber && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{location.phoneNumber}</span>
                  </div>
                )}
                {location.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{location.email}</span>
                  </div>
                )}
              </div>

              {/* Integrations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">POS Integrations</span>
                  <Badge variant="outline" className="text-xs">
                    {location.integrations.length} connected
                  </Badge>
                </div>
                
                {location.integrations.length > 0 ? (
                  <div className="space-y-2">
                    {location.integrations.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getProviderLogo(integration.provider)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{integration.providerName}</p>
                            <p className="text-xs text-gray-500">
                              Last sync: {formatLastSync(integration.lastSync)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(integration.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No integrations configured</p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <Badge 
                  variant="outline" 
                  className={location.isActive 
                    ? 'border-[#74C365] text-[#74C365] bg-[#74C365]/10' 
                    : 'border-gray-400 text-gray-400 bg-gray-100'
                  }
                >
                  {location.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'Add your first location to get started with multi-location POS management.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
