import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { vi } from "vitest";

const mutationObserverMock = vi
  .fn()
  .mockImplementation(() => {
    return {
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };
  });

global.MutationObserver = mutationObserverMock;
