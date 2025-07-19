/* import { createContext, useState, type ReactNode } from "react";
import { food_list } from "../assets/assets";

interface FoodItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  category: string;
}

interface StoreContextType {
  food_list: FoodItem[];
}

export const StoreContext = createContext<StoreContextType>(
  {} as StoreContextType
);



type Props = {
  children: ReactNode;
};

const StoreContextProvider = ({ children }: Props) => {
  const [cartItems, setCartItems] = useState({});

  const addToCart = () => {
    if (!cartItems[itemid]) {
      setCartItems((prev) => ({ ...prev, [itemid]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
  };

  const contextValue: StoreContextType = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
 */

import { createContext, useState, type ReactNode } from "react";
import { food_list } from "../assets/assets";

interface FoodItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  category: string;
}

type CartItems = {
  [id: string]: number;
};

interface StoreContextType {
  food_list: FoodItem[];
  cartItems: CartItems;
  setCartItems: React.Dispatch<React.SetStateAction<CartItems>>;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  getTotalCartAmount: () => number;
}

export const StoreContext = createContext<StoreContextType>(
  {} as StoreContextType
);

type Props = {
  children: ReactNode;
};

const StoreContextProvider = ({ children }: Props) => {
  const [cartItems, setCartItems] = useState<CartItems>({});

  const addToCart = (itemId: string) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => {
      if (!prev[itemId]) return prev;
      const updated = { ...prev, [itemId]: prev[itemId] - 1 };
      if (updated[itemId] <= 0) delete updated[itemId];
      return updated;
    });
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const contextValue: StoreContextType = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

/* 
import { createContext, useState, type ReactNode } from "react";
import { food_list } from "../assets/assets";

interface FoodItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  category: string;
}

interface CartItemsType {
  [itemId: string]: number;
}

interface StoreContextType {
  food_list: FoodItem[];
  cartItems: CartItemsType;
  setCartItems: React.Dispatch<React.SetStateAction<CartItemsType>>;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
}

export const StoreContext = createContext<StoreContextType>(
  {} as StoreContextType
);

type Props = {
  children: ReactNode;
};

const StoreContextProvider = ({ children }: Props) => {
  const [cartItems, setCartItems] = useState<CartItemsType>({});

  const addToCart = (itemId: string) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => {
      const newCount = Math.max(0, (prev[itemId] || 0) - 1);
      return { ...prev, [itemId]: newCount };
    });
  };

  const contextValue: StoreContextType = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
 */
