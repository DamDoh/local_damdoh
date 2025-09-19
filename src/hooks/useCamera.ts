import { useState, useRef, useCallback } from 'react';
import { useToast } from './use-toast';

interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

export function useCamera() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Start camera stream
  const startCamera = useCallback(async (options: CameraOptions = {}) => {
    try {
      const constraints = {
        video: {
          facingMode: options.facingMode || 'environment',
          width: options.width || 1280,
          height: options.height || 720
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);

        toast({
          title: "Camera Started",
          description: "Point your camera at the crop to analyze.",
        });
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setCapturedImage(null);
  }, []);

  // Capture image from video stream
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);

    toast({
      title: "Image Captured",
      description: "Analyzing crop health...",
    });

    return imageData;
  }, [toast]);

  // Analyze captured image for document verification
  const analyzeDocument = useCallback(async (imageData: string, documentType: 'id' | 'land_deed' | 'bank_statement' | 'invoice') => {
    if (!imageData) return null;

    setIsAnalyzing(true);

    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'document-image.jpg');
      formData.append('documentType', documentType);

      // Send to document analysis endpoint
      const analysisResponse = await fetch('/api/ai/document-analysis', {
        method: 'POST',
        body: formData
      });

      if (!analysisResponse.ok) {
        throw new Error('Document analysis failed');
      }

      const result = await analysisResponse.json();

      toast({
        title: "Document Analysis Complete",
        description: `Document verified: ${result.authenticity || 'Under review'}`,
      });

      return result;

    } catch (error) {
      console.error('Document analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze document. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Analyze captured image for crop disease
  const analyzeCropDisease = useCallback(async (imageData: string) => {
    if (!imageData) return null;

    setIsAnalyzing(true);

    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'crop-image.jpg');

      // Send to AI analysis endpoint
      const analysisResponse = await fetch('/api/ai/crop-disease-analysis', {
        method: 'POST',
        body: formData
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const result = await analysisResponse.json();

      toast({
        title: "Analysis Complete",
        description: `Detected: ${result.disease || 'Healthy crop'}`,
      });

      return result;

    } catch (error) {
      console.error('Crop analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze image. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Take photo and analyze
  const takePhotoAndAnalyze = useCallback(async () => {
    const imageData = captureImage();
    if (imageData) {
      return await analyzeCropDisease(imageData);
    }
    return null;
  }, [captureImage, analyzeCropDisease]);

  // Upload image from file input
  const uploadImage = useCallback(async (file: File) => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ai/crop-disease-analysis', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload analysis failed');
      }

      const result = await response.json();

      toast({
        title: "Analysis Complete",
        description: `Detected: ${result.disease || 'Healthy crop'}`,
      });

      return result;

    } catch (error) {
      console.error('Upload analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze uploaded image.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    capturedImage,
    isAnalyzing,
    startCamera,
    stopCamera,
    captureImage,
    takePhotoAndAnalyze,
    uploadImage,
    analyzeCropDisease,
    analyzeDocument
  };
}