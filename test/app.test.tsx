import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "~/App";

describe("App", () => {
  it("should render skeleton", () => {
    const { getByText } = render(<App />);
    expect(getByText("Imprint")).toBeInTheDocument();
  });
});
