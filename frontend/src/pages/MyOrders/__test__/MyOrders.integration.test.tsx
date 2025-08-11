import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyOrders from "../MyOrders";
import { StoreContext } from "../../../context/storeContext";
import "@testing-library/jest-dom";

import axios from "axios";
import type { Mocked } from "vitest";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockStoreContext = {
  url: "http://localhost:3000",
  token: "mock-token",
  getTotalCartAmount: vi.fn(() => 0),
  food_list: [],
  cartItems: {},
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  setToken: vi.fn(),
  setCartItems: vi.fn(),
};

vi.mock("axios");

const mockedAxios = axios as Mocked<typeof axios>;

describe("MyOrders Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refetches orders when token changes", async () => {
    const mockOrders = [
      {
        items: [{ name: "Pizza", quantity: 1 }],
        amount: 20,
        status: "Delivered",
      },
    ];

    mockedAxios.post.mockResolvedValue({
      data: { data: mockOrders },
    });

    const { rerender } = render(
      <StoreContext.Provider value={{ ...mockStoreContext, token: "" }}>
        <MyOrders />
      </StoreContext.Provider>
    );

    expect(axios.post).not.toHaveBeenCalled();

    rerender(
      <StoreContext.Provider
        value={{ ...mockStoreContext, token: "new-token" }}
      >
        <MyOrders />
      </StoreContext.Provider>
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/order/userorders",
        {},
        { headers: { token: "new-token" } }
      );
    });
  });

  it("maintains order display after multiple track order clicks", async () => {
    const user = userEvent.setup();
    const mockOrder = {
      items: [{ name: "Persistent Order", quantity: 1 }],
      amount: 30,
      status: "Processing",
    };

    mockedAxios.post.mockResolvedValue({
      data: { data: [mockOrder] },
    });

    render(
      <StoreContext.Provider value={mockStoreContext}>
        <MyOrders />
      </StoreContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Persistent Order x 1")).toBeInTheDocument();
    });

    const trackButton = screen.getByText("Track Order");
    await user.click(trackButton);
    await user.click(trackButton);

    await waitFor(() => {
      expect(screen.getByText("Persistent Order x 1")).toBeInTheDocument();
      expect(axios.post).toHaveBeenCalledTimes(3);
    });
  });

  it("handles real-time order status updates", async () => {
    const user = userEvent.setup();
    let callCount = 0;

    mockedAxios.post.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          data: {
            data: [
              {
                items: [{ name: "Pizza", quantity: 1 }],
                amount: 20,
                status: "Preparing",
              },
            ],
          },
        });
      } else {
        return Promise.resolve({
          data: {
            data: [
              {
                items: [{ name: "Pizza", quantity: 1 }],
                amount: 20,
                status: "Out for Delivery",
              },
            ],
          },
        });
      }
    });

    render(
      <StoreContext.Provider value={mockStoreContext}>
        <MyOrders />
      </StoreContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Preparing")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Track Order"));

    await waitFor(() => {
      expect(screen.getByText("Out for Delivery")).toBeInTheDocument();
    });
  });
});
