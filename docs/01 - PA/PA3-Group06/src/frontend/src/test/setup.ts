import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Automatically clean up React Testing Library trees after each test
afterEach(() => {
  cleanup();
});
