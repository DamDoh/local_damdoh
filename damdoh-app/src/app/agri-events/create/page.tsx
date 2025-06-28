
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createAgriEventSchema, type CreateAgriEventValues } from "@/lib/form-schemas";
import { AGRI_EVENT_TYPE_FORM_OPTIONS } from "@/lib/constants";
import { ArrowLeft, Save, UploadCloud, CalendarIcon, Clock, MapPin, Tag, Users, Link as LinkIcon, ImageUp, CaseUpper, FileText, Rss, Share2, RefreshCw, CheckCircle, Ticket, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-utils";
import { uploadFileAndGetURL } from "@/lib/storage-utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import { format } from 'date-fns';

export default function CreateAgriEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [createdEvent, setCreatedEvent] = useState<{ id: string, title: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const functions = getFunctions(firebaseApp);
  const createAgriEventCallable = useMemo(() => httpsCallable(functions, 'createAgriEvent'), [functions]);

  const form = useForm<CreateAgriEventValues>({
    resolver: zodResolver(createAgriEventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: undefined,
      eventTime: "",
      location: "",
      eventType: undefined,
      organizer: "",
      websiteLink: "",
      imageUrl: "",
      imageFile: undefined,
      registrationEnabled: false,
      attendeeLimit: undefined,
      price: undefined,
      currency: "USD",
    },
  });

  const registrationEnabled = form.watch("registrationEnabled");

  async function onSubmit(data: CreateAgriEventValues) {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create an event." });
      return;
    }
    setIsSubmitting(true);
    try {
      let uploadedImageUrl = data.imageUrl;
      if (data.imageFile) {
        toast({ title: "Image Uploading...", description: "Please wait while your event banner is uploaded." });
        uploadedImageUrl = await uploadFileAndGetURL(data.imageFile, `agri-events/${user.uid}`);
        toast({ title: "Image Upload Complete!", variant: "default" });
      }

      const payload = {
        ...data,
        imageUrl: uploadedImageUrl,
        imageFile: undefined, // Don't send the file object to the backend
        eventDate: data.eventDate.toISOString(), // Convert date to string for backend
        attendeeLimit: data.attendeeLimit ? Number(data.attendeeLimit) : null,
        price: data.price ? Number(data.price) : null,
      };

      const result = await createAgriEventCallable(payload);
      const newEvent = result.data as { eventId: string, title: string };
      
      setCreatedEvent({ id: newEvent.eventId, title: newEvent.title });
      setSubmissionStatus('success');
      toast({
        title: "Event Created Successfully!",
        description: `Your event "${data.title}" is now listed.`,
      });
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({ variant: "destructive", title: "Submission Failed", description: error.message || "An error occurred while saving the event." });
      setSubmissionStatus('idle');
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleCreateAnother = () => {
    form.reset();
    setSubmissionStatus('idle');
    setCreatedEvent(null);
  };

  const handleShareLink = () => {
    if(!createdEvent) return;
    navigator.clipboard.writeText(`${window.location.origin}/agri-events/${createdEvent.id}`);
    toast({ title: "Link Copied!", description: "Event link copied to clipboard." });
  };


  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/agri-events">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Agri-Business Events
        </Link>
      </Button>

      {submissionStatus === 'success' && createdEvent ? (
        <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
                <div className="mx-auto bg-green-100 dark:bg-green-900/30 rounded-full h-16 w-16 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl pt-4">Event "{createdEvent.title}" Created!</CardTitle>
                <CardDescription>Your event has been successfully listed. What would you like to do next?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href={`/agri-events/${createdEvent.id}/manage`}>Manage Event Registrations & Promotions</Link>
              </Button>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleShareLink}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share Event Link
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button variant="outline" className="w-full sm:w-auto flex-1" onClick={handleCreateAnother}>
              <RefreshCw className="mr-2 h-4 w-4" /> Create Another Event
            </Button>
            <Button asChild className="w-full sm:w-auto flex-1">
              <Link href="/agri-events">View All Events</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Agri-Business Event</CardTitle>
            <CardDescription>Fill in the details below to list your conference, webinar, workshop, or other agricultural event.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><CaseUpper className="h-4 w-4 text-muted-foreground" />Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Annual Sustainable Agriculture Summit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide details about the event, agenda, speakers, target audience, etc."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />Event Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : (<span>Pick a date</span>)}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="eventTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />Event Time (Optional)</FormLabel>
                        <FormControl>
                          <Input type="time" placeholder="e.g., 14:30" {...field} />
                        </FormControl>
                        <FormDescription>Use HH:MM format (e.g., 09:00 or 15:30)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Nairobi, Kenya or Online/Virtual" {...field} />
                      </FormControl>
                      <FormDescription>
                        Specify the city, venue, or if it's an online event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AGRI_EVENT_TYPE_FORM_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="organizer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />Organizer (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., DamDoh Hub, Local Farmers Co-op" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="websiteLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-muted-foreground" />Event Website/Registration Link (Optional)</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com/event-details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2"><Ticket className="h-4 w-4 text-muted-foreground"/>Enable DamDoh Registration</FormLabel>
                        <FormDescription>
                          Allow users to register for this event directly through DamDoh.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {registrationEnabled && (
                  <>
                    <FormField
                      control={form.control}
                      name="attendeeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground"/>Attendee Limit (Optional)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                          </FormControl>
                          <FormDescription>Leave blank for unlimited attendees.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className='flex items-center gap-2'><DollarSign className="h-4 w-4 text-muted-foreground" />Price (Optional)</FormLabel>
                                <FormControl>
                                <Input type="number" step="0.01" placeholder="e.g., 25.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormDescription>Leave blank for a free event.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., USD" {...field} />
                                </FormControl>
                                <FormDescription>3-letter code (e.g. KES).</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                  </>
                )}
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><ImageUp className="h-4 w-4 text-muted-foreground" />Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://your-image-host.com/event-banner.png" {...field} />
                      </FormControl>
                       <FormDescription>
                        Link to an image/banner for your event if it's hosted online.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><UploadCloud className="h-4 w-4 text-muted-foreground" />Or Upload Image (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => onChange(e.target.files?.[0])}
                            className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-primary/10 file:text-primary
                              hover:file:bg-primary/20"
                            {...rest}
                          />
                        </div>
                      </FormControl>
                       <FormDescription>
                        Upload an image from your device (max 5MB, JPG/PNG/WEBP).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Create Event
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
