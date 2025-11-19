export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageId: string;
};

export type Category = {
  id: string;
  name: string;
};

export type CartItem = {
  id: string;
  dish: Dish;
  quantity: number;
};

export type OrderStatus = 'Preparing' | 'Cooking' | 'Served' | 'Canceled';

// This represents an Order document in Firestore
export type Order = {
  id: string; // Document ID
  restaurantId: string;
  tableNumber: string;
  orderDate: string; // ISO String date
  status: OrderStatus;
};

// This represents an OrderItem document in the subcollection
export type OrderItem = {
    id: string; // Document ID
    orderId: string;
    menuItemId: string;
    menuItemName?: string; // Denormalized for convenience
    quantity: number;
    price: number; // Price at time of order
}


export type Waiter = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Table = {
  id: number;
  waiterId?: string;
};
