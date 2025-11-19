import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import type { CartItem, OrderStatus } from '@/lib/types';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface OrderData {
  restaurantId: string;
  tableNumber: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  userId: string;
}

// Function to add a new order to Firestore
export const addOrder = async (firestore: Firestore, orderData: OrderData): Promise<string | null> => {
  const { restaurantId, tableNumber, items, userId, status } = orderData;
  
  try {
    const ordersCollection = collection(firestore, `restaurants/${restaurantId}/orders`);
    
    // 1. Create the main order document
    const orderDocRef = await addDoc(ordersCollection, {
      tableNumber: tableNumber,
      orderDate: serverTimestamp(),
      status: status,
      restaurantId: restaurantId,
      userId: userId, // Add the user ID to the order
    });

    // 2. Create a batch write for all the order items
    const batch = writeBatch(firestore);
    const orderItemsCollection = collection(firestore, `restaurants/${restaurantId}/orders/${orderDocRef.id}/orderItems`);

    items.forEach(item => {
      const orderItemRef = doc(orderItemsCollection); // Creates a new doc with a random ID
      batch.set(orderItemRef, {
        orderId: orderDocRef.id,
        menuItemId: item.dish.id,
        menuItemName: item.dish.name, // Denormalizing for easier display
        quantity: item.quantity,
        price: item.dish.price,
      });
    });

    // 3. Commit the batch
    await batch.commit();

    return orderDocRef.id;

  } catch (error) {
    console.error("Error placing order:", error);
    // In a real app, you would want to use a more robust error handling and user feedback mechanism
    return null;
  }
};


// Function to update an order's status
export const updateOrderStatus = (firestore: Firestore, restaurantId: string, orderId: string, status: OrderStatus) => {
    if (!restaurantId || !orderId) {
        console.error("Missing restaurantId or orderId");
        return;
    }
    const orderRef = doc(firestore, `restaurants/${restaurantId}/orders`, orderId);
    updateDocumentNonBlocking(orderRef, { status: status });
}
