// AppDownload.test.tsx
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import AppDownload from "../AppDownload";

// Mock CSS import
vi.mock("./AppDownload.css", () => ({}));

// Mock image imports - FIXED PATHS
vi.mock("../../../assets/store/googleplay.png", () => ({
  default: "mocked-assets/store/googleplay.png",
}));

vi.mock("../../../assets/store/appstore2.png", () => ({
  default: "mocked-assets/store/appstore2.png",
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
      screen.getByText(/For Better Experience Download/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/QuikBite/i)).toBeInTheDocument();

    /*  // Alternative: Check for combined text content
    const textElement = screen.getByText(/For Better Experience Download/);
    expect(textElement).toHaveTextContent(
      "For Better Experience Download QuikBite"
    ); */
    // Matches combined text, ignoring whitespace/line breaks
    expect(
      screen.getByText(/For Better Experience Download\s+QuikBite/i)
    ).toBeInTheDocument();
  });

  it("renders both platform images", () => {
    render(<AppDownload />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);

    // Check Google Play image
    expect(images[0]).toHaveAttribute(
      "src",
      "mocked-assets/store/googleplay.png"
    );
    expect(images[0]).toHaveAttribute("alt", "google image");

    // Check App Store image
    expect(images[1]).toHaveAttribute(
      "src",
      "mocked-assets/store/appstore2.png"
    );
    expect(images[1]).toHaveAttribute("alt", "apple image");
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
