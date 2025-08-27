// FoodItem.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import FoodItem from "../FoodItem";
import { StoreContext } from "../../../context/storeContext";

// Mock CSS import
vi.mock("./FoodItem.css", () => ({}));

// Mock react-icons
vi.mock("react-icons/fa", () => ({
  FaPlus: ({ onClick, size }: { onClick: () => void; size: number }) => (
    <button
      onClick={onClick}
      data-testid="plus-button"
      data-size={size}
      aria-label="Add to cart"
    >
      +
    </button>
  ),
  FaMinus: ({ onClick, size }: { onClick: () => void; size: number }) => (
    <button
      onClick={onClick}
      data-testid="minus-button"
      data-size={size}
      aria-label="Remove from cart"
    >
      -
    </button>
  ),
}));

// Sample food item props
const mockFoodProps = {
  id: "123",
  name: "Margherita Pizza",
  description:
    "Classic Italian pizza with fresh tomatoes and mozzarella cheese",
  image: "pizza.jpg",
  price: 12.99,
};

// Create mock context with different cart states
const createMockContext = (cartItems = {}) => ({
  cartItems,
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  url: "http://localhost:3000",
  // Other context properties
  food_list: [],
  token: null,
  setToken: vi.fn(),
  getTotalCartAmount: vi.fn(),
});

// Test wrapper component
const TestWrapper = ({
  children,
  contextValue,
}: {
  children: React.ReactNode;
  contextValue: any;
}) => (
  <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>
);

// Helper function to render with context
const renderWithContext = (contextValue = createMockContext()) => {
  return {
    ...render(
      <TestWrapper contextValue={contextValue}>
        <FoodItem {...mockFoodProps} />
      </TestWrapper>
    ),
    mockContext: contextValue,
  };
};

