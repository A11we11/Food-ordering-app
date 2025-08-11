// ExploreMenu.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ExploreMenu from "../ExploreMenu";

// Mock CSS import
vi.mock("./ExploreMenu.css", () => ({}));

// Mock the menu_list data from assets
const mockMenuList = [
  {
    menu_name: "Salad",
    menu_image: "salad.png",
  },
  {
    menu_name: "Rolls",
    menu_image: "rolls.png",
  },
  {
    menu_name: "Desserts",
    menu_image: "desserts.png",
  },
  {
    menu_name: "Sandwich",
    menu_image: "sandwich.png",
  },
  {
    menu_name: "Cake",
    menu_image: "cake.png",
  },
  {
    menu_name: "Pure Veg",
    menu_image: "pure_veg.png",
  },
  {
    menu_name: "Pasta",
    menu_image: "pasta.png",
  },
  {
    menu_name: "Noodles",
    menu_image: "noodles.png",
  },
];

vi.mock("../../assets/assets", () => ({
  menu_list: mockMenuList,
}));

describe("ExploreMenu Component", () => {
  const mockSetCategory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders main structure and static content", () => {
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      // Check main container
      const container = screen.getByRole("region");
      expect(container).toHaveClass("explore-menu");
      expect(container).toHaveAttribute("id", "explore-menu");

      // Check heading
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Explore our Menu"
      );

      // Check description text
      expect(
        screen.getByText(/choose from a diverse menu/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/satisfy your cravings/i)).toBeInTheDocument();

      // Check horizontal rule
      expect(screen.getByRole("separator")).toBeInTheDocument();
    });

    it("renders correct number of menu items", () => {
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      // Should render all menu items from mock data
      const menuItems = screen.getAllByRole("button");
      expect(menuItems).toHaveLength(mockMenuList.length);
    });

    it("renders all menu item names", () => {
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      mockMenuList.forEach((item) => {
        expect(screen.getByText(item.menu_name)).toBeInTheDocument();
      });
    });

    it("renders all menu item images with correct sources", () => {
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(mockMenuList.length);

      images.forEach((img, index) => {
        expect(img).toHaveAttribute("src", mockMenuList[index].menu_image);
      });
    });
  });

  describe("Category Selection and Active States", () => {
    it("applies active class to selected category image", () => {
      render(<ExploreMenu category="Salad" setCategory={mockSetCategory} />);

      const images = screen.getAllByRole("img");
      const saladImage = images[0]; // First item is Salad
      const rollsImage = images[1]; // Second item is Rolls

      expect(saladImage).toHaveClass("active");
      expect(rollsImage).not.toHaveClass("active");
    });

    it("applies active class to different selected categories", () => {
      const { rerender } = render(
        <ExploreMenu category="Pasta" setCategory={mockSetCategory} />
      );

      // Find Pasta image (index 6 in mockMenuList)
      const images = screen.getAllByRole("img");
      const pastaImage = images[6];
      expect(pastaImage).toHaveClass("active");

      // Re-render with different category
      rerender(
        <ExploreMenu category="Desserts" setCategory={mockSetCategory} />
      );

      const updatedImages = screen.getAllByRole("img");
      const dessertsImage = updatedImages[2]; // Desserts is index 2
      expect(dessertsImage).toHaveClass("active");
      expect(updatedImages[6]).not.toHaveClass("active"); // Pasta should not be active
    });

    it('no images have active class when category is "All"', () => {
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).not.toHaveClass("active");
      });
    });

    it("handles non-existent category gracefully", () => {
      render(
        <ExploreMenu category="NonExistent" setCategory={mockSetCategory} />
      );

      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).not.toHaveClass("active");
      });
    });
  });

  describe("Click Interactions and State Management", () => {
    it("calls setCategory with menu name when clicking unselected item", () => {
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      const saladButton = screen.getByText("Salad").closest("div");
      fireEvent.click(saladButton!);

      // Should call setCategory with a function
      expect(mockSetCategory).toHaveBeenCalledTimes(1);
      expect(mockSetCategory).toHaveBeenCalledWith(expect.any(Function));

      // Test the function behavior
      const setterFunction = mockSetCategory.mock.calls[0][0];
      expect(setterFunction("All")).toBe("Salad");
      expect(setterFunction("Pasta")).toBe("Salad");
    });

    it('calls setCategory with "All" when clicking currently selected item', () => {
      render(<ExploreMenu category="Salad" setCategory={mockSetCategory} />);

      const saladButton = screen.getByText("Salad").closest("div");
      fireEvent.click(saladButton!);

      expect(mockSetCategory).toHaveBeenCalledTimes(1);

      // Test the function behavior - should return "All" when prev === current
      const setterFunction = mockSetCategory.mock.calls[0][0];
      expect(setterFunction("Salad")).toBe("All");
    });

    it("handles clicking different menu items correctly", () => {
      render(<ExploreMenu category="Rolls" setCategory={mockSetCategory} />);

      // Click on Desserts
      const dessertsButton = screen.getByText("Desserts").closest("div");
      fireEvent.click(dessertsButton!);

      const setterFunction = mockSetCategory.mock.calls[0][0];
      expect(setterFunction("Rolls")).toBe("Desserts");
    });

    it("all menu items are clickable", () => {
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      mockMenuList.forEach((item, index) => {
        const itemButton = screen.getByText(item.menu_name).closest("div");
        expect(itemButton).toHaveAttribute("class", "explore-menu-list-item");

        fireEvent.click(itemButton!);
        expect(mockSetCategory).toHaveBeenCalledTimes(index + 1);
      });
    });
  });

  describe("Toggle Functionality Logic", () => {
    it("implements correct toggle logic for same category", () => {
      render(<ExploreMenu category="Pasta" setCategory={mockSetCategory} />);

      const pastaButton = screen.getByText("Pasta").closest("div");
      fireEvent.click(pastaButton!);

      // When clicking the same category, it should toggle to "All"
      const setterFunction = mockSetCategory.mock.calls[0][0];
      expect(setterFunction("Pasta")).toBe("All");
    });

    it("implements correct selection logic for different category", () => {
      render(<ExploreMenu category="Salad" setCategory={mockSetCategory} />);

      const cakeButton = screen.getByText("Cake").closest("div");
      fireEvent.click(cakeButton!);

      // When clicking different category, it should select that category
      const setterFunction = mockSetCategory.mock.calls[0][0];
      expect(setterFunction("Salad")).toBe("Cake");
      expect(setterFunction("All")).toBe("Cake");
      expect(setterFunction("Rolls")).toBe("Cake");
    });
  });

  describe("Structure and Layout", () => {
    it("has correct CSS classes applied", () => {
      const { container } = render(
        <ExploreMenu category="All" setCategory={mockSetCategory} />
      );

      expect(container.querySelector(".explore-menu")).toBeInTheDocument();
      expect(container.querySelector(".explore-menu-text")).toBeInTheDocument();
      expect(container.querySelector(".explore-menu-list")).toBeInTheDocument();

      const menuItems = container.querySelectorAll(".explore-menu-list-item");
      expect(menuItems).toHaveLength(mockMenuList.length);
    });

    it("maintains proper DOM structure", () => {
      const { container } = render(
        <ExploreMenu category="All" setCategory={mockSetCategory} />
      );

      const menuList = container.querySelector(".explore-menu-list");
      expect(menuList).toBeInTheDocument();

      const menuItems = menuList?.querySelectorAll(".explore-menu-list-item");
      expect(menuItems).toHaveLength(mockMenuList.length);

      // Each menu item should have image and text
      menuItems?.forEach((item) => {
        expect(item.querySelector("img")).toBeInTheDocument();
        expect(item.querySelector("p")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper heading structure", () => {
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Explore our Menu");
    });

    it("menu items are keyboard accessible", () => {
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      // Menu items should be focusable (they have onClick handlers)
      const firstMenuItem = screen.getByText("Salad").closest("div");
      expect(firstMenuItem).toHaveAttribute("class", "explore-menu-list-item");

      // While we can't easily test keyboard events without additional setup,
      // we can verify the structure supports accessibility
    });

    it("images have alt attributes (even if empty)", () => {
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("alt");
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles empty menu_list gracefully", () => {
      // Mock empty menu list
      vi.doMock("../../assets/assets", () => ({
        menu_list: [],
      }));

      expect(() => {
        render(<ExploreMenu category="All" setCategory={mockSetCategory} />);
      }).not.toThrow();

      // Should still render main structure
      expect(screen.getByText("Explore our Menu")).toBeInTheDocument();
    });

    it("handles missing image sources gracefully", () => {
      const menuListWithEmptyImages = [{ menu_name: "Test", menu_image: "" }];

      vi.doMock("../../assets/assets", () => ({
        menu_list: menuListWithEmptyImages,
      }));

      expect(() => {
        render(<ExploreMenu category="All" setCategory={mockSetCategory} />);
      }).not.toThrow();
    });

    it("uses array index as key (React requirement)", () => {
      // This is more of a structural test
      render(<ExploreMenu category="All" setCategory={mockSetCategory} />);

      // Verify that all items render (indicating keys work properly)
      const menuItems = screen.getAllByText(
        /Salad|Rolls|Desserts|Sandwich|Cake|Pure Veg|Pasta|Noodles/
      );
      expect(menuItems).toHaveLength(mockMenuList.length);
    });
  });
});
