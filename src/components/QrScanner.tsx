
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

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText, decodedResult) => {
          // Wrap success call to stop scanner first
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().then(() => {
                onScanSuccess(decodedText);
            }).catch(err => console.error("Failed to stop scanner after success", err));
          }
        },
        (errorMessage) => {
          // This function is called frequently, so we don't log every "failure"
        }
      ).catch(err => {
        onScanFailure(`Unable to start scanning, error: ${err}`);
      });
    }

    // Cleanup function
    return () => {
      if (html5QrCodeRef.current?.isScanning) {
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
    
