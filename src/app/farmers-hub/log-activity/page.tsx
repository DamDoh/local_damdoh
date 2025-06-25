
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sprout, Tractor, Droplets, Spray, Leaf } from 'lucide-react';

// Enhanced visual activity selection
const activityTypes = [
  { id: 'PLANTING', label: 'Planting', icon: <Sprout /> },
  { id: 'INPUT_APPLICATION', label: 'Apply Input', icon: <Spray /> },
  { id: 'IRRIGATION', label: 'Irrigation', icon: <Droplets /> },
  { id: 'HARVESTING', label: 'Harvesting', icon: <Tractor /> },
  { id: 'OBSERVATION', label: 'Observation', icon: <Leaf /> },
];

export default function LogFarmActivityPage() {
  const [activityType, setActivityType] = useState('PLANTING');
  // ... other state management

  const renderDynamicFields = () => {
    switch (activityType) {
      case 'PLANTING':
        return (
          <>
            <div className="space-y-2"><Label htmlFor="crop">Crop</Label><Input id="crop" placeholder="e.g., Maize" /></div>
            <div className="space-y-2"><Label htmlFor="date">Planting Date</Label><Input id="date" type="date" /></div>
          </>
        );
      case 'INPUT_APPLICATION':
        return (
          <>
            <div className="space-y-2"><Label htmlFor="input">Input Name</Label><Input id="input" placeholder="e.g., Organic NPK Fertilizer" /></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" placeholder="e.g., 50" /></div>
                <div className="space-y-2"><Label htmlFor="unit">Unit</Label><Input id="unit" placeholder="e.g., kg" /></div>
            </div>
          </>
        );
      case 'HARVESTING':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="yield">Yield</Label><Input id="yield" type="number" placeholder="e.g., 1000" /></div>
                <div className="space-y-2"><Label htmlFor="yieldUnit">Unit</Label><Input id="yieldUnit" placeholder="e.g., kg" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="grade">Quality Grade (Optional)</Label><Input id="grade" placeholder="e.g., Grade A" /></div>
          </>
        );
      // Add cases for IRRIGATION and OBSERVATION
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Log Detailed Farm Activity</CardTitle>
          <CardDescription>Select an activity to add a detailed entry to your farm's logbook.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8">
            <div className="space-y-2">
              <Label>Select Activity Type</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {activityTypes.map((activity) => (
                  <button type="button" onClick={() => setActivityType(activity.id)}
                    className={`p-3 border-2 rounded-lg text-center font-semibold ${ activityType === activity.id ? 'border-blue-500 bg-blue-50' : 'bg-gray-50' }`} >
                    <div className="w-8 h-8 mx-auto mb-1">{activity.icon}</div>
                    <span className="text-xs">{activity.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4 p-4 border-t">
              {renderDynamicFields()}
            </div>
            
            <Button type="submit" className="w-full" size="lg">Log This Activity</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
