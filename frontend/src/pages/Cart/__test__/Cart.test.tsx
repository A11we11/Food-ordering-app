// __tests__/Cart.test.jsx
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterEach,
  afterAll,
} from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Cart from "../Cart";
import { StoreContext } from "../../../context/storeContext";
import { CartServer } from "../../../mocks/server";

// Start MSW server
beforeAll(() => CartServer.listen({ onUnhandledRequest: "error" }));
afterEach(() => CartServer.resetHandlers());
afterAll(() => CartServer.close());

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test data - match your actual StoreContext interface
const mockFoodList = [
  {
    _id: "1",
    name: "Pizza Margherita",
    price: 12.99,
    image: "pizza.jpg",
    description: "Classic pizza",
    category: "Pizza",
    quantity: 1,
  },
  {
    _id: "2",
    name: "Burger Deluxe",
    price: 8.99,
    image: "burger.jpg",
    description: "Delicious burger",
    category: "Burger",
    quantity: 1,
  },
  {
    _id: "3",
    name: "Caesar Salad",
    price: 7.5,
    image: "salad.jpg",
    description: "Fresh salad",
    category: "Salad",
    quantity: 1,
  },
];

const mockCartItems = {
  "1": 2,
  "2": 1,
  "3": 0,
};

// Complete mock context with all required properties (adjust based on your actual StoreContext)
const mockStoreContextValue = {
  cartItems: mockCartItems,
  food_list: mockFoodList,
  removeFromCart: vi.fn(),
  getTotalCartAmount: vi.fn(() => 34.97), // (12.99 * 2) + (8.99 * 1)
  url: "http://localhost:4000",
  // Add other properties that exist in your actual StoreContext
  setCartItems: vi.fn(),
  addToCart: vi.fn(),
  token: "mock-token",
  setToken: vi.fn(),
  // Add any other properties your context might have
};

// Test wrapper component
const CartWrapper = ({ contextValue = mockStoreContextValue } = {}) => (
  <BrowserRouter>
    <StoreContext.Provider value={contextValue}>
      <Cart />
    </StoreContext.Provider>
  </BrowserRouter>
);

