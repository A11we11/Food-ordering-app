import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlaceOrder from "../PlaceOrder";
import { StoreContext } from "../../../context/storeContext";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import type { Mocked } from "vitest";

const mockLocation = { href: "" };
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

const mockStoreContextWithCart = {
  url: "http://localhost:3000",
  token: "mock-token",
  getTotalCartAmount: vi.fn(() => 50),
  food_list: [
    {
      _id: "1",
      name: "Pizza",
      price: 20,
      image: "pizza.jpg",
      description: "Delicious pizza",
      category: "Italian",
      quantity: 1,
    },
    {
      _id: "2",
      name: "Burger",
      price: 15,
      image: "burger.jpg",
      description: "Tasty burger",
      category: "American",
      quantity: 1,
    },
  ],
  cartItems: { "1": 2, "2": 1 },
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),

  setToken: vi.fn(),
  setCartItems: vi.fn(),
};

vi.mock("axios");

const mockedAxios = axios as Mocked<typeof axios>;

interface PlaceOrderRequest {
  items: {
    _id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    category: string;
    quantity: number;
  }[];
  address: Record<string, string>;
  amount: number;
}

describe("PlaceOrder Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
  });

  it("complete order flow from form fill to payment redirect", async () => {
    const user = userEvent.setup();

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        authorization_url: "https://paystack.com/pay/complete-order-123",
      },
    });

    render(
      <BrowserRouter>
        <StoreContext.Provider value={mockStoreContextWithCart}>
          <PlaceOrder />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    const formData = {
      "First name": "Jane",
      "Last name": "Smith",
      "Email address": "jane.smith@example.com",
      Street: "456 Oak Avenue",
      City: "Abuja",
      State: "FCT",
      "Zip code": "900001",
      Country: "Nigeria",
      Phone: "+234987654321",
    };

    for (const [placeholder, value] of Object.entries(formData)) {
      await user.type(screen.getByPlaceholderText(placeholder), value);
    }

    await user.click(screen.getByText("PROCEED TO PAYMENT"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/order/place",
        expect.objectContaining({
          address: expect.objectContaining({
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@example.com",
          }),
          items: expect.arrayContaining([
            expect.objectContaining({ _id: "1", quantity: 2 }),
            expect.objectContaining({ _id: "2", quantity: 1 }),
          ]),
          amount: 52,
        }),
        { headers: { token: "mock-token" } }
      );
    });

    expect(mockLocation.href).toBe(
      "https://paystack.com/pay/complete-order-123"
    );
  });

  it("handles cart state changes during form interaction", async () => {
    const { rerender } = render(
      <BrowserRouter>
        <StoreContext.Provider value={mockStoreContextWithCart}>
          <PlaceOrder />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("$52")).toBeInTheDocument();

    const updatedContext = {
      ...mockStoreContextWithCart,
      getTotalCartAmount: vi.fn(() => 75),
    };

    rerender(
      <BrowserRouter>
        <StoreContext.Provider value={updatedContext}>
          <PlaceOrder />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("$75")).toBeInTheDocument();
    expect(screen.getByText("$77")).toBeInTheDocument();
  });

  it("creates correct order items from cart with quantities", async () => {
    const user = userEvent.setup();

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        authorization_url: "https://paystack.com/pay/xyz123",
      },
    });

    render(
      <BrowserRouter>
        <StoreContext.Provider value={mockStoreContextWithCart}>
          <PlaceOrder />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    await user.type(screen.getByPlaceholderText("First name"), "Test");
    await user.type(
      screen.getByPlaceholderText("Email address"),
      "test@example.com"
    );
    await user.type(screen.getByPlaceholderText("Phone"), "123");

    await user.click(screen.getByText("PROCEED TO PAYMENT"));

    await waitFor(() => {
      const callArgs = mockedAxios.post.mock.calls[0][1] as PlaceOrderRequest;
      expect(callArgs.items).toEqual([
        {
          _id: "1",
          name: "Pizza",
          price: 20,
          image: "pizza.jpg",
          description: "Delicious pizza",
          category: "Italian",
          quantity: 2,
        },
        {
          _id: "2",
          name: "Burger",
          price: 15,
          image: "burger.jpg",
          description: "Tasty burger",
          category: "American",
          quantity: 1,
        },
      ]);
    });
  });
});
