import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyOrders from "../MyOrders";
import { StoreContext } from "../../../context/storeContext";
import "@testing-library/jest-dom";

import axios from "axios";
import type { Mocked } from "vitest";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;

// Mock the DeliveryBoxIcon component
vi.mock("../../components/Deliverybox", () => ({
  default: ({ style }: any) => (
    <div data-testid="delivery-box-icon" style={style}>
      📦
    </div>
  ),
}));

const mockStoreContext = {
  url: "http://localhost:3000/",
  token: "mock-auth-token-123",
  cartItems: {},
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  getTotalCartAmount: vi.fn(() => 0),
  food_list: [],
  setToken: vi.fn(),
  setCartItems: vi.fn(),
};

const renderWithContext = (contextValue = mockStoreContext) => {
  return render(
    <StoreContext.Provider value={contextValue}>
      <MyOrders />
    </StoreContext.Provider>
  );
};

describe("MyOrders Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders My Orders title", () => {
    renderWithContext();
    expect(screen.getByText("My Orders")).toBeInTheDocument();
  });

  it("does not fetch orders when token is not available", () => {
    const contextWithoutToken = { ...mockStoreContext, token: "" };
    renderWithContext(contextWithoutToken);

    expect(axios.post).not.toHaveBeenCalled();
  });

  it("fetches and displays orders when token is available", async () => {
    const mockOrders = [
      {
        items: [
          { name: "Caesar Salad", quantity: 2 },
          { name: "Garlic Bread", quantity: 1 },
        ],
        amount: 25,
        status: "Delivered",
      },
    ];

    mockedAxios.post.mockResolvedValueOnce({
      data: { data: mockOrders },
    });

    renderWithContext();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/order/userorders",
        {},
        { headers: { token: "mock-auth-token-123" } }
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Caesar Salad x 2, Garlic Bread x 1")
      ).toBeInTheDocument();
      expect(screen.getByText("$25.00")).toBeInTheDocument();
      expect(screen.getByText("Delivered")).toBeInTheDocument();
      expect(screen.getByText("Items: 2")).toBeInTheDocument();
    });
  });

  it("renders DeliveryBoxIcon with correct props", async () => {
    const mockOrder = {
      items: [{ name: "Test", quantity: 1 }],
      amount: 10,
      status: "Delivered",
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: { data: [mockOrder] },
    });

    renderWithContext();

    await waitFor(() => {
      const deliveryIcon = screen.getByTestId("delivery-box-icon");
      expect(deliveryIcon).toBeInTheDocument();
      expect(deliveryIcon).toHaveStyle({ width: "200px", height: "200px" });
    });
  });

  it("handles Track Order button click", async () => {
    const user = userEvent.setup();
    const mockOrder = {
      items: [{ name: "Test Item", quantity: 1 }],
      amount: 15,
      status: "Shipped",
    };

    mockedAxios.post.mockResolvedValue({
      data: { data: [mockOrder] },
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Test Item x 1")).toBeInTheDocument();
    });

    const trackButton = screen.getByText("Track Order");
    await user.click(trackButton);

    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it("formats single item order correctly", async () => {
    const singleItemOrder = {
      items: [{ name: "Single Pizza", quantity: 1 }],
      amount: 20,
      status: "Ready",
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: { data: [singleItemOrder] },
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Single Pizza x 1")).toBeInTheDocument();
      expect(screen.queryByText("Single Pizza x 1,")).not.toBeInTheDocument();
    });
  });

  it("handles API error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("My Orders")).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
