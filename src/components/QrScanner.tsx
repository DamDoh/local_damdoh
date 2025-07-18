
"use client";

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent } from './ui/card';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure: (error: string) => void;
  onClose: () => void;
}

export const QrScanner = ({ onScanSuccess, onScanFailure, onClose }: QrScannerProps) => {
  const qrCodeReaderRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (qrCodeReaderRef.current) {
      const html5QrCode = new Html5Qrcode(qrCodeReaderRef.current.id);
      html5QrCodeRef.current = html5QrCode;

      const startScanner = async () => {
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
              // --- FIX: Call onScanSuccess immediately and handle cleanup ---
              // This prevents a race condition where the parent unmounts this component
              // before the scanner has finished its own DOM cleanup.
              onScanSuccess(decodedText);
              if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(err => console.error("Failed to stop scanner after success", err));
              }
            },
            (errorMessage) => {
              // This function is called frequently, so we don't log every "failure"
            }
          );
        } catch (err: any) {
            onScanFailure(`Unable to start scanning, error: ${err.message}`);
        }
      };
      startScanner();
    }

    // Cleanup function remains the same
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => {
          console.error("Failed to stop QR scanner on cleanup:", err);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 bg-background/50 hover:bg-background" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close scanner</span>
        </Button>
        <CardContent className="p-4">
          <div id="qr-reader" ref={qrCodeReaderRef} className="w-full"></div>
        </CardContent>
      </Card>
    </div>
  );
};
