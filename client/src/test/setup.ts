import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { CartServer, LoginPopupServer } from "../mocks/server";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mock static assets
vi.mock("/src/assets/store/googleplay.png", () => ({
  default: "mocked-assets/store/googleplay.png",
}));

/* // Or use a more general approach
vi.mock("*.png", () => ({
  default: "mocked-assets/test-image.png",
})); */

// Establish API mocking before all tests
beforeAll(() => CartServer.listen());
// Reset any request handlers that we may add during the tests
afterEach(() => CartServer.resetHandlers());
// Clean up after the tests are finished
afterAll(() => CartServer.close());

// Establish API mocking before all tests
beforeAll(() => LoginPopupServer.listen());
// Reset any request handlers that we may add during the tests
afterEach(() => LoginPopupServer.resetHandlers());
// Clean up after the tests are finished
afterAll(() => LoginPopupServer.close());
