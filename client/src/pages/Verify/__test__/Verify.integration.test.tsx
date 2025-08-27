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

describe("Verify Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successful payment verification flow", async () => {
    const successUrl =
      "/verify?success=true&orderId=ord_12345&reference=ref_67890";

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Payment verified successfully",
      },
    });

    render(
      <MemoryRouter initialEntries={[successUrl]}>
        <StoreContext.Provider value={mockStoreContext}>
          <Verify />
        </StoreContext.Provider>
      </MemoryRouter>
    );

    expect(document.querySelector(".spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/order/verify",
        {
          success: "true",
          orderId: "ord_12345",
        }
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/myorders");
    });
  });

  it("failed payment verification flow", async () => {
    const failureUrl = "/verify?success=false&orderId=ord_12345";

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Payment verification failed",
      },
    });

    render(
      <MemoryRouter initialEntries={[failureUrl]}>
        <StoreContext.Provider value={mockStoreContext}>
          <Verify />
        </StoreContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/order/verify",
        {
          success: "false",
          orderId: "ord_12345",
        }
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("handles malformed callback URLs", async () => {
    const malformedUrl = "/verify?invalid=params";

    mockedAxios.post.mockRejectedValueOnce(new Error("Invalid parameters"));

    render(
      <MemoryRouter initialEntries={[malformedUrl]}>
        <StoreContext.Provider value={mockStoreContext}>
          <Verify />
        </StoreContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("handles different URL parameter combinations", async () => {
    const testCases = [
      {
        url: "/verify?success=true",
        expectedParams: { success: "true", orderId: null },
      },
      {
        url: "/verify?orderId=123",
        expectedParams: { success: null, orderId: "123" },
      },
      {
        url: "/verify?success=false&orderId=456",
        expectedParams: { success: "false", orderId: "456" },
      },
    ];

    for (const testCase of testCases) {
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: false },
      });

      render(
        <MemoryRouter initialEntries={[testCase.url]}>
          <StoreContext.Provider value={mockStoreContext}>
            <Verify />
          </StoreContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "http://localhost:3000/api/order/verify",
          testCase.expectedParams
        );
      });

      vi.clearAllMocks();
    }
  });
});
