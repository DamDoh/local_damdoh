
"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QrCode, ArrowLeft, Users, Shield, Loader2 } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useTranslations } from 'next-intl';

export default function RecoverPage() {
  const t = useTranslations('Auth.recoverPage');
  const [recoveryStep, setRecoveryStep] = useState<'initial' | 'display_qr' | 'error'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [recoverySession, setRecoverySession] = useState<{ sessionId: string; recoveryQrValue: string } | null>(null);

  const handleStartRecovery = async () => {
    setIsLoading(true);
    // In a real app, this would call a backend function.
    // For now, we simulate success after a delay.
    setTimeout(() => {
      const sessionId = `rec_${Date.now()}`;
      const recoveryQrValue = `damdoh:recover:${sessionId}:secret123abc`;
      setRecoverySession({ sessionId, recoveryQrValue });
      setRecoveryStep('display_qr');
      setIsLoading(false);
    }, 1500);
  };

  const renderInitialStep = () => (
    <>
      <CardTitle className="text-2xl">{t('title')}</CardTitle>
      <CardDescription>
        {t('description')}
      </CardDescription>
      <CardContent className="pt-6 space-y-4">
        <div className="p-4 border rounded-lg bg-muted/50">
          <h4 className="font-semibold flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> {t('howItWorksTitle')}</h4>
          <ol className="list-decimal list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>{t('step1')}</li>
            <li>{t('step2')}</li>
            <li>{t('step3')}</li>
          </ol>
        </div>
        <Button onClick={handleStartRecovery} className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
          {isLoading ? t('startingButton') : t('startButton')}
        </Button>
      </CardContent>
    </>
  );

  const renderDisplayQrStep = () => (
    <>
      <CardTitle className="text-2xl">{t('scanTitle')}</CardTitle>
      <CardDescription>
        {t('scanDescription')}
      </CardDescription>
      <CardContent className="pt-6 flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-lg border shadow-md">
          <QRCode value={recoverySession?.recoveryQrValue || ''} size={256} />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {t('scanNote')}
        </p>
        <Button variant="outline" onClick={() => setRecoveryStep('initial')}>{t('startOverButton')}</Button>
      </CardContent>
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center relative">
          <div className="absolute top-4 left-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/auth/signin"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
          </div>
          <QrCode className="h-10 w-10 mx-auto text-primary mb-2" />
          {recoveryStep === 'initial' && renderInitialStep()}
          {recoveryStep === 'display_qr' && renderDisplayQrStep()}
        </CardHeader>
      </Card>
    </div>
  );
}
