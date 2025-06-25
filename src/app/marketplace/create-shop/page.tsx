
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/**
 * Frontend component for stakeholders to create their Digital Shopfront.
 * This UI will call the `createShop` backend function.
 */
export default function CreateShopPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    // In a real app, this would call the `createShop` Cloud Function
    try {
      const formData = new FormData(event.target);
      const shopData = {
        name: formData.get('shop_name'),
        description: formData.get('shop_description'),
        stakeholderType: 'farmer', // This would be dynamic based on user's role
      };

      console.log("Calling 'createShop' with payload:", shopData);
      // const result = await createShopFunction(shopData);
      await new Promise(r => setTimeout(r, 1000)); // Simulate API call

      setFeedback({ type: 'success', message: 'Your Digital Shopfront has been created!' });
      event.target.reset();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to create shop.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Digital Shopfront</CardTitle>
          <CardDescription>Establish your presence on the DamDoh Marketplace. This will be your page to showcase products or services.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shop_name">Shop / Service Name</Label>
              <Input id="shop_name" name="shop_name" type="text" placeholder="e.g., Sokhom's Fresh Organics" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop_description">Shop / Service Description</Label>
              <Textarea id="shop_description" name="shop_description" placeholder="Tell everyone what makes your products or services special." required />
            </div>

            {/* In a real app, fields for logo, banner, contact info would be here */}

            {feedback.message && (
              <div className={`p-3 rounded-md ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {feedback.message}
              </div>
            )}

            <Button type="submit" className="w-full !mt-8" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create My Shopfront'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
