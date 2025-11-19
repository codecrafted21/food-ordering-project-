'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/cart-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Home } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { addOrder } from '@/lib/order-manager';
import { useFirestore } from '@/firebase';

function CheckoutLogic() {
  const router = useRouter();
  const firestore = useFirestore();
  const { state, dispatch } = useCart();
  const { toast } = useToast();
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTable = localStorage.getItem('tableNumber');
    if (storedTable) {
      setTableNumber(storedTable);
    }
    setIsLoading(false);
  }, []);

  const { items } = state;
  const subtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const taxes = subtotal * 0.1;
  const total = subtotal + taxes;

  const handlePlaceOrder = async () => {
    if (!tableNumber) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Table number is missing. Please scan a QR code.',
      });
      router.push('/');
      return;
    }
    
    // In a real app, restaurantId would be dynamic
    const restaurantId = "tablebites-restaurant";

    const orderId = await addOrder(firestore, {
      restaurantId,
      tableNumber,
      items,
      total,
      status: 'Preparing',
    });

    if (orderId) {
      dispatch({ type: 'CLEAR_CART' });

      toast({
        title: 'Order Placed!',
        description: 'Your order has been sent to the kitchen.',
      });

      router.push(`/order/${orderId}?table=${tableNumber}`);
    } else {
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: 'Could not place your order. Please try again.',
        });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
          <p>Loading checkout details...</p>
      </div>
    )
  }

  if (!tableNumber) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-64">
         <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Table Selected</AlertTitle>
            <AlertDescription>
              We don't have a table number for your order. Please go back and scan a QR code.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/')} className="mt-4">
            <Home className="mr-2 h-4 w-4" />
            Return to Menu
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
