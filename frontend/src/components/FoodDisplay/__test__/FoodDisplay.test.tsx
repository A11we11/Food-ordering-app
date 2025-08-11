// FoodDisplay.test.tsx
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import FoodDisplay from "../FoodDisplay";
import { StoreContext } from "../../../context/storeContext";

// Mock CSS import
vi.mock("./FoodDisplay.css", () => ({}));

// Mock FoodItem component
vi.mock("../FoodItem/FoodItem", () => ({
  default: ({
    id,
    name,
    description,
    price,
    image,
  }: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  }) => (
    <div
      data-testid={`food-item-${id}`}
      data-name={name}
      data-description={description}
      data-price={price}
      data-image={image}
    >
      {name} - ${price}
    </div>
  ),
}));

// Mock food data for testing
const mockFoodList = [
  {
    _id: "1",
    name: "Margherita Pizza",
    description: "Classic Italian pizza with tomato and mozzarella",
    price: 12.99,
    image: "pizza1.jpg",
    category: "Pizza",
  },
  {
    _id: "2",
    name: "Chicken Burger",
    description: "Grilled chicken with lettuce and mayo",
    price: 8.99,
    image: "burger1.jpg",
    category: "Burgers",
  },
  {
    _id: "3",
    name: "Pepperoni Pizza",
    description: "Pizza with spicy pepperoni slices",
    price: 14.99,
    image: "pizza2.jpg",
    category: "Pizza",
  },
  {
    _id: "4",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with caesar dressing",
    price: 7.99,
    image: "salad1.jpg",
    category: "Salads",
  },
];

// Create mock store context
const createMockStoreContext = (food_list = mockFoodList) => ({
  food_list,
  // Add other context properties as needed
  url: "http://localhost:3000",
  token: null,
  setToken: vi.fn(),
  cartItems: {},
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  getTotalCartAmount: vi.fn(),
});

// Test wrapper with context
const TestWrapper = ({
  children,
  contextValue = createMockStoreContext(),
}: {
  children: React.ReactNode;
  contextValue?: any;
}) => (
  <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>
);

// Helper function to render with context
const renderWithContext = (
  component: React.ReactElement,
  contextValue?: any
) => {
  return render(
    <TestWrapper contextValue={contextValue}>{component}</TestWrapper>
  );
};