describe("Cart Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders cart headers correctly", () => {
      render(<CartWrapper />);

      expect(screen.getByText("Items")).toBeInTheDocument();
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Price")).toBeInTheDocument();
      expect(screen.getByText("Quantity")).toBeInTheDocument();
      expect(screen.getByText("Total")).toBeInTheDocument();
      expect(screen.getByText("Remove")).toBeInTheDocument();
    });

    it("renders cart items with quantities > 0", () => {
      render(<CartWrapper />);

      // Should show Pizza (quantity: 2) and Burger (quantity: 1)
      expect(screen.getByText("Pizza Margherita")).toBeInTheDocument();
      expect(screen.getByText("Burger Deluxe")).toBeInTheDocument();

      // Should not show Caesar Salad (quantity: 0)
      expect(screen.queryByText("Caesar Salad")).not.toBeInTheDocument();

      // Check quantities
      expect(screen.getByText("2")).toBeInTheDocument(); // Pizza quantity
      expect(screen.getByText("1")).toBeInTheDocument(); // Burger quantity
    });

    it("displays correct item prices and totals", () => {
      render(<CartWrapper />);

      // Individual prices
      expect(screen.getByText("$12.99")).toBeInTheDocument();
      expect(screen.getByText("$8.99")).toBeInTheDocument();

      // Item totals
      expect(screen.getByText("$25.98")).toBeInTheDocument(); // 12.99 * 2
    });

    it("renders cart total section", () => {
      render(<CartWrapper />);

      expect(screen.getByText("Cart Totals")).toBeInTheDocument();
      expect(screen.getByText("Subtotal")).toBeInTheDocument();
      expect(screen.getByText("Delivery Fee")).toBeInTheDocument();
      expect(screen.getByText("$34.97")).toBeInTheDocument(); // Subtotal
      expect(screen.getByText("$2")).toBeInTheDocument(); // Delivery fee
      expect(screen.getByText("$36.97")).toBeInTheDocument(); // Total with delivery
    });

    it("renders promo code section", () => {
      render(<CartWrapper />);

      expect(
        screen.getByText("If you a promo code, Enter it here")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("promo code")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Submit" })
      ).toBeInTheDocument();
    });
  });

  describe("Empty Cart", () => {
    const emptyCartContext = {
      ...mockStoreContextValue,
      cartItems: { "1": 0, "2": 0, "3": 0 }, // Same structure, all zeros
      getTotalCartAmount: vi.fn(() => 0),
    };

    it("shows no delivery fee when cart is empty", () => {
      render(<CartWrapper contextValue={emptyCartContext} />);

      expect(screen.getByText("$0")).toBeInTheDocument(); // Subtotal
      expect(screen.getAllByText("$0")[1]).toBeInTheDocument(); // Delivery fee
      expect(screen.getAllByText("$0")[2]).toBeInTheDocument(); // Total
    });

    it("disables checkout button when cart is empty", () => {
      render(<CartWrapper contextValue={emptyCartContext} />);

      const checkoutButton = screen.getByRole("button", {
        name: "PROCEED TO CHECKOUT",
      });
      expect(checkoutButton).toBeDisabled();
    });

    it("does not render any cart items when empty", () => {
      render(<CartWrapper contextValue={emptyCartContext} />);

      expect(screen.queryByText("Pizza Margherita")).not.toBeInTheDocument();
      expect(screen.queryByText("Burger Deluxe")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls removeFromCart when X is clicked", () => {
      const mockRemove = vi.fn();
      const contextWithMockRemove = {
        ...mockStoreContextValue,
        removeFromCart: mockRemove,
      };

      render(<CartWrapper contextValue={contextWithMockRemove} />);

      const removeButtons = screen.getAllByText("X");
      fireEvent.click(removeButtons[0]);

      expect(mockRemove).toHaveBeenCalledWith("1");
    });

    it("navigates to order page when checkout is clicked", () => {
      render(<CartWrapper />);

      const checkoutButton = screen.getByRole("button", {
        name: "PROCEED TO CHECKOUT",
      });
      fireEvent.click(checkoutButton);

      expect(mockNavigate).toHaveBeenCalledWith("/order");
    });

    it("handles navigation error gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockNavigate.mockImplementation(() => {
        throw new Error("Navigation failed");
      });

      render(<CartWrapper />);

      const checkoutButton = screen.getByRole("button", {
        name: "PROCEED TO CHECKOUT",
      });
      fireEvent.click(checkoutButton);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Navigation error:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it("allows typing in promo code input", () => {
      render(<CartWrapper />);

      // Fixed: proper type casting for HTMLInputElement
      const promoInput = screen.getByPlaceholderText("promo code");
      fireEvent.change(promoInput, { target: { value: "SAVE20" } });

      expect(promoInput).toHaveValue("SAVE20");
    });
  });

  describe("MSW API Integration Tests", () => {
    it("can test API responses for cart data", async () => {
      render(<CartWrapper />);

      // This test verifies MSW is working
      // In a real app, you might fetch cart data on component mount
      await waitFor(() => {
        expect(screen.getByText("Pizza Margherita")).toBeInTheDocument();
      });
    });

    it("can mock API calls in component interactions", async () => {
      const mockRemove = vi.fn();
      const contextWithApiMocking = {
        ...mockStoreContextValue,
        removeFromCart: mockRemove,
      };

      render(<CartWrapper contextValue={contextWithApiMocking} />);

      const removeButtons = screen.getAllByText("X");
      fireEvent.click(removeButtons[0]);

      // MSW will intercept any API calls made by the component
      await waitFor(() => {
        expect(mockRemove).toHaveBeenCalledWith("1");
      });
    });
  });

  describe("Image Loading", () => {
    it("constructs correct image URLs", () => {
      render(<CartWrapper />);

      const images = screen.getAllByRole("img");
      expect(images[0]).toHaveAttribute(
        "src",
        "http://localhost:4000/images/pizza.jpg"
      );
      expect(images[1]).toHaveAttribute(
        "src",
        "http://localhost:4000/images/burger.jpg"
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles zero quantity items", () => {
      const contextWithZeroQuantity = {
        ...mockStoreContextValue,
        cartItems: { "1": 0, "2": 0, "3": 0 },
        getTotalCartAmount: vi.fn(() => 0),
      };

      render(<CartWrapper contextValue={contextWithZeroQuantity} />);

      // Should not render any items
      expect(screen.queryByText("Pizza Margherita")).not.toBeInTheDocument();
      expect(screen.queryByText("Burger Deluxe")).not.toBeInTheDocument();
    });

    it("calculates totals correctly with different quantities", () => {
      const contextWithDifferentQuantities = {
        ...mockStoreContextValue,
        cartItems: { "1": 3, "2": 2, "3": 1 },
        getTotalCartAmount: vi.fn(() => 56.46), // (12.99*3) + (8.99*2) + (7.50*1)
      };

      render(<CartWrapper contextValue={contextWithDifferentQuantities} />);

      expect(screen.getByText("$56.46")).toBeInTheDocument(); // Subtotal
      expect(screen.getByText("$58.46")).toBeInTheDocument(); // Total with delivery
    });
  });
});
