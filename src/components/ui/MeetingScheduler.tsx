/**
 * MeetingScheduler Component - Video call integration for messaging
 * Allows users to schedule and join video meetings directly from conversations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, Clock, Users, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { MeetingService, MeetingDetails, MeetingLink } from "@/services/dashboard/MeetingService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MeetingSchedulerProps {
  conversationId?: string;
  recipientName?: string;
  trigger?: React.ReactNode;
  onMeetingScheduled?: (meetingLink: MeetingLink) => void;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  conversationId,
  recipientName,
  trigger,
  onMeetingScheduled
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [meetingLink, setMeetingLink] = useState<MeetingLink | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [title, setTitle] = useState(`Meeting with ${recipientName || 'Contact'}`);
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<'zoom' | 'teams' | 'meet'>('zoom');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('30');

  const meetingService = MeetingService.getInstance();
  const platforms = meetingService.getAvailablePlatforms();

  const handleScheduleMeeting = async () => {
    if (!title.trim() || !startTime) {
      toast({
        title: "Missing Information",
        description: "Please provide a meeting title and start time.",
        variant: "destructive"
      });
      return;
    }

    const startDateTime = new Date(startTime);
    const meetingDetails: MeetingDetails = {
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startDateTime,
      duration: parseInt(duration),
      platform,
      attendees: recipientName ? [recipientName] : undefined
    };

    // Validate meeting details
    const validation = meetingService.validateMeetingDetails(meetingDetails);
    if (!validation.isValid) {
      toast({
        title: "Invalid Meeting Details",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsScheduling(true);
    try {
      const link = await meetingService.generateMeetingLink(meetingDetails);
      setMeetingLink(link);

      toast({
        title: "Meeting Scheduled!",
        description: `Your ${link.platform} meeting has been created.`,
      });

      onMeetingScheduled?.(link);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Scheduling Failed",
        description: "Unable to create meeting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCopyLink = async () => {
    if (!meetingLink) return;

    try {
      await navigator.clipboard.writeText(meetingLink.url);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Meeting link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleJoinMeeting = () => {
    if (meetingLink) {
      window.open(meetingLink.url, '_blank');
    }
  };

  const resetForm = () => {
    setTitle(`Meeting with ${recipientName || 'Contact'}`);
    setDescription('');
    setPlatform('zoom');
    setStartTime('');
    setDuration('30');
    setMeetingLink(null);
    setCopied(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Video className="h-4 w-4" />
            Schedule Meeting
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Schedule Video Meeting
          </DialogTitle>
        </DialogHeader>

        {!meetingLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter meeting title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Meeting agenda or notes"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className="flex items-center gap-2">
                          <span>{p.icon}</span>
                          {p.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleMeeting} disabled={isScheduling}>
                {isScheduling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Meeting Created!</h3>
              <p className="text-sm text-muted-foreground">
                Your {meetingLink.platform} meeting is ready
              </p>
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Meeting Link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={meetingLink.url}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="shrink-0"
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {meetingLink.meetingId && (
                    <div>
                      <Label className="text-sm font-medium">Meeting ID</Label>
                      <p className="text-sm font-mono mt-1">{meetingLink.meetingId}</p>
                    </div>
                  )}

                  {meetingLink.password && (
                    <div>
                      <Label className="text-sm font-medium">Password</Label>
                      <p className="text-sm font-mono mt-1">{meetingLink.password}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Instructions</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {meetingLink.instructions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button onClick={handleJoinMeeting} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Join Meeting
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};