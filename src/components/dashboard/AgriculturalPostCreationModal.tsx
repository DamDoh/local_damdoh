"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image as ImageIcon,
  MapPin,
  DollarSign,
  Users,
  Tractor,
  ShoppingCart,
  Wrench,
  Truck,
  Sprout,
  Lightbulb,
  HelpCircle,
  Upload,
  X
} from "lucide-react";
import { useTranslations } from 'next-intl';

interface AgriculturalPostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (content: string, media?: File, pollOptions?: { text: string }[]) => void;
}

type PostCategory = 'crop-update' | 'for-sale' | 'labor' | 'equipment' | 'knowledge' | 'help' | 'marketplace';

interface PostData {
  category: PostCategory;
  title: string;
  content: string;
  price?: string;
  location?: string;
  quantity?: string;
  cropType?: string;
  equipmentType?: string;
  laborType?: string;
  urgency?: 'low' | 'medium' | 'high';
  images: File[];
}

export function AgriculturalPostCreationModal({
  isOpen,
  onClose,
  onCreatePost
}: AgriculturalPostCreationModalProps) {
  const t = useTranslations('AgriculturalPostCreationModal');

  const [postData, setPostData] = useState<PostData>({
    category: 'crop-update',
    title: '',
    content: '',
    images: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryChange = (category: PostCategory) => {
    setPostData(prev => ({ ...prev, category }));
  };

  const handleInputChange = (field: keyof PostData, value: string) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPostData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5) // Max 5 images
    }));
  };

  const removeImage = (index: number) => {
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!postData.title.trim() || !postData.content.trim()) return;

    setIsSubmitting(true);
    try {
      // Format content based on category
      let formattedContent = `${postData.title}\n\n${postData.content}`;

      // Add category-specific details
      switch (postData.category) {
        case 'for-sale':
          if (postData.price) formattedContent += `\n\nPrice: ${postData.price}`;
          if (postData.quantity) formattedContent += `\nQuantity: ${postData.quantity}`;
          if (postData.location) formattedContent += `\nLocation: ${postData.location}`;
          break;
        case 'labor':
          if (postData.laborType) formattedContent += `\n\nType: ${postData.laborType}`;
          if (postData.location) formattedContent += `\nLocation: ${postData.location}`;
          break;
        case 'equipment':
          if (postData.equipmentType) formattedContent += `\n\nEquipment: ${postData.equipmentType}`;
          if (postData.price) formattedContent += `\nPrice: ${postData.price}`;
          break;
        case 'help':
          if (postData.urgency) formattedContent += `\n\nUrgency: ${postData.urgency.toUpperCase()}`;
          break;
      }

      // Add category tag
      formattedContent += `\n\n#${postData.category.replace('-', '')}`;

      // Use first image if available
      const media = postData.images.length > 0 ? postData.images[0] : undefined;

      await onCreatePost(formattedContent, media);

      // Reset form
      setPostData({
        category: 'crop-update',
        title: '',
        content: '',
        images: []
      });

      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryFields = () => {
    switch (postData.category) {
      case 'for-sale':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  placeholder="e.g., KSH 50/kg"
                  value={postData.price || ''}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  placeholder="e.g., 100kg"
                  value={postData.quantity || ''}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Nairobi, Kenya"
                value={postData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>
        );

      case 'labor':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="laborType">Labor Type</Label>
              <Select value={postData.laborType || ''} onValueChange={(value) => handleInputChange('laborType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select labor type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harvesting">Harvesting</SelectItem>
                  <SelectItem value="planting">Planting</SelectItem>
                  <SelectItem value="weeding">Weeding</SelectItem>
                  <SelectItem value="irrigation">Irrigation</SelectItem>
                  <SelectItem value="general">General Farm Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Nairobi, Kenya"
                value={postData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="equipmentType">Equipment Type</Label>
              <Select value={postData.equipmentType || ''} onValueChange={(value) => handleInputChange('equipmentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tractor">Tractor</SelectItem>
                  <SelectItem value="plow">Plow</SelectItem>
                  <SelectItem value="harvester">Harvester</SelectItem>
                  <SelectItem value="sprayer">Sprayer</SelectItem>
                  <SelectItem value="irrigation">Irrigation System</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price/Rate</Label>
              <Input
                id="price"
                placeholder="e.g., KSH 500/day"
                value={postData.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select value={postData.urgency || 'medium'} onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('urgency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Can wait</SelectItem>
                  <SelectItem value="medium">Medium - This week</SelectItem>
                  <SelectItem value="high">High - Urgent help needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Agricultural Post</DialogTitle>
        </DialogHeader>

        <Tabs value={postData.category} onValueChange={handleCategoryChange}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="crop-update" className="text-xs">
              <Sprout className="h-4 w-4 mr-1" />
              Crop
            </TabsTrigger>
            <TabsTrigger value="for-sale" className="text-xs">
              <ShoppingCart className="h-4 w-4 mr-1" />
              Sale
            </TabsTrigger>
            <TabsTrigger value="labor" className="text-xs">
              <Users className="h-4 w-4 mr-1" />
              Labor
            </TabsTrigger>
            <TabsTrigger value="equipment" className="text-xs">
              <Tractor className="h-4 w-4 mr-1" />
              Equip
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="text-xs">
              <Lightbulb className="h-4 w-4 mr-1" />
              Tips
            </TabsTrigger>
            <TabsTrigger value="help" className="text-xs">
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="text-xs">
              <DollarSign className="h-4 w-4 mr-1" />
              Market
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your post a clear title..."
                value={postData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="content">Description</Label>
              <Textarea
                id="content"
                placeholder="Describe your post in detail..."
                value={postData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={4}
              />
            </div>

            {renderCategoryFields()}

            {/* Image Upload */}
            <div>
              <Label>Photos (optional)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Add Photos
                    </span>
                  </Button>
                </label>
              </div>

              {postData.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {postData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!postData.title.trim() || !postData.content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}