import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import Footer from "../Footer";

// Mock react-icons
vi.mock("react-icons/fa", () => ({
  FaInstagramSquare: ({ size }: { size: number }) => (
    <div data-testid="instagram-icon" data-size={size}>
      Instagram
    </div>
  ),
}));

vi.mock("react-icons/fa6", () => ({
  FaSquareXTwitter: ({ size }: { size: number }) => (
    <div data-testid="twitter-icon" data-size={size}>
      Twitter
    </div>
  ),
}));

vi.mock("react-icons/ri", () => ({
  RiFacebookBoxFill: ({ size }: { size: number }) => (
    <div data-testid="facebook-icon" data-size={size}>
      Facebook
    </div>
  ),
}));

// Mock Logo component
vi.mock("../logo/Logo", () => ({
  default: ({ width, height }: { width: string; height: string }) => (
    <div data-testid="logo" data-width={width} data-height={height}>
      QuikBite Logo
    </div>
  ),
}));

// Mock CSS import
vi.mock("./Footer.css", () => ({}));

describe("Footer Component", () => {
  it("renders footer with correct structure", () => {
    render(<Footer />);

    // Check main footer container exists with id
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("footer");
    expect(footer).toHaveAttribute("id", "footer");
  });

  it("renders logo with correct dimensions", () => {
    render(<Footer />);

    const logo = screen.getByTestId("logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("data-width", "120");
    expect(logo).toHaveAttribute("data-height", "48");
  });

  it("displays company description text", () => {
    render(<Footer />);

    const description = screen.getByText(
      /QuikBite is more than just a food delivery service/
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent(
      /trusted partner for satisfying cravings/
    );
    expect(description).toHaveTextContent(/delivered fast and fresh/);
  });

  it("renders all social media icons with correct sizes", () => {
    render(<Footer />);

    const facebookIcon = screen.getByTestId("facebook-icon");
    const twitterIcon = screen.getByTestId("twitter-icon");
    const instagramIcon = screen.getByTestId("instagram-icon");

    expect(facebookIcon).toBeInTheDocument();
    expect(facebookIcon).toHaveAttribute("data-size", "35");

    expect(twitterIcon).toBeInTheDocument();
    expect(twitterIcon).toHaveAttribute("data-size", "35");

    expect(instagramIcon).toBeInTheDocument();
    expect(instagramIcon).toHaveAttribute("data-size", "35");
  });

  it("displays company section with correct heading and links", () => {
    render(<Footer />);

    // Check heading
    expect(screen.getByText("COMPANY")).toBeInTheDocument();

    // Check all company links
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About us")).toBeInTheDocument();
    expect(screen.getByText("Delivery")).toBeInTheDocument();
    expect(screen.getByText("Privacy policy")).toBeInTheDocument();
  });

  it("displays contact section with correct information", () => {
    render(<Footer />);

    // Check heading
    expect(screen.getByText("GET IN TOUCH")).toBeInTheDocument();

    // Check contact information
    expect(screen.getByText("+234-70-3577-5408")).toBeInTheDocument();
    expect(screen.getByText("contact@QuikBite.com")).toBeInTheDocument();
  });

  it("displays copyright text", () => {
    render(<Footer />);

    const copyright = screen.getByText(
      /Copyright 2024 © QuikBite.com - All Right Reserved/
    );
    expect(copyright).toBeInTheDocument();
    expect(copyright).toHaveClass("footer-copyright");
  });

  it("contains horizontal rule separator", () => {
    render(<Footer />);

    // Check for HR element (using a more specific selector)
    const hr = screen.getByRole("separator");
    expect(hr).toBeInTheDocument();
  });

  it("has correct footer structure with all sections", () => {
    render(<Footer />);

    // Check main content container

    const footerContent = screen
      .getByText("QuikBite is more than just")
      .closest(".footer-content");
    expect(footerContent).toBeInTheDocument();

    // Verify all three sections exist by checking their unique content
    expect(screen.getByText("COMPANY")).toBeInTheDocument(); // Center section
    expect(screen.getByText("GET IN TOUCH")).toBeInTheDocument(); // Right section
    expect(screen.getByTestId("logo")).toBeInTheDocument(); // Left section
  });

  it("renders company navigation items in list format", () => {
    render(<Footer />);

    const companySection = screen.getByText("COMPANY").closest("div");
    const list = companySection?.querySelector("ul");
    expect(list).toBeInTheDocument();

    // Check that items are in list items
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBeGreaterThanOrEqual(6); // 4 company + 2 contact items
  });

  it("renders contact information in list format", () => {
    render(<Footer />);

    const contactSection = screen.getByText("GET IN TOUCH").closest("div");
    const list = contactSection?.querySelector("ul");
    expect(list).toBeInTheDocument();
  });

  it("has accessible structure", () => {
    render(<Footer />);

    // Footer should be identifiable as contentinfo landmark
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    // Check for proper heading hierarchy
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent("COMPANY");
    expect(headings[1]).toHaveTextContent("GET IN TOUCH");
  });

  // Test for specific CSS classes (useful for styling verification)
  it("applies correct CSS classes to sections", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("footer");

    // Test that footer-content exists
    expect(footer.querySelector(".footer-content")).toBeInTheDocument();

    // Test copyright class
    const copyright = screen.getByText(/Copyright 2025/);
    expect(copyright).toHaveClass("footer-copyright");
  });
});
