"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { Leaf, Info, Send, Volume2, Bot, User, ImageUp, Camera, XCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { askFarmingAssistant, type FarmingAssistantOutput } from '@/ai/flows/farming-assistant-flow';
import { APP_NAME } from '@/lib/constants';
import { dummyUsersData } from "@/lib/dummy-data";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | FarmingAssistantOutput;
  imagePreview?: string;
  timestamp: Date;
}

export default function AiAssistantPage() {
  const [inputQuery, setInputQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewDataUri, setPreviewDataUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [chatHistory]);

  useEffect(() => {
    const currentUserName = dummyUsersData['currentDemoUser']?.name || "there";

    setChatHistory([
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: {
          summary: `Hello ${currentUserName}! I'm ${APP_NAME}'s AI Knowledge assistant, your dedicated partner for all things agriculture!\nWondering about sustainable farming, navigating the agri-supply chain, or boosting your farming business? Just ask! I can also guide you through using the DamDoh app's features.\n\n**Got a crop concern?**\nTap the image upload icon (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-image-up inline-block relative -top-px"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 0 0 0-2.814.014L13 16"></path><path d="m14 19.5 3-3 3 3"></path><path d="M17 22v-5.5"></path><circle cx="9" cy="9" r="2"></circle></svg>) to upload a photo, or the camera icon (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-camera inline-block relative -top-px"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>) to snap a picture of any plant issues. I'll do my best to analyze it and suggest sustainable solutions.\n\nReady to explore? How can I assist you today?`,
          detailedPoints: [],
        },
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isCameraOpen) {
        stopCamera();
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    if (previewDataUri) setPreviewDataUri(null);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setIsCameraOpen(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setIsCameraOpen(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    } else {
      toast({ variant: 'destructive', title: 'Camera Not Supported', description: 'Your browser does not support camera access.' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setPreviewDataUri(dataUri);
        stopCamera();
      }
    }
  };

  const clearPreview = () => {
    setPreviewDataUri(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (isCameraOpen) {
      stopCamera();
    }
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    // Conceptual Placeholder: This function is triggered when the user sends a message or submits an image.
    // It represents sending the user's query and/or image data to an AI backend.
    // This backend interaction could be:
    // 1. Direct calls to Firebase AI Logic/Gemini API (for simpler text/image interactions).
    // 2. Calling a Cloud Function which in turn orchestrates interaction with Vertex AI models or Gemini API (for more complex workflows, e.g., needing access to other user data).
    // The `askFarmingAssistant` function is a conceptual abstraction of this backend AI interaction.

    e.preventDefault();
    const query = inputQuery.trim();
    if (!query && !previewDataUri) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query || (previewDataUri ? "Please analyze this image." : "Empty query"),
      imagePreview: previewDataUri || undefined,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);

    setInputQuery('');
    setIsLoading(true);
    const currentImageToSend = previewDataUri;
    setPreviewDataUri(null);
     if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (isCameraOpen) {
        stopCamera();
    }

    try {
      const aiResponse = await askFarmingAssistant({
        query: query || (currentImageToSend ? "Please analyze this image." : "Empty query"),
        photoDataUri: currentImageToSend || undefined
      });
      const newAssistantMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      // Conceptual Placeholder: Handle errors from the AI backend interaction.
      // This could include network errors, AI model errors, or issues with accessing necessary data.
      // Log the error and display a user-friendly message.
      // Consider implementing retry logic for transient errors.

      console.error("Error fetching AI response:", error);
      const errorAssistantMessage: ChatMessage = {
        id: `assistant-error-${Date.now() + 1}`,
        role: 'assistant',
        content: {
          summary: "Sorry, I encountered an error trying to process your request. Please try again.",
          detailedPoints: [],
        },
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Conceptual Placeholder: The AI Assistant could conceptually access data from other modules
  // to provide personalized and context-aware assistance.
  // For example:
  // - User's Farm Profile data (from `farms` collection): Location for weather-based advice, crops grown for specific pest/disease info, farm size for input calculations.
  // - Marketplace data (`marketplace_listings`, `marketplace_orders`): Market price trends for relevant crops, availability of inputs/services, buyer information.
  // - Traceability data (`batches`, `traceability_events`): History of specific crops/batches for yield analysis, issue tracking, or compliance guidance.
  // - Sustainability data (`sustainability_data`): Farmer's practices for providing relevant sustainability recommendations.
  // This data access would happen on the backend (e.g., within the Cloud Function calling the AI)
  // after checking user authentication and potentially data consent if accessing sensitive information.
  return (
    <div className="flex flex-col flex-1 h-full max-w-3xl mx-auto w-full"> {/* Adjusted height, added w-full */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl"> {/* Use flex-1 for Card */}
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bot className="h-6 w-6 text-primary" />
            <span>{APP_NAME} AI Farming Assistant</span>
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow p-4 space-y-6 bg-muted/30" ref={scrollAreaRef}>
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <Avatar className="h-8 w-8 self-start border shrink-0">
                  <AvatarImage src="/placeholder-logo.png" alt="AI Avatar" data-ai-hint="logo damdoh"/>
                  <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-lg rounded-br-none p-3 shadow' : ''}`}>
                {msg.role === 'user' && typeof msg.content === 'string' && (
                  <>
                    {msg.imagePreview && (
                      <div className="mb-2 max-w-full w-auto">
                        <Image src={msg.imagePreview} alt="User upload preview" width={200} height={150} className="rounded-md object-contain max-h-[200px] max-w-full" data-ai-hint="plant diagnosis image"/>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line break-words">{msg.content}</p>
                  </>
                )}
                {msg.role === 'assistant' && typeof msg.content === 'object' && (
                  <Card className="bg-card/80 shadow-md">
                    <CardHeader className="pb-3 pt-4 px-4">
                      <div className="flex justify-between items-center">
                        {/*
                          Conceptual Placeholder: Advanced AI insights (e.g., detailed market forecasts, in-depth risk analysis)
                          could be offered as premium features here, potentially with a lock icon or a "Upgrade to Premium" button.
                        */}
                        <CardTitle className="flex items-center text-md gap-1.5 text-primary">
                          <Leaf className="h-5 w-5" /> DamDoh AI's Knowledge
                        </CardTitle>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => alert("Audio playback feature coming soon!")}>
                          <Volume2 className="mr-1.5 h-3.5 w-3.5" /> Play Audio
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-sm mb-3 whitespace-pre-line break-words" dangerouslySetInnerHTML={{ __html: msg.content.summary.replace(/<svg.*?<\/svg>/g, (match) => match) }}></p>
                      {msg.content.detailedPoints && msg.content.detailedPoints.length > 0 && (
                        <Accordion type="single" collapsible className="w-full">
                          {msg.content.detailedPoints.map((point, index) => (
                            <AccordionItem value={`item-${index}`} key={index} className="border-muted-foreground/20">
                              <AccordionTrigger className="text-sm hover:no-underline py-2.5">
                                <div className="flex items-center gap-2 text-left">
                                  <Info className="h-4 w-4 text-primary/80 shrink-0" />
                                  <span>{point.title}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-sm text-muted-foreground pt-1 pb-3 whitespace-pre-line break-words">
                                {point.content}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
               {msg.role === 'user' && (
                <Avatar className="h-8 w-8 self-start border shrink-0">
                   <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="profile person"/>
                  <AvatarFallback><User size={18}/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 self-start border shrink-0">
                  <AvatarImage src="/placeholder-logo.png" alt="AI Avatar" data-ai-hint="logo damdoh"/>
                  <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
                <div className="max-w-[80%]">
                    <Card className="bg-card/80 shadow-md">
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[220px]" />
                        </CardContent>
                    </Card>
                </div>
            </div>
          )}
        </ScrollArea>

        {(previewDataUri || isCameraOpen) && (
          <div className="p-2 border-t bg-muted/50">
            {previewDataUri && !isCameraOpen && (
              <div className="relative group max-w-[150px] sm:max-w-[200px] mx-auto">
                <Image
                  src={previewDataUri}
                  alt="Preview"
                  width={200}
                  height={150}
                  className="rounded-md object-contain max-h-[120px] w-full h-auto border"
                  data-ai-hint="plant preview"
                />
                <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-80 group-hover:opacity-100" onClick={clearPreview}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isCameraOpen && (
              <div className="flex flex-col items-center gap-2">
                <video ref={videoRef} className="w-full max-w-[300px] aspect-video rounded-md bg-black" autoPlay playsInline muted />
                <div className="flex gap-2">
                    <Button onClick={handleCaptureImage} size="sm"><Camera className="mr-2 h-4 w-4" />Capture</Button>
                    <Button variant="outline" size="sm" onClick={stopCamera}><RefreshCcw className="mr-2 h-4 w-4" />Close Camera</Button>
                </div>
              </div>
            )}
          </div>
        )}

        { hasCameraPermission === false && !isCameraOpen && (
           <Alert variant="destructive" className="m-4">
              <Camera className="h-4 w-4" />
              <AlertTitle>Camera Access Denied</AlertTitle>
              <AlertDescription>
                To use the camera for diagnosis, please enable camera permissions in your browser settings and refresh.
              </AlertDescription>
            </Alert>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <CardFooter className="p-2 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
            <Button variant="ghost" size="icon" type="button" onClick={() => fileInputRef.current?.click()} title="Upload Image" disabled={isLoading || isCameraOpen}>
                <ImageUp className="h-5 w-5" />
            </Button>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }}/>

            <Button variant="ghost" size="icon" type="button" onClick={startCamera} title="Use Camera" disabled={isLoading || isCameraOpen}>
                <Camera className="h-5 w-5" />
            </Button>

            <Input
              type="text"
              placeholder="Ask about farming, describe your image..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-grow text-sm h-10"
              disabled={isLoading}
              autoFocus
            />
            <Button type="submit" disabled={isLoading || (!inputQuery.trim() && !previewDataUri)}>
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}



"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { Leaf, Info, Send, Volume2, Bot, User, ImageUp, Camera, XCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { askFarmingAssistant, type FarmingAssistantOutput } from '@/ai/flows/farming-assistant-flow';
import { APP_NAME } from '@/lib/constants';
import { dummyUsersData } from "@/lib/dummy-data";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | FarmingAssistantOutput;
  imagePreview?: string;
  timestamp: Date;
}

export default function AiAssistantPage() {
  const [inputQuery, setInputQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewDataUri, setPreviewDataUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [chatHistory]);
  
  useEffect(() => {
    const currentUserName = dummyUsersData['currentDemoUser']?.name || "there";

    setChatHistory([
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: {
          summary: `Hello ${currentUserName}! I'm ${APP_NAME}'s AI Knowledge assistant, your dedicated partner for all things agriculture!\nWondering about sustainable farming, navigating the agri-supply chain, or boosting your farming business? Just ask! I can also guide you through using the DamDoh app's features.\n\n**Got a crop concern?**\nTap the image upload icon (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-image-up inline-block relative -top-px"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L13 16"></path><path d="m14 19.5 3-3 3 3"></path><path d="M17 22v-5.5"></path><circle cx="9" cy="9" r="2"></circle></svg>) to upload a photo, or the camera icon (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-camera inline-block relative -top-px"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>) to snap a picture of any plant issues. I'll do my best to analyze it and suggest sustainable solutions.\n\nReady to explore? How can I assist you today?`,
          detailedPoints: [],
        },
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isCameraOpen) {
        stopCamera();
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    if (previewDataUri) setPreviewDataUri(null);
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setIsCameraOpen(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setIsCameraOpen(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    } else {
      toast({ variant: 'destructive', title: 'Camera Not Supported', description: 'Your browser does not support camera access.' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setPreviewDataUri(dataUri);
        stopCamera(); 
      }
    }
  };
  
  const clearPreview = () => {
    setPreviewDataUri(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (isCameraOpen) {
      stopCamera();
    }
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = inputQuery.trim();
    if (!query && !previewDataUri) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query || (previewDataUri ? "Please analyze this image." : "Empty query"),
      imagePreview: previewDataUri || undefined,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    
    setInputQuery('');
    setIsLoading(true);
    const currentImageToSend = previewDataUri;
    setPreviewDataUri(null);
     if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (isCameraOpen) {
        stopCamera();
    }

    try {
      const aiResponse = await askFarmingAssistant({ 
        query: query || (currentImageToSend ? "Please analyze this image." : "Empty query"), 
        photoDataUri: currentImageToSend || undefined 
      });
      const newAssistantMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorAssistantMessage: ChatMessage = {
        id: `assistant-error-${Date.now() + 1}`,
        role: 'assistant',
        content: {
          summary: "Sorry, I encountered an error trying to process your request. Please try again.",
          detailedPoints: [],
        },
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full max-w-3xl mx-auto w-full"> {/* Adjusted height, added w-full */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl"> {/* Use flex-1 for Card */}
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bot className="h-6 w-6 text-primary" />
            <span>{APP_NAME} AI Farming Assistant</span>
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow p-4 space-y-6 bg-muted/30" ref={scrollAreaRef}>
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <Avatar className="h-8 w-8 self-start border shrink-0">
                  <AvatarImage src="/placeholder-logo.png" alt="AI Avatar" data-ai-hint="logo damdoh"/>
                  <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-lg rounded-br-none p-3 shadow' : ''}`}>
                {msg.role === 'user' && typeof msg.content === 'string' && (
                  <>
                    {msg.imagePreview && (
                      <div className="mb-2 max-w-full w-auto">
                        <Image src={msg.imagePreview} alt="User upload preview" width={200} height={150} className="rounded-md object-contain max-h-[200px] max-w-full" data-ai-hint="plant diagnosis image"/>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line break-words">{msg.content}</p>
                  </>
                )}
                {msg.role === 'assistant' && typeof msg.content === 'object' && (
                  <Card className="bg-card/80 shadow-md">
                    <CardHeader className="pb-3 pt-4 px-4">
                      <div className="flex justify-between items-center">
                        {/* 
                          Conceptual Placeholder: Advanced AI insights (e.g., detailed market forecasts, in-depth risk analysis) 
                          could be offered as premium features here, potentially with a lock icon or a "Upgrade to Premium" button.
                        */}
                        <CardTitle className="flex items-center text-md gap-1.5 text-primary">
                          <Leaf className="h-5 w-5" /> DamDoh AI's Knowledge
                        </CardTitle>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => alert("Audio playback feature coming soon!")}>
                          <Volume2 className="mr-1.5 h-3.5 w-3.5" /> Play Audio
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-sm mb-3 whitespace-pre-line break-words" dangerouslySetInnerHTML={{ __html: msg.content.summary.replace(/<svg.*?<\/svg>/g, (match) => match) }}></p>
                      {msg.content.detailedPoints && msg.content.detailedPoints.length > 0 && (
                        <Accordion type="single" collapsible className="w-full">
                          {msg.content.detailedPoints.map((point, index) => (
                            <AccordionItem value={`item-${index}`} key={index} className="border-muted-foreground/20">
                              <AccordionTrigger className="text-sm hover:no-underline py-2.5">
                                <div className="flex items-center gap-2 text-left">
                                  <Info className="h-4 w-4 text-primary/80 shrink-0" />
                                  <span>{point.title}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-sm text-muted-foreground pt-1 pb-3 whitespace-pre-line break-words">
                                {point.content}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
               {msg.role === 'user' && (
                <Avatar className="h-8 w-8 self-start border shrink-0">
                   <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="profile person"/>
                  <AvatarFallback><User size={18}/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 self-start border shrink-0">
                  <AvatarImage src="/placeholder-logo.png" alt="AI Avatar" data-ai-hint="logo damdoh"/>
                  <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
                <div className="max-w-[80%]">
                    <Card className="bg-card/80 shadow-md">
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[220px]" />
                        </CardContent>
                    </Card>
                </div>
            </div>
          )}
        </ScrollArea>
        
        {(previewDataUri || isCameraOpen) && (
          <div className="p-2 border-t bg-muted/50">
            {previewDataUri && !isCameraOpen && (
              <div className="relative group max-w-[150px] sm:max-w-[200px] mx-auto">
                <Image
                  src={previewDataUri}
                  alt="Preview"
                  width={200} 
                  height={150} 
                  className="rounded-md object-contain max-h-[120px] w-full h-auto border"
                  data-ai-hint="plant preview"
                />
                <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-80 group-hover:opacity-100" onClick={clearPreview}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isCameraOpen && (
              <div className="flex flex-col items-center gap-2">
                <video ref={videoRef} className="w-full max-w-[300px] aspect-video rounded-md bg-black" autoPlay playsInline muted />
                <div className="flex gap-2">
                    <Button onClick={handleCaptureImage} size="sm"><Camera className="mr-2 h-4 w-4" />Capture</Button>
                    <Button variant="outline" size="sm" onClick={stopCamera}><RefreshCcw className="mr-2 h-4 w-4" />Close Camera</Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        { hasCameraPermission === false && !isCameraOpen && (
           <Alert variant="destructive" className="m-4">
              <Camera className="h-4 w-4" />
              <AlertTitle>Camera Access Denied</AlertTitle>
              <AlertDescription>
                To use the camera for diagnosis, please enable camera permissions in your browser settings and refresh.
              </AlertDescription>
            </Alert>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <CardFooter className="p-2 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
            <Button variant="ghost" size="icon" type="button" onClick={() => fileInputRef.current?.click()} title="Upload Image" disabled={isLoading || isCameraOpen}>
                <ImageUp className="h-5 w-5" />
            </Button>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }}/>
            
            <Button variant="ghost" size="icon" type="button" onClick={startCamera} title="Use Camera" disabled={isLoading || isCameraOpen}>
                <Camera className="h-5 w-5" />
            </Button>

            <Input
              type="text"
              placeholder="Ask about farming, describe your image..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-grow text-sm h-10"
              disabled={isLoading}
              autoFocus
            />
            <Button type="submit" disabled={isLoading || (!inputQuery.trim() && !previewDataUri)}>
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

