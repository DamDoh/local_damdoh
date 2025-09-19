"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, Camera, Upload, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useToast } from '@/hooks/use-toast';

interface DocumentItem {
  id: string;
  type: 'id' | 'land_deed' | 'bank_statement' | 'invoice';
  status: 'pending' | 'analyzing' | 'verified' | 'rejected';
  fileName?: string;
  uploadedAt?: Date;
  analysisResult?: {
    authenticity: number;
    issues: string[];
    recommendations: string[];
  };
}

interface DocumentVerificationWidgetProps {
  documents?: DocumentItem[];
  onDocumentAnalyzed?: (document: DocumentItem) => void;
}

export function DocumentVerificationWidget({ documents = [], onDocumentAnalyzed }: DocumentVerificationWidgetProps) {
  const [selectedDocType, setSelectedDocType] = useState<'id' | 'land_deed' | 'bank_statement' | 'invoice'>('id');
  const [currentDocuments, setCurrentDocuments] = useState<DocumentItem[]>(documents);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startCamera, captureImage, isStreaming, isAnalyzing, analyzeDocument } = useCamera();
  const { toast } = useToast();

  const handleCameraCapture = async () => {
    try {
      await startCamera();
      const imageData = await captureImage();
      if (imageData) {
        await analyzeCapturedDocument(imageData, selectedDocType);
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
      toast({
        title: "Camera Error",
        description: "Failed to capture document image",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      if (imageData) {
        await analyzeCapturedDocument(imageData, selectedDocType, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const analyzeCapturedDocument = async (imageData: string, docType: string, fileName?: string) => {
    const newDoc: DocumentItem = {
      id: Date.now().toString(),
      type: docType as any,
      status: 'analyzing',
      fileName: fileName || `Captured ${docType}`,
      uploadedAt: new Date()
    };

    setCurrentDocuments(prev => [...prev, newDoc]);

    try {
      const result = await analyzeDocument(imageData, docType as any);

      const updatedDoc: DocumentItem = {
        ...newDoc,
        status: result?.authenticity > 0.8 ? 'verified' : result?.authenticity > 0.5 ? 'pending' : 'rejected',
        analysisResult: {
          authenticity: result?.authenticity || 0,
          issues: result?.issues || [],
          recommendations: result?.recommendations || []
        }
      };

      setCurrentDocuments(prev => prev.map(doc =>
        doc.id === newDoc.id ? updatedDoc : doc
      ));

      onDocumentAnalyzed?.(updatedDoc);

      toast({
        title: "Document Analysis Complete",
        description: `Document ${updatedDoc.status === 'verified' ? 'verified' : 'requires review'}`,
      });

    } catch (error) {
      console.error('Document analysis failed:', error);
      const failedDoc: DocumentItem = {
        ...newDoc,
        status: 'rejected'
      };

      setCurrentDocuments(prev => prev.map(doc =>
        doc.id === newDoc.id ? failedDoc : doc
      ));

      toast({
        title: "Analysis Failed",
        description: "Document analysis failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <X className="h-4 w-4 text-red-500" />;
      case 'analyzing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'analyzing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'id': return 'National ID';
      case 'land_deed': return 'Land Deed';
      case 'bank_statement': return 'Bank Statement';
      case 'invoice': return 'Invoice/Receipt';
      default: return type;
    }
  };

  const verifiedCount = currentDocuments.filter(doc => doc.status === 'verified').length;
  const pendingCount = currentDocuments.filter(doc => doc.status === 'pending' || doc.status === 'analyzing').length;
  const rejectedCount = currentDocuments.filter(doc => doc.status === 'rejected').length;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-green-800">
          <FileCheck className="h-5 w-5 mr-2 text-green-600" />
          Document Verification
        </CardTitle>
        <p className="text-sm text-green-600 font-normal">AI-powered document analysis</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-green-800">Document Type</label>
          <Select value={selectedDocType} onValueChange={(value: any) => setSelectedDocType(value)}>
            <SelectTrigger className="bg-white border-green-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">National ID</SelectItem>
              <SelectItem value="land_deed">Land Deed</SelectItem>
              <SelectItem value="bank_statement">Bank Statement</SelectItem>
              <SelectItem value="invoice">Invoice/Receipt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Capture/Upload Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleCameraCapture}
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 h-auto py-3 bg-white hover:bg-green-50 border-green-200"
          >
            <Camera className="h-4 w-4" />
            <span className="text-xs">Camera</span>
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 h-auto py-3 bg-white hover:bg-green-50 border-green-200"
          >
            <Upload className="h-4 w-4" />
            <span className="text-xs">Upload</span>
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Verification Stats */}
        <div className="pt-3 border-t border-green-200">
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div>
              <p className="text-lg font-bold text-green-600">{verifiedCount}</p>
              <p className="text-xs text-green-700">Verified</p>
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-yellow-700">Pending</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-600">{rejectedCount}</p>
              <p className="text-xs text-red-700">Rejected</p>
            </div>
          </div>

          {/* Recent Documents */}
          {currentDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-green-800">Recent Documents</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {currentDocuments.slice(-3).reverse().map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.status)}
                      <div>
                        <p className="text-xs font-medium text-green-800">{getDocumentTypeLabel(doc.type)}</p>
                        <p className="text-xs text-green-600">{doc.fileName}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Analyzing document...</span>
              <span className="text-green-600">AI Processing</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}