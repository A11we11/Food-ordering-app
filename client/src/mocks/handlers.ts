// src/mocks/handlers.js
import { http, HttpResponse } from "msw";

export const CartHandlers = [
  // Mock cart data endpoint
  http.get("/api/cart", () => {
    return HttpResponse.json({
      items: {
        "1": 2,
        "2": 1,
        "3": 0,
      },
      total: 34.97,
    });
  }),

  // Mock remove from cart endpoint
  http.post("/api/cart/remove", async ({ request }) => {
    const { itemId } = (await request.json()) as { itemId: string };
    return HttpResponse.json({
      success: true,
      message: `Item ${itemId} removed from cart`,
    });
  }),

  // Mock promo code validation endpoint
  http.post("/api/promo/validate", async ({ request }) => {
    const { code } = (await request.json()) as { code: string };
    if (code === "SAVE20") {
      return HttpResponse.json({
        valid: true,
        discount: 0.2,
        message: "20% discount applied!",
      });
    }
    return HttpResponse.json({
      valid: false,
      message: "Invalid promo code",
    });
  }),

  // Mock checkout endpoint
  http.post("/api/checkout", async ({ request }) => {
    const orderData = (await request.json()) as { total: number };
    return HttpResponse.json({
      success: true,
      orderId: "ORD-12345",
      total: orderData.total,
    });
  }),

  // Mock food list endpoint
  http.get("/api/food", () => {
    return HttpResponse.json({
      foods: [
        {
          _id: "1",
          name: "Pizza Margherita",
          price: 12.99,
          image: "pizza.jpg",
        },
        {
          _id: "2",
          name: "Burger Deluxe",
          price: 8.99,
          image: "burger.jpg",
        },
      ],
    });
  }),
];

export const LoginPopupHandlers = [
  // Login endpoint
  http.post("http://localhost:3000/api/user/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json({
        success: true,
        token: "mock-token-123",
      });
    }

    return HttpResponse.json({
      success: false,
      message: "Invalid credentials",
    });
  }),

  // Register endpoint
  http.post("http://localhost:3000/api/user/register", async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      email: string;
      password: string;
    };

    if (body.email === "existing@example.com") {
      return HttpResponse.json({
        success: false,
        message: "User already exists",
      });
    }

    return HttpResponse.json({
      success: true,
      token: "new-user-token-456",
    });
  }),
];
