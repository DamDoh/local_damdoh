
"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createAgriEventSchema, type CreateAgriEventValues } from "@/lib/form-schemas";
import { AGRI_EVENT_TYPE_FORM_OPTIONS } from "@/lib/constants";
import { ArrowLeft, Save, UploadCloud, CalendarIcon, Clock, MapPin, Tag, Users, Link as LinkIcon, ImageUp, CaseUpper, FileText, Rss, Share2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function CreateAgriEventPage() {
  const { toast } = useToast();
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [createdEventTitle, setCreatedEventTitle] = useState<string | null>(null);

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
    },
  });

  function onSubmit(data: CreateAgriEventValues) {
    setSubmissionStatus('submitting'); // Optional: for loading states later
    console.log("New Agri-Event Data:", data);
    if (data.imageFile) {
      console.log("Uploaded file details:", {
        name: data.imageFile.name,
        size: data.imageFile.size,
        type: data.imageFile.type,
      });
    }

    // Simulate backend submission
    setTimeout(() => { // Simulate async operation
      setCreatedEventTitle(data.title);
      setSubmissionStatus('success');
      toast({
        title: "Event Created Successfully!",
        description: `Your event "${data.title}" is ready. What would you like to do next?`,
      });
    }, 1000); // Simulate network delay
  }

  const handleCreateAnother = () => {
    form.reset();
    setSubmissionStatus('idle');
    setCreatedEventTitle(null);
  };

  return (
    <div className="space-y-6">
      <Link href="/agri-events" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Agri-Business Events
      </Link>

      {submissionStatus === 'success' ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Event "{createdEventTitle}" Created!</CardTitle>
            <CardDescription>Your event has been successfully listed. What would you like to do next?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => console.log(`Action: Post to Feed - Event: ${createdEventTitle}`)}
            >
              <Rss className="mr-2 h-4 w-4" /> Post to Feed
            </Button>
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={() => console.log(`Action: Share Event - Event: ${createdEventTitle}`)}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share Event Link
            </Button>
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={() => console.log(`Action: Invite Network - Event: ${createdEventTitle}`)}
            >
              <Users className="mr-2 h-4 w-4" /> Invite Network
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />Event Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
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
                          {/* <UploadCloud className="h-5 w-5 text-muted-foreground" /> Input component already has icon styling if needed */}
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
                        Upload an image/banner from your device (max 5MB, JPG/PNG/WEBP).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Submitting...
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

    