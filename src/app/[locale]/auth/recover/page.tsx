
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/navigation';
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
import { getProfileByIdFromDB } from '@/lib/server-actions';
import { logIn } from '@/lib/auth-utils';

const QrScanner = dynamic(() => import('@/components/QrScanner').then(mod => mod.QrScanner), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin"/></div>
});

const functions = getFunctions(firebaseApp);

export default function RecoverPage() {
  const t = useTranslations('Auth.recoverPage');
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [recoveryStep, setRecoveryStep] = useState<'initial' | 'enter_phone' | 'display_qr' | 'success'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recoverySession, setRecoverySession] = useState<{ sessionId: string; recoveryQrValue: string; userIdToRecover: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const createRecoverySessionCallable = useMemo(() => httpsCallable(functions, 'universalId-createRecoverySession'), [functions]);
  const scanRecoveryQrCallable = useMemo(() => httpsCallable(functions, 'universalId-scanRecoveryQr'), [functions]);
  const completeRecoveryCallable = useMemo(() => httpsCallable(functions, 'universalId-completeRecovery'), [functions]);

  const handleStartRecovery = () => {
    setRecoveryStep('enter_phone');
    setErrorMessage(null);
  };

  const handlePhoneNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMessage(t('enterPhone.phoneRequiredError'));
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
        const result = await createRecoverySessionCallable({ phoneNumber });
        const data = result.data as { sessionId: string; recoveryQrValue: string; userIdToRecover: string };
        setRecoverySession(data);
        setRecoveryStep('display_qr');
    } catch (error: any) {
        console.error("Error creating recovery session:", error);
        setErrorMessage(error.message || t('enterPhone.genericError'));
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
    const parts = decodedText.split(':');
    if (parts.length !== 4 || parts[0] !== 'damdoh' || parts[1] !== 'recover') {
        toast({ title: "Invalid QR Code", description: t('helpFriend.scanError'), variant: "destructive"});
        return;
    }
    const [, , sessionId, scannedSecret] = parts;
    
    setIsLoading(true);
    try {
        const result = await scanRecoveryQrCallable({ sessionId, scannedSecret });
        const data = result.data as { success: boolean; message: string; recoveryComplete: boolean };
        if (data.success) {
            toast({ title: t('helpFriend.scanSuccess'), description: data.message });
        } else {
            throw new Error((data.message) || "Confirmation failed.");
        }
    } catch(error: any) {
        toast({ title: "Confirmation Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };
  
  // This effect will run on the recovering user's device after a friend has confirmed.
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (recoveryStep === 'display_qr' && recoverySession?.sessionId) {
      intervalId = setInterval(async () => {
        try {
          const result = await completeRecoveryCallable({ sessionId: recoverySession.sessionId });
          const data = result.data as { success: boolean; customToken?: string };
          if (data.success && data.customToken) {
            clearInterval(intervalId); // Stop polling
            
            // This part is simplified. A real implementation would securely
            // use this custom token to sign the user in.
            // For this demo, we'll simulate it by redirecting with a success flag.
            const userProfile = await getProfileByIdFromDB(recoverySession.userIdToRecover);
            toast({
              title: "Recovery Complete!",
              description: `You have successfully recovered the account for ${userProfile?.displayName}.`,
            });
            setRecoveryStep('success');
            // In a real app: await signInWithCustomToken(auth, data.customToken); router.push('/');
          }
        } catch (error) {
          // It's normal to get errors here while polling before confirmation.
          // console.log("Polling for confirmation...");
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => clearInterval(intervalId); // Cleanup on unmount or step change
  }, [recoveryStep, recoverySession, completeRecoveryCallable, toast]);


  const handleScanFailure = (error: string) => {
      console.error("QR Scan Error:", error);
      toast({ title: "Scan Failed", description: t('helpFriend.scanFail'), variant: "destructive"});
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
      <CardTitle className="text-2xl">{t('enterPhone.title')}</CardTitle>
      <CardDescription>
        {t('enterPhone.description')}
      </CardDescription>
      <CardContent className="pt-6">
        <form onSubmit={handlePhoneNumberSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="phone-number" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/> {t('enterPhone.phoneNumberLabel')}</Label>
                <Input
                    id="phone-number"
                    type="tel"
                    placeholder={t('enterPhone.phoneNumberPlaceholder')}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>
             {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              {isLoading ? t('enterPhone.verifyingButton') : t('enterPhone.getRecoveryCodeButton')}
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
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Waiting for friend's confirmation...</span>
        </div>
        <Button variant="outline" onClick={() => setRecoveryStep('initial')}>{t('startOverButton')}</Button>
      </CardContent>
    </>
  );
  
  const renderSuccessStep = () => (
    <>
      <CardTitle className="text-2xl">Recovery Complete!</CardTitle>
       <CardDescription>You can now sign in to the recovered account.</CardDescription>
       <CardContent className="pt-6">
           <Button asChild className="w-full"><Link href="/auth/signin">Go to Sign In</Link></Button>
       </CardContent>
    </>
  );


  const renderContent = () => {
    switch(recoveryStep) {
        case 'initial': return renderInitialStep();
        case 'enter_phone': return renderEnterPhoneStep();
        case 'display_qr': return renderDisplayQrStep();
        case 'success': return renderSuccessStep();
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
                    <p className="text-sm text-muted-foreground mb-2">{t('helpFriend.prompt')}</p>
                    <Button variant="secondary" onClick={handleHelpFriend}>
                        <Users className="mr-2 h-4 w-4" /> {t('helpFriend.button')}
                    </Button>
                </div>
            )}
        </CardFooter>
      </Card>
    </div>
    </>
  );
}
