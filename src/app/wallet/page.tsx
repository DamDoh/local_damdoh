
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, Landmark, TrendingUp, Info } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <WalletIcon className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">My Digital Wallet</CardTitle>
          </div>
          <CardDescription>Manage your DamDoh credits for trading, investments, and platform services (Feature Coming Soon).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <Landmark className="h-16 w-16 text-muted-foreground/50" />
              <Info className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Digital Wallet Feature: Under Development</h3>
            <p className="text-muted-foreground max-w-md">
              We are building a secure and efficient digital wallet to facilitate transactions within the DamDoh ecosystem. Future capabilities will include:
            </p>
            <ul className="text-muted-foreground list-disc list-inside mt-2 text-left max-w-sm mx-auto">
              <li>Viewing your credit balance and transaction history.</li>
              <li>Requesting credit for approved investments or large trades.</li>
              <li>Securely topping-up your wallet using various payment methods.</li>
              <li>Facilitating payments for marketplace transactions and platform services.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Stay tuned for updates as we work to enable seamless and secure financial activities for the DamDoh agricultural network.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
