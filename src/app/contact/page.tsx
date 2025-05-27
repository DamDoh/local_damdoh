
"use client"; // Add this line

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Mail className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">Get In Touch</CardTitle>
          </div>
          <CardDescription className="text-lg">
            We'd love to hear from you! Whether you have a question, feedback, or a partnership proposal, please reach out.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/>Email Us</h3>
              <p className="text-muted-foreground">For general inquiries: <a href="mailto:info@damdoh.org" className="text-primary hover:underline">info@damdoh.org</a></p>
              <p className="text-muted-foreground">For support: <a href="mailto:support@damdoh.org" className="text-primary hover:underline">support@damdoh.org</a></p>
              <p className="text-muted-foreground">For partnerships: <a href="mailto:partners@damdoh.org" className="text-primary hover:underline">partners@damdoh.org</a></p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><Phone className="h-5 w-5 text-primary"/>Call Us</h3>
              <p className="text-muted-foreground">Our phone lines are open Monday - Friday, 9 AM - 5 PM (Your Timezone).</p>
              <p className="text-muted-foreground">Phone: +1 (555) DAM-DOH0 (Placeholder)</p>
            </div>
             <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/>Our Office</h3>
              <p className="text-muted-foreground">DamDoh Headquarters (Placeholder)</p>
              <p className="text-muted-foreground">123 Agri-Tech Avenue, Food Security City, Global</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Send Us a Message</h3>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your Full Name" />
              </div>
              <div>
                <Label htmlFor="email_contact">Email Address</Label>
                <Input type="email" id="email_contact" placeholder="your.email@example.com" />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Reason for contacting us" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your detailed message..." className="min-h-[120px]" />
              </div>
              <Button type="button" onClick={() => alert("Contact form submission is a placeholder. In a real app, this would send an email or save to a database.")}>
                <Send className="mr-2 h-4 w-4" /> Send Message
              </Button>
              <p className="text-xs text-muted-foreground">Note: This form is for demonstration. Actual submission is not implemented.</p>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
