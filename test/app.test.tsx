import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "~/App";

describe("App", () => {
  it("it should be render", () => {
    render(<App />);
    expect(screen.getByText("Imprint")).toBeInTheDocument();
  });
});
