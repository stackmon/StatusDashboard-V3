import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "~/App";

describe("NewEvent", () => {
  const url = new URL('http://otc.com/NewEvent');

  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      href: url.href,
      hostname: url.hostname,
      pathname: url.pathname,
    },
    writable: true,
  });

  it("should not render without Auth", async () => {
    const { getByRole } = render(<App />);
    const mainElement = getByRole('main');

    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveTextContent('Authenticating...');
  }, 6000);
});
