
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cookie className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Cookie Policy</CardTitle>
          </div>
          <CardDescription>How DamDoh uses cookies and similar technologies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <Cookie className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Cookie Policy - Content Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This page will explain how DamDoh uses cookies and other tracking technologies to enhance your experience and provide our services.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
