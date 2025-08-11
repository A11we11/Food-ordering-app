import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import Navbar from "../Navbar";
import { StoreContext } from "../../../context/storeContext";

// Mock the components that aren't relevant to our tests
// Note: We're NOT mocking the Logo component since it's rendering properly
// vi.mock('../logo/Logo', () => ({
//   default: ({ width, height }: { width: string; height: string }) => (
//     <div data-testid="logo" data-width={width} data-height={height}>
//       Logo
//     </div>
//   ),
// }));

// Mock react-icons
vi.mock("react-icons/fa", () => ({
  FaUserCircle: ({ size }: { size: number }) => (
    <div data-testid="user-icon" data-size={size}>
      UserIcon
    </div>
  ),
}));

vi.mock("react-icons/io5", () => ({
  IoBagSharp: ({ size }: { size: number }) => (
    <div data-testid="bag-icon" data-size={size}>
      BagIcon
    </div>
  ),
}));

vi.mock("react-icons/md", () => ({
  MdLogout: ({ size }: { size: number }) => (
    <div data-testid="logout-icon" data-size={size}>
      LogoutIcon
    </div>
  ),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Create a test wrapper component that provides necessary context and routing
const TestWrapper = ({
  children,
  storeContextValue,
}: {
  children: React.ReactNode;
  storeContextValue: any;
}) => (
  <BrowserRouter>
    <StoreContext.Provider value={storeContextValue}>
      {children}
    </StoreContext.Provider>
  </BrowserRouter>
);

// Default mock context values
const defaultStoreContext = {
  getTotalCartAmount: vi.fn(() => 0),
  token: null,
  setToken: vi.fn(),
};

// Helper function to render Navbar with default props and context
const renderNavbar = (props = {}, storeContextOverrides = {}) => {
  const defaultProps = {
    setShowLogin: vi.fn(),
  };

  const storeContextValue = {
    ...defaultStoreContext,
    ...storeContextOverrides,
  };

  return render(
    <TestWrapper storeContextValue={storeContextValue}>
      <Navbar {...defaultProps} {...props} />
    </TestWrapper>
  );
};

describe("Navbar Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // Mock scrollTo and getElementById for smooth scrolling
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
    });

    Object.defineProperty(document, "getElementById", {
      value: vi.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("renders the navbar with all essential elements", () => {
      renderNavbar();

      // Check if logo is rendered - use the actual aria-label from your Logo component
      expect(screen.getByLabelText("Logo")).toBeInTheDocument();

      // Check if navigation items are rendered
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Menu")).toBeInTheDocument();
      expect(screen.getByText("Mobile-app")).toBeInTheDocument();
      expect(screen.getByText("Contact-us")).toBeInTheDocument();

      // Check if shopping basket is rendered
      expect(screen.getByLabelText("Shopping Basket")).toBeInTheDocument();
    });

    it("renders sign in button when user is not authenticated", () => {
      renderNavbar();

      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
      expect(screen.queryByTestId("user-icon")).not.toBeInTheDocument();
    });

    it("renders user profile when user is authenticated", () => {
      renderNavbar({}, { token: "mock-token" });

      expect(
        screen.queryByRole("button", { name: /sign in/i })
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
      expect(screen.getByText("Orders")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("shows cart dot indicator when cart has items", () => {
      renderNavbar({}, { getTotalCartAmount: vi.fn(() => 5) });

      const cartContainer =
        screen.getByLabelText("Shopping Basket").parentElement;
      const dot = cartContainer?.querySelector(".dot");
      expect(dot).toBeInTheDocument();
    });

    it("does not show cart dot when cart is empty", () => {
      renderNavbar({}, { getTotalCartAmount: vi.fn(() => 0) });

      const cartContainer =
        screen.getByLabelText("Shopping Basket").parentElement;
      const dot = cartContainer?.querySelector(".dot");
      expect(dot).not.toBeInTheDocument();
    });
  });

  describe("Navigation Interactions", () => {
    it("sets active item when navigation link is clicked", () => {
      renderNavbar();

      const menuLink = screen.getByText("Menu");
      fireEvent.click(menuLink);

      // Check if the menu item has active class
      expect(menuLink.closest("a")).toHaveClass("active");

      // Check if active indicator is shown
      expect(
        screen
          .getByText("Menu")
          .parentElement?.querySelector(".active-indicator")
      ).toBeInTheDocument();
    });

    it("handles smooth scroll to top when home is clicked", () => {
      const mockScrollTo = vi.fn();
      Object.defineProperty(window, "scrollTo", {
        value: mockScrollTo,
        writable: true,
      });

      renderNavbar();

      const homeLink = screen.getByText("Home");
      fireEvent.click(homeLink);

      expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });

    it("handles smooth scroll to specific element", () => {
      const mockElement = { scrollIntoView: vi.fn() };
      const mockGetElementById = vi.fn(() => mockElement);
      Object.defineProperty(document, "getElementById", {
        value: mockGetElementById,
        writable: true,
      });

      renderNavbar();

      const menuLink = screen.getByText("Menu");
      fireEvent.click(menuLink);

      expect(mockGetElementById).toHaveBeenCalledWith("explore-menu");
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
      });
    });
  });

  describe("Authentication Actions", () => {
    it("calls setShowLogin when sign in button is clicked", () => {
      const mockSetShowLogin = vi.fn();
      renderNavbar({ setShowLogin: mockSetShowLogin });

      const signInButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(signInButton);

      expect(mockSetShowLogin).toHaveBeenCalledWith(true);
    });

    it("handles logout correctly", () => {
      const mockSetToken = vi.fn();
      const mockRemoveItem = vi.fn();

      Object.defineProperty(window, "localStorage", {
        value: { removeItem: mockRemoveItem },
        writable: true,
      });

      renderNavbar(
        {},
        {
          token: "mock-token",
          setToken: mockSetToken,
        }
      );

      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      expect(mockRemoveItem).toHaveBeenCalledWith("token");
      expect(mockSetToken).toHaveBeenCalledWith("");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("navigates to orders page when orders is clicked", () => {
      renderNavbar({}, { token: "mock-token" });

      const ordersButton = screen.getByText("Orders");
      fireEvent.click(ordersButton);

      expect(mockNavigate).toHaveBeenCalledWith("/myorders");
    });
  });

  describe("Accessibility", () => {
    it("has proper link roles and accessible names", () => {
      renderNavbar();

      // Check that logo link exists - using the actual aria-label
      const logoLink = screen.getByLabelText("Logo");
      expect(logoLink.closest("a")).toHaveAttribute("href", "/");

      // Check cart link - using the actual aria-label
      const cartLink = screen.getByLabelText("Shopping Basket");
      expect(cartLink.closest("a")).toHaveAttribute("href", "/cart");
    });

    it("maintains proper heading structure and semantic elements", () => {
      renderNavbar();

      // Check that navigation is in a list
      const navList = screen.getByRole("list");
      expect(navList).toBeInTheDocument();

      // Check that nav items are list items
      const navItems = screen.getAllByRole("listitem");
      expect(navItems).toHaveLength(4); // Home, Menu, Mobile-app, Contact-us
    });
  });

  describe("Context Dependencies", () => {
    it("calls getTotalCartAmount from context", () => {
      const mockGetTotalCartAmount = vi.fn(() => 3);
      renderNavbar({}, { getTotalCartAmount: mockGetTotalCartAmount });

      // The function should be called during render to determine if dot should show
      expect(mockGetTotalCartAmount).toHaveBeenCalled();
    });

    it("uses token from context to determine authentication state", () => {
      const { rerender } = renderNavbar({}, { token: null });
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();

      // Re-render with token
      rerender(
        <TestWrapper
          storeContextValue={{ ...defaultStoreContext, token: "mock-token" }}
        >
          <Navbar setShowLogin={vi.fn()} />
        </TestWrapper>
      );

      expect(
        screen.queryByRole("button", { name: /sign in/i })
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles missing scroll target gracefully", () => {
      const mockGetElementById = vi.fn(() => null);
      Object.defineProperty(document, "getElementById", {
        value: mockGetElementById,
        writable: true,
      });

      renderNavbar();

      const menuLink = screen.getByText("Menu");

      // Should not throw error when element is not found
      expect(() => fireEvent.click(menuLink)).not.toThrow();
      expect(mockGetElementById).toHaveBeenCalledWith("explore-menu");
    });
  });
});