describe("FoodDisplay Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct structure and heading", () => {
    renderWithContext(<FoodDisplay category="All" />);

    // Check main container
    const container = screen.getByRole("region");
    expect(container).toHaveClass("food-display");
    expect(container).toHaveAttribute("id", "food-display");

    // Check heading
    expect(screen.getByText("top dishes near you")).toBeInTheDocument();

    // Check food display list container exists
    expect(container.querySelector(".food-display-list")).toBeInTheDocument();
  });

  it('displays all food items when category is "All"', () => {
    renderWithContext(<FoodDisplay category="All" />);

    // Should render all 4 mock food items
    expect(screen.getByTestId("food-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("food-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("food-item-3")).toBeInTheDocument();
    expect(screen.getByTestId("food-item-4")).toBeInTheDocument();

    // Check food names appear
    expect(screen.getByText("Margherita Pizza - $12.99")).toBeInTheDocument();
    expect(screen.getByText("Chicken Burger - $8.99")).toBeInTheDocument();
    expect(screen.getByText("Pepperoni Pizza - $14.99")).toBeInTheDocument();
    expect(screen.getByText("Caesar Salad - $7.99")).toBeInTheDocument();
  });

  it("filters food items by category correctly", () => {
    renderWithContext(<FoodDisplay category="Pizza" />);

    // Should only show pizza items
    expect(screen.getByTestId("food-item-1")).toBeInTheDocument(); // Margherita Pizza
    expect(screen.getByTestId("food-item-3")).toBeInTheDocument(); // Pepperoni Pizza

    // Should not show non-pizza items
    expect(screen.queryByTestId("food-item-2")).not.toBeInTheDocument(); // Chicken Burger
    expect(screen.queryByTestId("food-item-4")).not.toBeInTheDocument(); // Caesar Salad

    // Verify pizza names appear
    expect(screen.getByText("Margherita Pizza - $12.99")).toBeInTheDocument();
    expect(screen.getByText("Pepperoni Pizza - $14.99")).toBeInTheDocument();
  });

  it("filters food items for different categories", () => {
    renderWithContext(<FoodDisplay category="Burgers" />);

    // Should only show burger items
    expect(screen.getByTestId("food-item-2")).toBeInTheDocument(); // Chicken Burger
    expect(screen.getByText("Chicken Burger - $8.99")).toBeInTheDocument();

    // Should not show other categories
    expect(screen.queryByTestId("food-item-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("food-item-3")).not.toBeInTheDocument();
    expect(screen.queryByTestId("food-item-4")).not.toBeInTheDocument();
  });

  it("shows no items when category has no matches", () => {
    renderWithContext(<FoodDisplay category="Desserts" />);

    // Should not show any food items
    expect(screen.queryByTestId("food-item-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("food-item-2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("food-item-3")).not.toBeInTheDocument();
    expect(screen.queryByTestId("food-item-4")).not.toBeInTheDocument();

    // Heading should still be there
    expect(screen.getByText("top dishes near you")).toBeInTheDocument();
  });

  it("passes correct props to FoodItem components", () => {
    renderWithContext(<FoodDisplay category="Pizza" />);

    // Check first pizza item props
    const pizzaItem = screen.getByTestId("food-item-1");
    expect(pizzaItem).toHaveAttribute("data-name", "Margherita Pizza");
    expect(pizzaItem).toHaveAttribute(
      "data-description",
      "Classic Italian pizza with tomato and mozzarella"
    );
    expect(pizzaItem).toHaveAttribute("data-price", "12.99");
    expect(pizzaItem).toHaveAttribute("data-image", "pizza1.jpg");
  });

  it("handles empty food list gracefully", () => {
    const emptyContextValue = createMockStoreContext([]);
    renderWithContext(<FoodDisplay category="All" />, emptyContextValue);

    // Should still render structure
    expect(screen.getByText("top dishes near you")).toBeInTheDocument();

    // But no food items should be present
    expect(screen.queryByTestId(/food-item-/)).not.toBeInTheDocument();
  });

  it("uses array index as key for food items", () => {
    renderWithContext(<FoodDisplay category="All" />);

    // This is more of a structural test - we can't directly test React keys
    // but we can verify that all items render correctly with unique test IDs
    const foodItems = screen.getAllByTestId(/food-item-/);
    expect(foodItems).toHaveLength(4);

    // Verify each item has unique identifier
    expect(screen.getByTestId("food-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("food-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("food-item-3")).toBeInTheDocument();
    expect(screen.getByTestId("food-item-4")).toBeInTheDocument();
  });

  it("case sensitive category filtering works correctly", () => {
    renderWithContext(<FoodDisplay category="pizza" />); // lowercase

    // Should show no items because categories are case sensitive
    expect(screen.queryByTestId("food-item-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("food-item-3")).not.toBeInTheDocument();
  });

  it("handles undefined or null food_list gracefully", () => {
    const nullContextValue = createMockStoreContext(null as any);

    // This should not crash the component
    expect(() => {
      renderWithContext(<FoodDisplay category="All" />, nullContextValue);
    }).not.toThrow();
  });

  // Integration test with realistic scenario
  it("works with realistic food filtering scenario", () => {
    renderWithContext(<FoodDisplay category="All" />);

    // Start with all items
    expect(screen.getAllByTestId(/food-item-/)).toHaveLength(4);

    // Re-render with pizza filter
    const { rerender } = render(
      <TestWrapper>
        <FoodDisplay category="Pizza" />
      </TestWrapper>
    );

    expect(screen.getAllByTestId(/food-item-/)).toHaveLength(2);
    expect(screen.getByText("Margherita Pizza - $12.99")).toBeInTheDocument();
    expect(screen.getByText("Pepperoni Pizza - $14.99")).toBeInTheDocument();
  });

  // Accessibility test
  it("has proper semantic structure", () => {
    renderWithContext(<FoodDisplay category="All" />);

    // Main container should be identifiable
    const container = screen.getByRole("region");
    expect(container).toBeInTheDocument();

    // Heading should be properly structured
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("top dishes near you");
  });
});
