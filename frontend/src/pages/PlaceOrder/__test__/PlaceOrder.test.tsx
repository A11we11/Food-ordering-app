import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlaceOrder from "../PlaceOrder";
import { StoreContext } from "../../../context/storeContext";
import { BrowserRouter } from "react-router-dom";
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

vi.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;

const mockLocation = { href: "" };
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

const mockAlert = vi.fn();
global.alert = mockAlert;

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

const renderWithContext = (contextValue = mockStoreContextWithCart) => {
  return render(
    <BrowserRouter>
      <StoreContext.Provider value={contextValue}>
        <PlaceOrder />
      </StoreContext.Provider>
    </BrowserRouter>
  );
};

describe("PlaceOrder Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
  });

  it("renders delivery information form", () => {
    renderWithContext();

    expect(screen.getByText("Delivery Information")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Street")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("City")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("State")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Zip code")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Country")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Phone")).toBeInTheDocument();
  });

  it("displays cart totals correctly", () => {
    renderWithContext();

    expect(screen.getByText("Cart Totals")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("$2")).toBeInTheDocument();
    expect(screen.getByText("$52")).toBeInTheDocument();
  });

  it("handles form input changes", async () => {
    const user = userEvent.setup();
    renderWithContext();

    const firstNameInput = screen.getByPlaceholderText("First name");
    const emailInput = screen.getByPlaceholderText("Email address");

    await user.type(firstNameInput, "John");
    await user.type(emailInput, "john@example.com");

    expect(firstNameInput).toHaveValue("John");
    expect(emailInput).toHaveValue("john@example.com");
  });

  it("redirects to cart when no token", () => {
    const contextWithoutToken = { ...mockStoreContextWithCart, token: "" };
    renderWithContext(contextWithoutToken);

    expect(mockNavigate).toHaveBeenCalledWith("/cart");
  });

  it("shows loading state during order submission", async () => {
    const user = userEvent.setup();

    mockedAxios.post.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: {
                  success: true,
                  authorization_url: "https://paystack.com/pay/xyz123",
                },
              }),
            100
          )
        )
    );

    renderWithContext();

    await user.type(screen.getByPlaceholderText("First name"), "John");
    await user.type(
      screen.getByPlaceholderText("Email address"),
      "john@example.com"
    );
    await user.type(screen.getByPlaceholderText("Phone"), "123456789");

    await user.click(screen.getByText("PROCEED TO PAYMENT"));

    expect(screen.getByText("processing...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /processing/i })).toBeDisabled();
  });

  it("handles order submission error", async () => {
    const user = userEvent.setup();

    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    renderWithContext();

    await user.type(screen.getByPlaceholderText("First name"), "John");
    await user.type(
      screen.getByPlaceholderText("Email address"),
      "john@example.com"
    );
    await user.type(screen.getByPlaceholderText("Phone"), "123456789");

    await user.click(screen.getByText("PROCEED TO PAYMENT"));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("Error placing order");
    });
  });
});
