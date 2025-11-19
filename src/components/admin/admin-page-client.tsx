'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OrderCard } from './order-card';
import { updateOrderStatus } from '@/lib/order-manager';
import type { Order, OrderStatus } from '@/lib/types';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from '@/components/ui/button';
import { ChefHat, CookingPot, Loader2, LogIn, Utensils } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Firestore } from 'firebase/firestore';

export default function AdminPageClient() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [filter, setFilter] = useState<OrderStatus[]>(['Preparing', 'Cooking']);

  const isAdmin = user?.email === 'admin@tablebites.com';

  const ordersQuery = useMemoFirebase(() => {
    // Only run the query if we have a filter, a firestore instance, and are logged in as admin.
    if (!firestore || !isAdmin || filter.length === 0) return null;
    
    const restaurantId = "tablebites-restaurant";
    // This query now matches the security rules, as we are filtering by 'status'.
    return query(
        collection(firestore, `restaurants/${restaurantId}/orders`),
        where('status', 'in', filter),
        orderBy('orderDate', 'asc')
    );
  }, [firestore, isAdmin, filter]);

  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

  const handleStatusUpdate = (firestore: Firestore, orderId: string, newStatus: OrderStatus) => {
    const restaurantId = "tablebites-restaurant";
    updateOrderStatus(firestore, restaurantId, orderId, newStatus);
  };
  
  if (!isAdmin) {
    return (
       <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold mt-4">Admin Access Required</h2>
            <p className="text-muted-foreground mt-2">You are not authorized to view this page.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/login">Return to Login</Link>
            </Button>
        </div>
    )
  }
  
  const handleFilterChange = (value: string[]) => {
    // Ensure the value is correctly typed to OrderStatus[]
    setFilter(value as OrderStatus[]);
  };

  return (
    <div>
        <div className="mb-6 flex justify-center">
            <ToggleGroup 
                type="multiple"
                variant="outline"
                value={filter}
                onValueChange={handleFilterChange}
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
      
      {isLoadingOrders && (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Loading Live Orders...</p>
        </div>
      )}

      {!isLoadingOrders && orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onStatusUpdate={(orderId, newStatus) => handleStatusUpdate(firestore!, orderId, newStatus)} />
          ))}
        </div>
      ) : (
        !isLoadingOrders && (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Utensils className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold mt-4">All Caught Up!</h2>
              <p className="text-muted-foreground mt-2">No active orders matching your filter right now.</p>
          </div>
        )
      )}
    </div>
  );
}
