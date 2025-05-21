
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          </div>
          <CardDescription>Understand how DamDoh handles your data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <ShieldCheck className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Privacy Policy - Content Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              Our comprehensive Privacy Policy will be detailed here, explaining how we collect, use, and protect your personal information on the DamDoh platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
