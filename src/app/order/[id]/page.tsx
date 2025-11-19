'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderStatus } from '@/components/order/order-status';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { OrderStatus as OrderStatusType } from '@/lib/types';
import { DISHES } from '@/lib/data';

const statusFlow: OrderStatusType[] = ['Preparing', 'Cooking', 'Served'];

function OrderTrackingPageContent({ orderId, tableNumber }: { orderId: string, tableNumber: string | null }) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatusType>(statusFlow[0]);

  useEffect(() => {
    const timeouts = statusFlow.map((status, index) => {
      return setTimeout(() => {
        setCurrentStatus(status);
      }, (index) * 7000); // Progress every 7 seconds
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Thank You For Your Order!</CardTitle>
            <CardDescription>
              Order ID: {orderId} | Table: {tableNumber || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-8 text-muted-foreground">Follow the progress of your order below.</p>
            <OrderStatus currentStatus={currentStatus} statuses={statusFlow} />

            <div className="mt-12 w-full">
              <h3 className="text-lg font-semibold mb-4 text-center">Your order is in good hands!</h3>
              <p className="text-center text-muted-foreground">While you wait, why not try one of our popular drinks?</p>
              <div className="mt-6 flex justify-center gap-4">
                <div className="text-center p-4 rounded-lg bg-card border w-40">
                  <p className="font-bold">{DISHES.find(d => d.id === 'dish-11')?.name}</p>
                  <p className="text-sm text-primary">₹{DISHES.find(d => d.id === 'dish-11')?.price.toFixed(2)}</p>
                </div>
                 <div className="text-center p-4 rounded-lg bg-card border w-40">
                  <p className="font-bold">{DISHES.find(d => d.id === 'dish-12')?.name}</p>
                  <p className="text-sm text-primary">₹{DISHES.find(d => d.id === 'dish-12')?.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


function OrderPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table');

  return <OrderTrackingPageContent orderId={params.id} tableNumber={tableNumber} />;
}

export default function OrderPageWrapper({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading order details...</div>}>
      <OrderPage params={params} />
    </Suspense>
  )
}
