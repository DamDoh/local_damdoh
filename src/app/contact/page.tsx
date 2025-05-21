
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Contact Us</CardTitle>
          </div>
          <CardDescription>Get in touch with the DamDoh team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Mail className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Contact Information - Content Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This page will provide ways to contact DamDoh for support, partnerships, or inquiries.
              You'll find email addresses, a contact form, or other relevant contact details here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
