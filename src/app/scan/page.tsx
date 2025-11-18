'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import jsQR from 'jsqr';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [toast]);

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
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
              setScanResult(code.data);
              try {
                const url = new URL(code.data);
                const tableNumber = url.searchParams.get('table');
                if (tableNumber) {
                   if (typeof window !== 'undefined') {
                     localStorage.setItem('tableNumber', tableNumber);
                   }
                  toast({
                    title: 'Table Scanned!',
                    description: `You are at table ${tableNumber}. Redirecting to menu...`,
                  });
                  router.push(`/?table=${tableNumber}`);
                  return; // Stop scanning
                }
              } catch (e) {
                // Not a valid URL, ignore
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (hasCameraPermission) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasCameraPermission, router, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <QrCode className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="font-headline text-2xl mt-4">Scan Your Table QR Code</CardTitle>
          <CardDescription>Point your camera at the QR code on your table to begin ordering.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                <VideoOff className="h-10 w-10 mb-4" />
                <h3 className="font-bold">Camera Access Required</h3>
                <p className="text-sm text-center">Please grant camera permissions to scan the QR code.</p>
              </div>
            )}
             {hasCameraPermission === true && (
                <div className="absolute inset-0 border-4 border-primary/50 rounded-md animate-pulse"></div>
             )}
          </div>
          <Link href="/#menu" className="w-full">
            <Button variant="outline" className="w-full mt-4">
              Skip & View Menu
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
