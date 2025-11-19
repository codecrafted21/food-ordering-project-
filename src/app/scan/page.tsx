'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScanLine, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setScanError('Camera access denied. Please enable camera permissions in your browser settings.');
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const context = canvas.getContext('2d');

          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;

          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code) {
              try {
                // The expected URL format is `https://yourdomain.com/?table=...`
                const url = new URL(code.data);
                const table = url.searchParams.get('table');

                // Check if the QR code is for the current site and has a table param.
                if (table && url.origin === window.location.origin) {
                  localStorage.setItem('tableNumber', table);
                  toast({
                    title: 'Table Set!',
                    description: `You are now ordering for Table ${table}.`,
                  });
                  router.push('/'); // Redirect to home, which will show the menu
                  return; // Stop scanning
                } else {
                  setScanError("Invalid QR code. Please scan a valid TableBites QR code.");
                }
              } catch (e) {
                 setScanError("Invalid QR code format. The code should contain a valid website link.");
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(scan);
    };

    if (hasCameraPermission) {
      animationFrameId = requestAnimationFrame(scan);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasCameraPermission, router, toast]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mb-4">
             <ScanLine className="h-6 w-6" />
          </div>
          <CardTitle className="font-headline text-2xl">Scan Table QR Code</CardTitle>
          <CardDescription>Point your camera at the QR code on your table to start your order.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square w-full rounded-lg overflow-hidden border bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="absolute w-2/3 h-2/3 border-4 border-white/50 rounded-lg animate-pulse" />
            </div>
          </div>
          {scanError && (
             <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Scan Error</AlertTitle>
                <AlertDescription>{scanError}</AlertDescription>
            </Alert>
          )}
           {hasCameraPermission === false && (
             <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>Please enable camera access in your browser settings to scan the QR code.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
