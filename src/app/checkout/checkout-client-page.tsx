'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/cart-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function CheckoutLogic() {
  const router = useRouter();
  const { state, dispatch } = useCart();
  const { toast } = useToast();
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  useEffect(() => {
    const storedTable = localStorage.getItem('tableNumber');
    if (storedTable) {
      setTableNumber(storedTable);
    } else {
      // If no table number is found, the user needs to scan a QR code.
      router.replace('/scan');
    }
  }, [router]);


  const { items } = state;
  const subtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const taxes = subtotal * 0.1;
  const total = subtotal + taxes;

  const handlePlaceOrder = () => {
    if (!tableNumber) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Table number is missing. Please scan a QR code.',
      });
      router.push('/scan');
      return;
    }
    // In a real app, this would trigger a server action to save the order
    const orderId = `TB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('Placing order:', { orderId, tableNumber, items, total });

    dispatch({ type: 'CLEAR_CART' });

    toast({
      title: 'Order Placed!',
      description: 'Your order has been sent to the kitchen.',
    });

    router.push(`/order/${orderId}?table=${tableNumber}`);
  };
  
    if (!tableNumber) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-64">
         <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Table Selected</AlertTitle>
            <AlertDescription>
              We need a table number to proceed. Please go back and scan a QR code.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/scan')} className="mt-4">
            Scan QR Code
          </Button>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.quantity} x {item.dish.name}</p>
                      <p className="text-sm text-muted-foreground">₹{item.dish.price.toFixed(2)} each</p>
                    </div>
                    <p className="font-semibold">₹{(item.dish.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Your cart is empty.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Table</span>
              <span className="font-bold text-2xl text-primary">{tableNumber || '?'}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes (10%)</span>
              <span>₹{taxes.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full font-bold" size="lg" onClick={handlePlaceOrder} disabled={items.length === 0}>
              Place Order
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutLogic />
    </Suspense>
  );
}
