/**
 * Mobile Experience Widget - Advanced mobile-first capabilities
 * Displays offline status, field operations, mobile workflows, and voice commands
 * Single Responsibility: Mobile experience visualization and interaction
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Smartphone, Wifi, WifiOff, Mic, Camera, MapPin,
  CheckCircle, Clock, AlertTriangle, Zap, Cloud,
  CloudOff, Navigation, Settings, Play, Square
} from 'lucide-react';
import { MobileExperienceService, FieldOperation, MobileWorkflow, VoiceCommand } from "@/services/dashboard/MobileExperienceService";
import { useAuth } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

interface MobileExperienceWidgetProps {
  defaultTab?: 'offline' | 'field' | 'workflows' | 'voice';
  compact?: boolean;
}

export const MobileExperienceWidget: React.FC<MobileExperienceWidgetProps> = ({
  defaultTab = 'offline',
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineDataCount, setOfflineDataCount] = useState(0);
  const [fieldOperations, setFieldOperations] = useState<FieldOperation[]>([]);
  const [mobileWorkflows, setMobileWorkflows] = useState<MobileWorkflow[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<VoiceCommand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const mobileService = MobileExperienceService.getInstance();

  const loadData = async (showRefreshIndicator = false) => {
    if (!user?.id) return;

    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [
        offlineData,
        operations,
        workflows
      ] = await Promise.all([
        mobileService.getOfflineData(),
        mobileService.getFieldOperations(),
        mobileService.getMobileWorkflows()
      ]);

      setOfflineDataCount(offlineData.length);
      setFieldOperations(operations);
      setMobileWorkflows(workflows);
    } catch (error) {
      console.error('Error loading mobile experience data:', error);
      toast({
        title: "Error",
        description: "Failed to load mobile experience data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast({ title: "Back Online", description: "Syncing your data..." });
      loadData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "You can continue working offline.",
        variant: "default"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id]);

  const handleSyncData = async () => {
    try {
      const result = await mobileService.syncOfflineData();
      toast({
        title: "Sync Complete",
        description: `Synced ${result.synced} items successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
      });
      loadData();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVoiceCommand = async () => {
    if (isRecording) {
      setIsRecording(false);
      // In a real implementation, this would stop recording and process the audio
      // For now, simulate a voice command
      const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/wav' });
      try {
        const command = await mobileService.processVoiceCommand(mockAudioBlob);
        setLastVoiceCommand(command);

        // Execute the command
        const result = await mobileService.executeVoiceCommand(command);
        toast({
          title: "Voice Command Executed",
          description: `Processed: "${command.command}"`,
        });
      } catch (error) {
        toast({
          title: "Voice Command Failed",
          description: "Unable to process voice command.",
          variant: "destructive"
        });
      }
    } else {
      setIsRecording(true);
      // In a real implementation, this would start recording
      toast({
        title: "Listening...",
        description: "Speak your command clearly.",
      });
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      const result = await mobileService.executeMobileWorkflow(workflowId, 'current-farm');
      toast({
        title: "Workflow Completed",
        description: `Successfully executed ${mobileWorkflows.find(w => w.id === workflowId)?.name}`,
      });
      loadData();
    } catch (error) {
      toast({
        title: "Workflow Failed",
        description: "Unable to execute mobile workflow.",
        variant: "destructive"
      });
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'scouting': return <Navigation className="h-4 w-4" />;
      case 'harvesting': return <CheckCircle className="h-4 w-4" />;
      case 'planting': return <Settings className="h-4 w-4" />;
      case 'irrigation': return <Cloud className="h-4 w-4" />;
      case 'pest_control': return <AlertTriangle className="h-4 w-4" />;
      case 'soil_testing': return <MapPin className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-cyan-800">
            <Smartphone className="h-5 w-5 mr-2 text-cyan-600 animate-pulse" />
            Mobile Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
        <Smartphone className="h-5 w-5 text-cyan-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-cyan-900">
            {isOnline ? 'Online' : 'Offline'} • {offlineDataCount} pending
          </div>
          <div className="text-xs text-cyan-700">
            {fieldOperations.length} field ops • {mobileWorkflows.length} workflows
          </div>
        </div>
        {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-cyan-800">
            <Smartphone className="h-5 w-5 mr-2 text-cyan-600" />
            Mobile Experience
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <Zap className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-cyan-600">
          Field operations, offline capabilities, and mobile workflows
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="offline" className="flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              <span className="hidden sm:inline">Offline</span>
            </TabsTrigger>
            <TabsTrigger value="field" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Field</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              <span className="hidden sm:inline">Workflows</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-1">
              <Mic className="h-3 w-3" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="offline" className="space-y-4">
            {/* Connection Status */}
            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Connection Status</h4>
                <Badge className={isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {isOnline ? 'Connected' : 'Offline Mode'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Offline Data</span>
                  <span className="font-medium">{offlineDataCount} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Sync</span>
                  <span className="font-medium">2 min ago</span>
                </div>
                {!isOnline && (
                  <div className="pt-2">
                    <Button onClick={handleSyncData} className="w-full" size="sm">
                      <Cloud className="h-4 w-4 mr-2" />
                      Sync Data ({offlineDataCount} pending)
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Offline Capabilities */}
            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <h4 className="font-semibold text-gray-900 mb-3">Offline Capabilities</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Field operation logging</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Photo capture and storage</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>GPS location tracking</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Mobile workflow execution</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="field" className="space-y-4">
            {fieldOperations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-cyan-300 mx-auto mb-3" />
                <p className="text-cyan-600 text-sm">No field operations recorded</p>
                <p className="text-cyan-500 text-xs mt-1">Start logging your field activities!</p>
                <Button className="mt-3" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Record Operation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {fieldOperations.slice(0, 3).map((operation) => (
                  <div key={operation.id} className="p-3 bg-white rounded-lg border border-cyan-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getOperationIcon(operation.type)}
                        <span className="font-medium text-gray-900 capitalize">
                          {operation.type.replace('_', ' ')}
                        </span>
                        <Badge className={operation.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {operation.completed ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {operation.timestamp.toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {operation.notes || 'No additional notes'}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {operation.location.latitude.toFixed(4)}, {operation.location.longitude.toFixed(4)}
                      </span>
                      {operation.photos.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          {operation.photos.length} photos
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            {mobileWorkflows.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-cyan-300 mx-auto mb-3" />
                <p className="text-cyan-600 text-sm">No mobile workflows available</p>
                <p className="text-cyan-500 text-xs mt-1">Configure workflows for field operations!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mobileWorkflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 bg-white rounded-lg border border-cyan-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{workflow.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">Mobile workflow for {workflow.type.replace('_', ' ')}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {workflow.estimatedDuration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Settings className="h-3 w-3" />
                            {workflow.steps.length} steps
                          </span>
                          <Badge className="text-xs" variant={workflow.offlineCapable ? 'default' : 'secondary'}>
                            {workflow.offlineCapable ? 'Offline' : 'Online Only'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleExecuteWorkflow(workflow.id)}
                        size="sm"
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Execute Workflow
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            {/* Voice Command Interface */}
            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <div className="text-center mb-4">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  isRecording ? 'bg-red-100 animate-pulse' : 'bg-cyan-100'
                }`}>
                  <Mic className={`h-8 w-8 ${isRecording ? 'text-red-600' : 'text-cyan-600'}`} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isRecording ? 'Listening...' : 'Voice Commands'}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {isRecording
                    ? 'Speak your command clearly'
                    : 'Tap to start voice command'
                  }
                </p>
                <Button
                  onClick={handleVoiceCommand}
                  size="lg"
                  className={isRecording ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {isRecording ? (
                    <>
                      <Square className="h-5 w-5 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Start Voice Command
                    </>
                  )}
                </Button>
              </div>

              {/* Voice Command Examples */}
              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Example Commands:</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• "Create harvest task for maize field A"</div>
                  <div>• "Log irrigation for field B"</div>
                  <div>• "Record pest observation"</div>
                  <div>• "Check weather forecast"</div>
                </div>
              </div>
            </div>

            {/* Last Voice Command */}
            {lastVoiceCommand && (
              <div className="p-4 bg-white rounded-lg border border-cyan-200">
                <h4 className="font-semibold text-gray-900 mb-2">Last Command</h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Command:</span> "{lastVoiceCommand.command}"
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Intent:</span> {lastVoiceCommand.intent.replace('_', ' ')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Confidence:</span> {Math.round(lastVoiceCommand.confidence * 100)}%
                  </div>
                  <Badge className={lastVoiceCommand.executed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {lastVoiceCommand.executed ? 'Executed' : 'Pending'}
                  </Badge>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};