"use client";

import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
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

  // Use refs for callbacks to prevent re-running the effect
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;
  const onScanFailureRef = useRef(onScanFailure);
  onScanFailureRef.current = onScanFailure;

  useEffect(() => {
    if (!qrCodeReaderRef.current) {
      return;
    }

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
            // Stop the scanner first, then call the success handler to avoid race conditions.
            if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
              html5QrCode.stop()
                .then(() => {
                  onScanSuccessRef.current(decodedText);
                })
                .catch(err => {
                  console.error("Error stopping scanner after successful scan.", err);
                   // Still notify success even if cleanup failed.
                  onScanSuccessRef.current(decodedText);
                });
            }
          },
          (errorMessage) => {
            // This callback is called frequently, so we don't do anything here.
            // Failures are handled by the catch block below.
          }
        );
      } catch (err: any) {
        onScanFailureRef.current(`Unable to start scanning, error: ${err.message}`);
      }
    };
    startScanner();

    // Cleanup function for when the component unmounts
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        html5QrCodeRef.current.stop().catch(err => {
          // This error is expected when the component unmounts quickly
          // (e.g., user presses Esc). React removes the DOM node before
          // the scanner's async stop() method finishes. We can safely ignore it.
          if (err.message.includes("The node to be removed is not a child of this node.")) {
            console.log("QR scanner cleanup: DOM node already removed, which is expected on fast close.");
          } else {
            console.error("Failed to stop QR scanner on cleanup:", err);
          }
        });
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount/unmount

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
