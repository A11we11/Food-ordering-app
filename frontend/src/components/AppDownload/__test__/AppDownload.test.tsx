// AppDownload.test.tsx
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import AppDownload from "../AppDownload";

// Mock CSS import
vi.mock("./AppDownload.css", () => ({}));

// Mock image imports
vi.mock("../../assets/store/googleplay.png", () => ({
  default: "mocked-google-play-image.png",
}));

vi.mock("../../assets/store/appstore2.png", () => ({
  default: "mocked-app-store-image.png",
}));

describe("AppDownload Component", () => {
  it("renders with correct structure and id", () => {
    render(<AppDownload />);

    const container = screen.getByRole("region");
    expect(container).toHaveClass("app-download");
    expect(container).toHaveAttribute("id", "app-download");
  });

  it("displays the main text content", () => {
    render(<AppDownload />);

    // Check for the main text with line break
    expect(
      screen.getByText("For Better Experience Download")
    ).toBeInTheDocument();
    expect(screen.getByText("QuikBite")).toBeInTheDocument();

    // Alternative: Check for combined text content
    const textElement = screen.getByText(/For Better Experience Download/);
    expect(textElement).toHaveTextContent(
      "For Better Experience Download QuikBite"
    );
  });

  it("renders both platform images", () => {
    render(<AppDownload />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);

    // Check Google Play image
    expect(images[0]).toHaveAttribute("src", "mocked-google-play-image.png");
    expect(images[0]).toHaveAttribute("alt", "");

    // Check App Store image
    expect(images[1]).toHaveAttribute("src", "mocked-app-store-image.png");
    expect(images[1]).toHaveAttribute("alt", "");
  });

  it("applies correct CSS classes", () => {
    const { container } = render(<AppDownload />);

    expect(container.querySelector(".app-download")).toBeInTheDocument();
    expect(
      container.querySelector(".app-download-platforms")
    ).toBeInTheDocument();
  });

  it("has proper structure with platforms container", () => {
    const { container } = render(<AppDownload />);

    const platformsContainer = container.querySelector(
      ".app-download-platforms"
    );
    expect(platformsContainer).toBeInTheDocument();

    // Check that both images are inside the platforms container
    const imagesInContainer = platformsContainer?.querySelectorAll("img");
    expect(imagesInContainer).toHaveLength(2);
  });

  it("renders text with line break structure", () => {
    render(<AppDownload />);

    // The component uses <br /> tag, so we test that the structure allows for line breaks
    const textElement = screen.getByText(/For Better Experience Download/);
    expect(textElement.innerHTML).toContain("<br>");
  });

  // Accessibility tests
  it("has accessible structure", () => {
    render(<AppDownload />);

    // Main container should be identifiable
    const container = screen.getByRole("region");
    expect(container).toBeInTheDocument();

    // Images should be present (even with empty alt text)
    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      expect(img).toHaveAttribute("alt");
    });
  });

  // Snapshot test (optional)
  it("matches snapshot", () => {
    const { container } = render(<AppDownload />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

// ============================================
// SIMPLE VERSION FOR QUICK TESTING
// ============================================

// AppDownload.simple.test.tsx - Essential tests only
describe("AppDownload - Essential Tests", () => {
  it("renders main content", () => {
    render(<AppDownload />);

    // Check text content
    expect(
      screen.getByText(/For Better Experience Download/)
    ).toBeInTheDocument();
    expect(screen.getByText("QuikBite")).toBeInTheDocument();

    // Check images render
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("has correct structure", () => {
    render(<AppDownload />);

    const container = screen.getByRole("region");
    expect(container).toHaveClass("app-download");
    expect(container).toHaveAttribute("id", "app-download");
  });

  it("renders platform images", () => {
    render(<AppDownload />);

    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("src", "mocked-google-play-image.png");
    expect(images[1]).toHaveAttribute("src", "mocked-app-store-image.png");
  });
});
