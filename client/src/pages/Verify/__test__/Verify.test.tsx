import { render, waitFor } from "@testing-library/react";
import Verify from "../Verify";
import { StoreContext } from "../../../context/storeContext";
import { MemoryRouter } from "react-router-dom";
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

const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});

const mockStoreContext = {
  url: "http://localhost:3000",
  token: "mock-token",
  getTotalCartAmount: vi.fn(() => 0),
  food_list: [],
  cartItems: {},
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  setCartItems: vi.fn(),
  setToken: vi.fn(),
};

const renderWithRouter = (initialEntries = ["/verify"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <StoreContext.Provider value={mockStoreContext}>
        <Verify />
      </StoreContext.Provider>
    </MemoryRouter>
  );
};

const mockedAxios = axios as Mocked<typeof axios>;

describe("Verify Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("renders loading spinner", () => {
    renderWithRouter();
    expect(document.querySelector(".spinner")).toBeInTheDocument();
  });

  it("verifies payment and navigates to myorders on success", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true },
    });

    renderWithRouter(["/verify?success=true&orderId=order123"]);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/order/verify",
        {
          success: "true",
          orderId: "order123",
        }
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/myorders");
    });
  });

  it("navigates to home on verification failure", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: false },
    });

    renderWithRouter(["/verify?success=false&orderId=order123"]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("navigates to home on API error", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(["/verify?success=true&orderId=order123"]);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Verification error:",
        expect.any(Error)
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("handles missing search parameters", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: false },
    });

    renderWithRouter(["/verify"]);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/order/verify",
        {
          success: null,
          orderId: null,
        }
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("only calls verifyPayment once on mount", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true },
    });

    renderWithRouter(["/verify?success=true&orderId=order123"]);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });
});
