import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "~/App";

describe("Home", () => {
  it("should render Home with data", async () => {
    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText("Application Services")).toBeInTheDocument();
    }, { timeout: 6000 });
  }, 6000);
});
