
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from 'firebase/functions';
import { MapPin, Wheat, BarChart3, Sun } from 'lucide-react';

// --- Backend Integration ---
const getFieldsDataFunction = httpsCallable(functions, 'getFarmFieldsData');

// --- Main Component ---
export default function InteractiveFieldMapPage() {
  const [mapState, setMapState] = useState({ fields: [], selectedFieldId: null, isLoading: true, error: null });

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getFieldsDataFunction();
        if ((result.data as any).success) {
          const fields = (result.data as any).fields;
          // In a real app, the fetched data would have all necessary properties
          const enrichedFields = fields.map(f => ({
            ...f,
            // Add mock data for properties that might not be in the base 'farm' doc
            // but would be joined or fetched separately
            crop: f.name.includes("Maize") ? "Maize" : "Rice",
            area: "10 Ha",
            health: "Healthy",
          }));
          setMapState({
            fields: enrichedFields,
            selectedFieldId: enrichedFields[0]?.id || null,
            isLoading: false,
            error: null,
          });
        } else {
          throw new Error((result.data as any).message);
        }
      } catch (err) {
        setMapState({ fields: [], selectedFieldId: null, isLoading: false, error: "Failed to load map data." });
      }
    };
    loadData();
  }, []);

  const handleSelectField = (fieldId) => {
    setMapState(prevState => ({ ...prevState, selectedFieldId: fieldId }));
  };
  
  // ... (Skeleton and Error rendering logic) ...

  const selectedField = mapState.fields.find(f => f.id === mapState.selectedFieldId);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6"><h1 className="text-3xl font-bold">My Farm Map</h1></div>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-200px)]">
          {/* Map Area */}
          <div className="md:col-span-2 bg-gray-200 flex items-center justify-center">
            {selectedField ? `Map Placeholder for ${selectedField.name}`: "Select a field"}
          </div>
          {/* Field Navigator */}
          <div className="md:col-span-1 border-l bg-gray-50 flex flex-col">
            <CardHeader><CardTitle>Field Navigator</CardTitle></CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-4">
                {mapState.fields.map(field => (
                  <li 
                    key={field.id} 
                    onClick={() => handleSelectField(field.id)}
                    className={`p-4 rounded-lg cursor-pointer border-2 ${mapState.selectedFieldId === field.id ? 'border-blue-500' : 'bg-white'}`}
                  >
                    <h3 className="font-bold">{field.name}</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><Wheat className="inline-block mr-2" />Crop: {field.crop}</p>
                      <p><BarChart3 className="inline-block mr-2" />Area: {field.area}</p>
                      <p><Sun className="inline-block mr-2" />Health: {field.health}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
