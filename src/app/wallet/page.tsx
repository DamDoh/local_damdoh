
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, Landmark, TrendingUp } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <WalletIcon className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">My Digital Wallet</CardTitle>
          </div>
          <CardDescription>Manage your DamDoh credits for trading, investments, and platform services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <Landmark className="h-16 w-16 text-muted-foreground/50" />
              <TrendingUp className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Wallet Functionality Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This section will allow you to:
            </p>
            <ul className="text-muted-foreground list-disc list-inside mt-2 text-left max-w-sm mx-auto">
              <li>View your credit balance.</li>
              <li>Request credit for investments or large trades.</li>
              <li>Top-up your wallet using various payment methods.</li>
              <li>Track your transaction history.</li>
              <li>Securely manage your financial activities within the DamDoh platform.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Stay tuned for updates as we enable secure and efficient financial transactions for the DamDoh agricultural network.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
