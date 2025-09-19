/**
 * Communication Templates Widget - Business communication automation
 * Provides structured templates for negotiations, contracts, inspections, and follow-ups
 * Single Responsibility: Template browsing, filling, and sending
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare, FileText, Handshake, Search, Send,
  Eye, Edit, Copy, CheckCircle, AlertCircle,
  Briefcase, Scale, ClipboardCheck, Calendar
} from 'lucide-react';
import { CommunicationTemplatesService, CommunicationTemplate, TemplateVariable } from "@/services/dashboard/CommunicationTemplatesService";
import { useAuth } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

interface CommunicationTemplatesWidgetProps {
  recipientId?: string;
  context?: 'negotiation' | 'contract' | 'inspection' | 'followup';
}

export const CommunicationTemplatesWidget: React.FC<CommunicationTemplatesWidgetProps> = ({
  recipientId,
  context = 'negotiation'
}) => {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({});
  const [generatedContent, setGeneratedContent] = useState<{ subject?: string; content: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(context);

  const { user } = useAuth();
  const { toast } = useToast();
  const templatesService = CommunicationTemplatesService.getInstance();

  useEffect(() => {
    const loadTemplates = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const templatesData = await templatesService.getTemplates(
          user.id,
          selectedCategory,
          undefined, // stakeholder type
          'en' // language
        );
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          title: "Error",
          description: "Failed to load communication templates.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [user?.id, selectedCategory, templatesService, toast]);

  const handleTemplateSelect = (template: CommunicationTemplate) => {
    setSelectedTemplate(template);
    // Initialize variables with defaults
    const initialVars: Record<string, any> = {};
    template.variables.forEach(variable => {
      if (variable.defaultValue) {
        initialVars[variable.key] = variable.defaultValue;
      }
    });
    setTemplateVariables(initialVars);
    setGeneratedContent(null);
  };

  const handleVariableChange = (key: string, value: any) => {
    setTemplateVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGeneratePreview = () => {
    if (!selectedTemplate) return;

    const result = templatesService.generateMessage(selectedTemplate, templateVariables);
    if (result.missingVariables.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${result.missingVariables.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setGeneratedContent({ subject: result.subject, content: result.content });
    setShowPreview(true);
  };

  const handleSendMessage = async () => {
    if (!selectedTemplate || !generatedContent || !recipientId || !user?.id) return;

    setIsSending(true);
    try {
      await templatesService.sendTemplatedMessage(
        selectedTemplate.id,
        user.id,
        recipientId,
        templateVariables
      );

      toast({
        title: "Message Sent!",
        description: "Your templated message has been sent successfully.",
      });

      // Reset form
      setSelectedTemplate(null);
      setTemplateVariables({});
      setGeneratedContent(null);
      setShowPreview(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'negotiation': return <Handshake className="h-4 w-4" />;
      case 'contract': return <FileText className="h-4 w-4" />;
      case 'inspection': return <ClipboardCheck className="h-4 w-4" />;
      case 'followup': return <Calendar className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'negotiation': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-green-100 text-green-800';
      case 'inspection': return 'bg-orange-100 text-orange-800';
      case 'followup': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-blue-800">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600 animate-pulse" />
            Communication Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center text-blue-800">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              Communication Templates
            </CardTitle>
            <Badge variant="secondary" className="text-blue-700">
              {filteredTemplates.length} templates
            </Badge>
          </div>
          <p className="text-sm text-blue-600">
            Professional templates for business negotiations, contracts, and inspections
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filter */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="negotiation" className="flex items-center gap-1">
                <Handshake className="h-3 w-3" />
                <span className="hidden sm:inline">Negotiate</span>
              </TabsTrigger>
              <TabsTrigger value="contract" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Contracts</span>
              </TabsTrigger>
              <TabsTrigger value="inspection" className="flex items-center gap-1">
                <ClipboardCheck className="h-3 w-3" />
                <span className="hidden sm:inline">Inspect</span>
              </TabsTrigger>
              <TabsTrigger value="followup" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">Follow-up</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Search templates..."
              className="pl-10 border-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Templates List */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                <p className="text-blue-600 text-sm">
                  No templates found for "{searchTerm}"
                </p>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <h4 className="font-semibold text-gray-900 text-sm">{template.name}</h4>
                    </div>
                    <Badge className={`text-xs ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.usageCount} uses</span>
                    <span>{template.variables.length} fields</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Editor Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate && getCategoryIcon(selectedTemplate.category)}
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              {/* Variables Form */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-900">Fill in the details:</h4>
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable.key} className="space-y-1">
                    <Label htmlFor={variable.key} className="text-sm">
                      {variable.label}
                      {variable.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>

                    {variable.type === 'text' && (
                      <Input
                        id={variable.key}
                        placeholder={variable.placeholder}
                        value={templateVariables[variable.key] || ''}
                        onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                        required={variable.required}
                      />
                    )}

                    {variable.type === 'number' && (
                      <Input
                        id={variable.key}
                        type="number"
                        placeholder={variable.placeholder}
                        value={templateVariables[variable.key] || ''}
                        onChange={(e) => handleVariableChange(variable.key, parseFloat(e.target.value))}
                        min={variable.validation?.min}
                        max={variable.validation?.max}
                        required={variable.required}
                      />
                    )}

                    {variable.type === 'date' && (
                      <Input
                        id={variable.key}
                        type="date"
                        value={templateVariables[variable.key] || ''}
                        onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                        required={variable.required}
                      />
                    )}

                    {variable.type === 'select' && variable.options && (
                      <Select
                        value={templateVariables[variable.key] || ''}
                        onValueChange={(value) => handleVariableChange(variable.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={variable.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {variable.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {variable.type === 'boolean' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={variable.key}
                          checked={templateVariables[variable.key] || false}
                          onChange={(e) => handleVariableChange(variable.key, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={variable.key} className="text-sm">
                          {variable.label}
                        </Label>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Preview Button */}
              <div className="flex gap-2">
                <Button onClick={handleGeneratePreview} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Message
                </Button>
                {generatedContent && (
                  <Button onClick={() => setShowPreview(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Preview
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancel
            </Button>
            {generatedContent && recipientId && (
              <Button onClick={handleSendMessage} disabled={isSending}>
                {isSending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Preview</DialogTitle>
            <DialogDescription>
              Review your message before sending
            </DialogDescription>
          </DialogHeader>

          {generatedContent && (
            <div className="space-y-4">
              {generatedContent.subject && (
                <div>
                  <Label className="text-sm font-medium">Subject:</Label>
                  <div className="p-3 bg-gray-50 rounded border text-sm">
                    {generatedContent.subject}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Message:</Label>
                <div className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {generatedContent.content}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Edit
            </Button>
            {recipientId && (
              <Button onClick={handleSendMessage} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};