'use client';

import { useState, useEffect } from 'react';
import type { Order, OrderItem, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

type OrderCardProps = {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
};

const statusFlow: OrderStatus[] = ['Preparing', 'Cooking', 'Served'];

const statusColors: Record<OrderStatus, string> = {
    Preparing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Cooking: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Served: 'bg-green-500/20 text-green-300 border-green-500/30',
    Canceled: 'bg-red-500/20 text-red-300 border-red-500/30'
}

export function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
  const firestore = useFirestore();
  const [total, setTotal] = useState(0);

  const orderItemsQuery = useMemoFirebase(() => {
    if (!firestore || !order.restaurantId || !order.id) return null;
    return collection(firestore, `restaurants/${order.restaurantId}/orders/${order.id}/orderItems`);
  }, [firestore, order.restaurantId, order.id]);

  const { data: orderItems } = useCollection<OrderItem>(orderItemsQuery);

  useEffect(() => {
    if (orderItems) {
      const calculatedTotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setTotal(calculatedTotal);
    }
  }, [orderItems]);


  const currentIndex = statusFlow.indexOf(order.status);
  const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-xl">Table {order.tableNumber}</CardTitle>
                <CardDescription>{order.id} &bull; {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}</CardDescription>
            </div>
            <Badge variant="outline" className={statusColors[order.status]}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          {orderItems?.map(item => (
            <li key={item.id} className="flex justify-between">
              {/* In a real app, you'd fetch the item name from the menuItemId */}
              <span>{item.quantity} x {item.menuItemName || `Item ${item.menuItemId}`}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter>
        {nextStatus && (
          <Button 
            className="w-full"
            onClick={() => onStatusUpdate(order.id, nextStatus)}
          >
            Mark as {nextStatus}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        {order.status === 'Served' && (
            <p className="w-full text-center text-sm text-green-400">Order Completed</p>
        )}
      </CardFooter>
    </Card>
  );
}
