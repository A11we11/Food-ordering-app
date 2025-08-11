import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { LoginPopupServer } from "../../../mocks/server";
import LoginPopup from "../LoginPopup";
import { StoreContext } from "../../../context/storeContext";

// Mock axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock react-icons
vi.mock("react-icons/rx", () => ({
  RxCross2: ({ onClick }: { onClick: () => void; size: number }) => (
    <button onClick={onClick} data-testid="close-button">
      Close
    </button>
  ),
}));

// Start server before all tests
beforeAll(() => LoginPopupServer.listen());
afterEach(() => LoginPopupServer.resetHandlers());
afterAll(() => LoginPopupServer.close());

// Mock store context values
const mockStoreContext = {
  url: "http://localhost:3000",
  setToken: vi.fn(),
  food_list: [],
  cartItems: {},
  setCartItems: vi.fn(),
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  getTotalCartAmount: vi.fn().mockReturnValue(0),
  token: "",
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreContext.Provider value={mockStoreContext}>
    {children}
  </StoreContext.Provider>
);

// Helper function to render with context
const renderWithContext = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe("LoginPopup Component", () => {
  const mockSetShowLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
    // Mock alert
    window.alert = vi.fn();
  });

  it("renders login popup with sign up form by default", () => {
    renderWithContext(<LoginPopup setShowLogin={mockSetShowLogin} />);

    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
    expect(screen.getByText("Create account")).toBeInTheDocument();
  });

  it("switches to login form when clicking login link", () => {
    renderWithContext(<LoginPopup setShowLogin={mockSetShowLogin} />);

    fireEvent.click(screen.getByText("Login here"));

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Your name")).not.toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("switches to sign up form when clicking sign up link", () => {
    renderWithContext(<LoginPopup setShowLogin={mockSetShowLogin} />);

    // First switch to login
    fireEvent.click(screen.getByText("Login here"));
    // Then switch back to sign up
    fireEvent.click(screen.getByText("Click here"));

    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
  });

  it("closes popup when close button is clicked", () => {
    renderWithContext(<LoginPopup setShowLogin={mockSetShowLogin} />);

    fireEvent.click(screen.getByTestId("close-button"));

    expect(mockSetShowLogin).toHaveBeenCalledWith(false);
  });

  it("updates form data when inputs change", () => {
    renderWithContext(<LoginPopup setShowLogin={mockSetShowLogin} />);

    const nameInput = screen.getByPlaceholderText(
      "Your name"
    ) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(
      "Your email"
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      "password"
    ) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(nameInput.value).toBe("John Doe");
    expect(emailInput.value).toBe("john@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("handles successful login", async () => {
    renderWithContext(<LoginPopup setShowLogin={mockSetShowLogin} />);

    // Switch to login form
    fireEvent.click(screen.getByText("Login here"));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText("Your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "password123" },
    });

    // Check the terms checkbox
    fireEvent.click(screen.getByRole("checkbox"));

    // Submit form
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(mockStoreContext.setToken).toHaveBeenCalledWith("mock-token-123");
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "token",
        "mock-token-123"
      );
    });
  });

  it("handles successful registration", async () => {
    renderWithContext(<LoginPopup setShowLogin={mockSetShowLogin} />);

    // Fill registration form
    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "New User" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "password123" },
    });

    // Check the terms checkbox
    fireEvent.click(screen.getByRole("checkbox"));

    // Submit form
    fireEvent.click(screen.getByText("Create account"));

    await waitFor(() => {
      expect(mockStoreContext.setToken).toHaveBeenCalledWith(
        "new-user-token-456"
      );
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "token",
        "new-user-token-456"
      );
    });
  });

  it("handles login failure", async () => {
    renderWithContext(<LoginPopup setShowLogin={mockSetShowLogin} />);

    // Switch to login form
    fireEvent.click(screen.getByText("Login here"));

    // Fill form with wrong credentials
    fireEvent.change(screen.getByPlaceholderText("Your email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "wrongpassword" },
    });

    // Check the terms checkbox
    fireEvent.click(screen.getByRole("checkbox"));

    // Submit form
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Invalid credentials");
      expect(mockStoreContext.setToken).not.toHaveBeenCalled();
    });
  });

  it("handles registration failure", async () => {
    renderWithContext(<LoginPopup setShowLogin={mockSetShowLogin} />);

    // Fill registration form with existing email
    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Existing User" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your email"), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "password123" },
    });

    // Check the terms checkbox
    fireEvent.click(screen.getByRole("checkbox"));

    // Submit form
    fireEvent.click(screen.getByText("Create account"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("User already exists");
      expect(mockStoreContext.setToken).not.toHaveBeenCalled();
    });
  });

  it("requires all fields to be filled", () => {
    renderWithContext(<LoginPopup setShowLogin={mockSetShowLogin} />);

    const nameInput = screen.getByPlaceholderText("Your name");
    const emailInput = screen.getByPlaceholderText("Your email");
    const passwordInput = screen.getByPlaceholderText("password");
    const checkbox = screen.getAllByRole("checkbox");

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(checkbox).toBeRequired();
  });
});
