'use client';

import { useState } from 'react';
import { OrderCard } from './order-card';
import { updateOrderStatus } from '@/lib/order-manager';
import type { Order, OrderStatus } from '@/lib/types';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChefHat, CookingPot, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Firestore } from 'firebase/firestore';

const ALL_STATUSES: OrderStatus[] = ['Preparing', 'Cooking', 'Served'];

export default function AdminPageClient() {
  const firestore = useFirestore();
  const [filter, setFilter] = useState<string[]>(['Preparing', 'Cooking']);

  // This query will fetch all orders that are not 'Served' and order them by creation time.
  // The useCollection hook will update this in real-time.
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const restaurantId = "tablebites-restaurant";
    return query(
        collection(firestore, `restaurants/${restaurantId}/orders`),
        where('status', 'in', ['Preparing', 'Cooking']),
        orderBy('orderDate', 'asc')
    );
  }, [firestore]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const handleStatusUpdate = (firestore: Firestore, orderId: string, newStatus: OrderStatus) => {
    const restaurantId = "tablebites-restaurant";
    updateOrderStatus(firestore, restaurantId, orderId, newStatus);
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Loading Live Orders...</p>
        </div>
    )
  }

  const filteredOrders = orders?.filter(order => filter.includes(order.status));

  return (
    <div>
        <div className="mb-6 flex justify-center">
            <ToggleGroup 
                type="multiple"
                variant="outline"
                value={filter}
                onValueChange={(value) => setFilter(value.length > 0 ? value : [])}
                aria-label="Filter order status"
            >
                <ToggleGroupItem value="Preparing" aria-label="Toggle Preparing">
                    <CookingPot className="h-4 w-4 mr-2" /> Preparing
                </ToggleGroupItem>
                <ToggleGroupItem value="Cooking" aria-label="Toggle Cooking">
                    <ChefHat className="h-4 w-4 mr-2" /> Cooking
                </ToggleGroupItem>
            </ToggleGroup>
        </div>

      {filteredOrders && filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} onStatusUpdate={(orderId, newStatus) => handleStatusUpdate(firestore, orderId, newStatus)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">All Caught Up!</h2>
            <p className="text-muted-foreground mt-2">No active orders matching your filter.</p>
        </div>
      )}
    </div>
  );
}