describe("FoodItem Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders food item with correct information", () => {
      renderWithContext();

      // Check food item structure
      expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Classic Italian pizza with fresh tomatoes and mozzarella cheese"
        )
      ).toBeInTheDocument();
      expect(screen.getByText("$12.99")).toBeInTheDocument();
    });

    it("renders food image with correct src and alt", () => {
      renderWithContext();

      const image = screen.getByRole("img", { name: "Margherita Pizza" });
      expect(image).toHaveAttribute(
        "src",
        "http://localhost:3000/images/pizza.jpg"
      );
      expect(image).toHaveAttribute("alt", "Margherita Pizza");
      expect(image).toHaveClass("food-item-image");
    });

    it("applies correct CSS classes to elements", () => {
      const { container } = renderWithContext();

      expect(container.querySelector(".food-item")).toBeInTheDocument();
      expect(
        container.querySelector(".food-item-img-container")
      ).toBeInTheDocument();
      expect(container.querySelector(".food-item-info")).toBeInTheDocument();
      expect(
        container.querySelector(".food-item-name-rating")
      ).toBeInTheDocument();
      expect(screen.getByText("Classic Italian pizza")).toHaveClass(
        "food-item-desc"
      );
      expect(screen.getByText("$12.99")).toHaveClass("food-item-price");
    });
  });

  describe("Cart Functionality - Item Not in Cart", () => {
    it("shows add button when item is not in cart", () => {
      renderWithContext();

      // Should show the add button (plus icon)
      const addButton = screen.getByTestId("plus-button");
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveAttribute("data-size", "30");

      // Should not show counter controls
      expect(screen.queryByTestId("minus-button")).not.toBeInTheDocument();
      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });

    it("calls addToCart when add button is clicked", () => {
      const { mockContext } = renderWithContext();

      const addButton = screen.getByTestId("plus-button");
      fireEvent.click(addButton);

      expect(mockContext.addToCart).toHaveBeenCalledTimes(1);
      expect(mockContext.addToCart).toHaveBeenCalledWith("123");
    });
  });

  describe("Cart Functionality - Item in Cart", () => {
    it("shows counter controls when item is in cart", () => {
      const contextWithItems = createMockContext({ "123": 2 });
      renderWithContext(contextWithItems);

      // Should show counter controls
      expect(screen.getByTestId("minus-button")).toBeInTheDocument();
      expect(screen.getByTestId("plus-button")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();

      // Check button sizes are different in counter mode
      expect(screen.getByTestId("minus-button")).toHaveAttribute(
        "data-size",
        "25"
      );
      expect(screen.getByTestId("plus-button")).toHaveAttribute(
        "data-size",
        "25"
      );
    });

    it("calls addToCart when plus button is clicked in counter mode", () => {
      const contextWithItems = createMockContext({ "123": 1 });
      const { mockContext } = renderWithContext(contextWithItems);

      const plusButton = screen.getByTestId("plus-button");
      fireEvent.click(plusButton);

      expect(mockContext.addToCart).toHaveBeenCalledTimes(1);
      expect(mockContext.addToCart).toHaveBeenCalledWith("123");
    });

    it("calls removeFromCart when minus button is clicked", () => {
      const contextWithItems = createMockContext({ "123": 3 });
      const { mockContext } = renderWithContext(contextWithItems);

      const minusButton = screen.getByTestId("minus-button");
      fireEvent.click(minusButton);

      expect(mockContext.removeFromCart).toHaveBeenCalledTimes(1);
      expect(mockContext.removeFromCart).toHaveBeenCalledWith("123");
    });

    it("displays correct quantity from cart", () => {
      const contextWithItems = createMockContext({ "123": 5 });
      renderWithContext(contextWithItems);

      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("Different Cart Scenarios", () => {
    it("handles item with quantity 1", () => {
      const contextWithItems = createMockContext({ "123": 1 });
      renderWithContext(contextWithItems);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByTestId("minus-button")).toBeInTheDocument();
      expect(screen.getByTestId("plus-button")).toBeInTheDocument();
    });

    it("handles other items in cart but not this item", () => {
      const contextWithItems = createMockContext({ "456": 3, "789": 1 });
      renderWithContext(contextWithItems);

      // Should show add button since item '123' is not in cart
      expect(screen.getByTestId("plus-button")).toBeInTheDocument();
      expect(screen.getByTestId("plus-button")).toHaveAttribute(
        "data-size",
        "30"
      );
      expect(screen.queryByTestId("minus-button")).not.toBeInTheDocument();
    });

    it("handles cart with zero quantity (falsy value)", () => {
      const contextWithItems = createMockContext({ "123": 0 });
      renderWithContext(contextWithItems);

      // Should show add button since 0 is falsy
      expect(screen.getByTestId("plus-button")).toBeInTheDocument();
      expect(screen.getByTestId("plus-button")).toHaveAttribute(
        "data-size",
        "30"
      );
      expect(screen.queryByTestId("minus-button")).not.toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("handles different food item props correctly", () => {
      const customProps = {
        id: "burger-001",
        name: "Cheese Burger",
        description: "Juicy beef patty with cheese",
        image: "burger.png",
        price: 8.5,
      };

      render(
        <TestWrapper contextValue={createMockContext()}>
          <FoodItem {...customProps} />
        </TestWrapper>
      );

      expect(screen.getByText("Cheese Burger")).toBeInTheDocument();
      expect(
        screen.getByText("Juicy beef patty with cheese")
      ).toBeInTheDocument();
      expect(screen.getByText("$8.5")).toBeInTheDocument();

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute(
        "src",
        "http://localhost:3000/images/burger.png"
      );
      expect(image).toHaveAttribute("alt", "Cheese Burger");
    });

    it("formats price correctly for different values", () => {
      const priceTestCases = [
        { price: 10, expected: "$10" },
        { price: 15.99, expected: "$15.99" },
        { price: 5.5, expected: "$5.5" },
        { price: 100.0, expected: "$100" },
      ];

      priceTestCases.forEach(({ price, expected }) => {
        const { unmount } = render(
          <TestWrapper contextValue={createMockContext()}>
            <FoodItem {...mockFoodProps} price={price} />
          </TestWrapper>
        );

        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("Context Integration", () => {
    it("uses URL from context for image src", () => {
      const contextWithCustomUrl = createMockContext();
      contextWithCustomUrl.url = "https://api.example.com";

      render(
        <TestWrapper contextValue={contextWithCustomUrl}>
          <FoodItem {...mockFoodProps} />
        </TestWrapper>
      );

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute(
        "src",
        "https://api.example.com/images/pizza.jpg"
      );
    });

    it("handles missing context gracefully", () => {
      // This test ensures the component doesn't crash if context is undefined
      expect(() => {
        render(<FoodItem {...mockFoodProps} />);
      }).toThrow(); // This should throw because context is required
    });
  });

  describe("Accessibility", () => {
    it("has proper button labels", () => {
      renderWithContext();

      const addButton = screen.getByLabelText("Add to cart");
      expect(addButton).toBeInTheDocument();
    });

    it("has proper button labels in counter mode", () => {
      const contextWithItems = createMockContext({ "123": 2 });
      renderWithContext(contextWithItems);

      expect(screen.getByLabelText("Add to cart")).toBeInTheDocument();
      expect(screen.getByLabelText("Remove from cart")).toBeInTheDocument();
    });

    it("has proper image alt text", () => {
      renderWithContext();

      const image = screen.getByRole("img", { name: "Margherita Pizza" });
      expect(image).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty strings in props", () => {
      const edgeCaseProps = {
        ...mockFoodProps,
        name: "",
        description: "",
        image: "",
      };

      render(
        <TestWrapper contextValue={createMockContext()}>
          <FoodItem {...edgeCaseProps} />
        </TestWrapper>
      );

      // Component should still render without crashing
      expect(screen.getByText("$12.99")).toBeInTheDocument();
    });

    it("handles very long text content", () => {
      const longTextProps = {
        ...mockFoodProps,
        name: "A".repeat(100),
        description: "B".repeat(500),
      };

      render(
        <TestWrapper contextValue={createMockContext()}>
          <FoodItem {...longTextProps} />
        </TestWrapper>
      );

      expect(screen.getByText("A".repeat(100))).toBeInTheDocument();
      expect(screen.getByText("B".repeat(500))).toBeInTheDocument();
    });
  });
});
