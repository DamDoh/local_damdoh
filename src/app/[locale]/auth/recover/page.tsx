

"use client";
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QrCode, ArrowLeft, Users, Shield, Loader2, Phone } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(() => import('@/components/QrScanner').then(mod => mod.QrScanner), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin"/></div>
});


export default function RecoverPage() {
  const t = useTranslations('Auth.recoverPage');
  const { toast } = useToast();
  const functions = getFunctions(firebaseApp);
  const { user, loading: authLoading } = useAuth();

  const [recoveryStep, setRecoveryStep] = useState<'initial' | 'enter_phone' | 'display_qr' | 'error'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recoverySession, setRecoverySession] = useState<{ sessionId: string; recoveryQrValue: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const createRecoverySession = useMemo(() => httpsCallable(functions, 'createRecoverySession'), [functions]);
  const scanRecoveryQrCallable = useMemo(() => httpsCallable(functions, 'scanRecoveryQr'), [functions]);

  const handleStartRecovery = () => {
    setRecoveryStep('enter_phone');
    setErrorMessage(null);
  };

  const handlePhoneNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
        const result = await createRecoverySession({ phoneNumber });
        const data = result.data as { sessionId: string, recoveryQrValue: string };
        setRecoverySession(data);
        setRecoveryStep('display_qr');
    } catch (error: any) {
        console.error("Error creating recovery session:", error);
        setErrorMessage(error.message || "Could not start recovery. Please check the phone number and try again.");
        setRecoveryStep('enter_phone');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleHelpFriend = () => {
    setIsScanning(true);
  };

  const handleScanSuccess = async (decodedText: string) => {
    setIsScanning(false);
    // Expected format: damdoh:recover:SESSION_ID:SECRET
    const parts = decodedText.split(':');
    if (parts.length !== 4 || parts[0] !== 'damdoh' || parts[1] !== 'recover') {
        toast({ title: "Invalid QR Code", description: "This is not a valid DamDoh recovery code.", variant: "destructive"});
        return;
    }
    const [, , sessionId, scannedSecret] = parts;
    
    setIsLoading(true); // Show loading indicator
    try {
        const result = await scanRecoveryQrCallable({ sessionId, scannedSecret });
        const data = result.data as { success: boolean; message: string; recoveryComplete: boolean };
        if (data.success) {
            toast({ title: "Confirmation Successful!", description: data.message });
        } else {
            throw new Error((data.message) || "Confirmation failed.");
        }
    } catch(error: any) {
        toast({ title: "Confirmation Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleScanFailure = (error: string) => {
      console.error("QR Scan Error:", error);
      toast({ title: "Scan Failed", description: "Could not read the QR code. Please try again.", variant: "destructive"});
      setIsScanning(false);
  };

  const renderInitialStep = () => (
    <>
      <CardTitle className="text-2xl">{t('title')}</CardTitle>
      <CardDescription>{t('description')}</CardDescription>
      <CardContent className="pt-6 space-y-4">
        <div className="p-4 border rounded-lg bg-muted/50">
          <h4 className="font-semibold flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> {t('howItWorksTitle')}</h4>
          <ol className="list-decimal list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>{t('step1')}</li>
            <li>{t('step2')}</li>
            <li>{t('step3')}</li>
          </ol>
        </div>
        <Button onClick={handleStartRecovery} className="w-full">
          {t('startButton')}
        </Button>
      </CardContent>
    </>
  );

  const renderEnterPhoneStep = () => (
    <>
      <CardTitle className="text-2xl">Enter Your Phone Number</CardTitle>
      <CardDescription>
        Provide the phone number associated with the account you wish to recover.
      </CardDescription>
      <CardContent className="pt-6">
        <form onSubmit={handlePhoneNumberSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="phone-number" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/> Phone Number</Label>
                <Input
                    id="phone-number"
                    type="tel"
                    placeholder="e.g., +14155552671"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>
             {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              {isLoading ? 'Verifying...' : 'Get Recovery Code'}
            </Button>
        </form>
      </CardContent>
    </>
  );

  const renderDisplayQrStep = () => (
    <>
      <CardTitle className="text-2xl">{t('scanTitle')}</CardTitle>
      <CardDescription>{t('scanDescription')}</CardDescription>
      <CardContent className="pt-6 flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-lg border shadow-md">
          <QRCode value={recoverySession?.recoveryQrValue || ''} size={256} />
        </div>
        <p className="text-sm text-muted-foreground text-center">{t('scanNote')}</p>
        <Button variant="outline" onClick={() => setRecoveryStep('initial')}>{t('startOverButton')}</Button>
      </CardContent>
    </>
  );

  const renderContent = () => {
    switch(recoveryStep) {
        case 'initial': return renderInitialStep();
        case 'enter_phone': return renderEnterPhoneStep();
        case 'display_qr': return renderDisplayQrStep();
        default: return renderInitialStep();
    }
  }

  return (
    <>
    {isScanning && (
        <QrScanner
            onScanSuccess={handleScanSuccess}
            onScanFailure={handleScanFailure}
            onClose={() => setIsScanning(false)}
        />
    )}
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center relative">
          <div className="absolute top-4 left-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/auth/signin"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
          </div>
          <QrCode className="h-10 w-10 mx-auto text-primary mb-2" />
          {renderContent()}
        </CardHeader>
        <CardFooter>
            {!authLoading && user && (
                <div className="text-center w-full pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Know someone trying to recover their account?</p>
                    <Button variant="secondary" onClick={handleHelpFriend}>
                        <Users className="mr-2 h-4 w-4" /> Help a Friend Recover
                    </Button>
                </div>
            )}
        </CardFooter>
      </Card>
    </div>
    </>
  );
}
