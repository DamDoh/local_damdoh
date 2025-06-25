
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, DollarSign, ArrowDown, ArrowUp } from 'lucide-react';

/**
 * This component is the UI for the "Digital Filing Cabinet" (Module 3).
 * It provides a simple way for farmers to log income and expenses.
 */
export default function FinancialsPage() {
  const [transactionType, setTransactionType] = useState('expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFileName(event.target.files[0].name);
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    // In a real app, you would call the `logFinancialRecord` cloud function
    // and handle the file upload to Cloud Storage to get the invoiceImageUrl.
    console.log("Simulating financial record submission...");
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    alert("Financial record logged successfully (simulated)!");
    event.target.reset();
    setFileName('');
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <CardTitle className="text-2xl">Digital Filing Cabinet</CardTitle>
              <CardDescription>Keep a simple record of your farm's income and expenses.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Income / Expense Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              <Button type="button" onClick={() => setTransactionType('income')} variant={transactionType === 'income' ? 'default' : 'ghost'}>
                <ArrowUp className="w-4 h-4 mr-2" /> Income
              </Button>
              <Button type="button" onClick={() => setTransactionType('expense')} variant={transactionType === 'expense' ? 'default' : 'ghost'}>
                <ArrowDown className="w-4 h-4 mr-2" /> Expense
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder={transactionType === 'income' ? 'e.g., Sale of 50kg Maize' : 'e.g., Purchase of fertilizer'} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" placeholder="e.g., 25.50" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                 <Select name="currency" defaultValue="KHR" required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="KHR">KHR</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                  </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="e.g., Produce Sales, Input Costs, Labor" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="transactionDate">Transaction Date</Label>
                <Input id="transactionDate" name="transactionDate" type="date" required />
            </div>

            {/* Receipt Upload Feature */}
            <div className="space-y-2">
              <Label htmlFor="invoice-upload">Upload Receipt/Invoice (Optional)</Label>
              <div className="p-4 border-2 border-dashed rounded-lg text-center">
                <Camera className="mx-auto w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Take a photo or upload a file</p>
                <Button asChild variant="outline">
                  <label htmlFor="invoice-upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                    <input id="invoice-upload" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                </Button>
                {fileName && <p className="text-xs text-gray-500 mt-2">Selected: {fileName}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full !mt-8" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Record...' : 'Save Financial Record'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
