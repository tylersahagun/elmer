import { describe, it, expect, vi } from "vitest";
import {
  sendStreamEvent,
  createStreamEvent,
  createDiscoveryStreamResponse,
  sendProgressEvent,
  sendErrorEvent,
  sendCompletedEvent,
  type DiscoveryStreamEvent,
  type DiscoveryStreamEventType,
} from "../streaming";
import type { DiscoveryResult } from "../types";

describe("createStreamEvent", () => {
  it("creates event with correct type", () => {
    const event = createStreamEvent("connected");
    expect(event.type).toBe("connected");
  });

  it("creates event with timestamp", () => {
    const before = new Date().toISOString();
    const event = createStreamEvent("progress");
    const after = new Date().toISOString();

    expect(event.timestamp).toBeDefined();
    expect(event.timestamp >= before).toBe(true);
    expect(event.timestamp <= after).toBe(true);
  });

  it("includes data when provided", () => {
    const event = createStreamEvent("progress", {
      foldersScanned: 5,
      totalFolders: 10,
      currentFolder: "initiatives",
    });

    expect(event.data.foldersScanned).toBe(5);
    expect(event.data.totalFolders).toBe(10);
    expect(event.data.currentFolder).toBe("initiatives");
  });

  it("creates event with empty data by default", () => {
    const event = createStreamEvent("connected");
    expect(event.data).toEqual({});
  });

  it("supports all event types", () => {
    const eventTypes: DiscoveryStreamEventType[] = [
      "connected",
      "scanning_started",
      "folder_found",
      "initiative_found",
      "context_path_found",
      "agent_found",
      "progress",
      "completed",
      "error",
      "cancelled",
    ];

    eventTypes.forEach((type) => {
      const event = createStreamEvent(type);
      expect(event.type).toBe(type);
    });
  });
});

describe("sendStreamEvent", () => {
  it("encodes event correctly as SSE format", () => {
    const enqueuedData: Uint8Array[] = [];
    const mockController = {
      enqueue: vi.fn((data: Uint8Array) => {
        enqueuedData.push(data);
      }),
    } as unknown as ReadableStreamDefaultController;

    const event = createStreamEvent("connected", { workspaceId: "ws-123" });
    const result = sendStreamEvent(mockController, event);

    expect(result).toBe(true);
    expect(mockController.enqueue).toHaveBeenCalledTimes(1);

    // Decode and verify format
    const decoded = new TextDecoder().decode(enqueuedData[0]);
    expect(decoded.startsWith("data: ")).toBe(true);
    expect(decoded.endsWith("\n\n")).toBe(true);

    // Verify JSON content
    const jsonStr = decoded.slice(6, -2); // Remove "data: " prefix and "\n\n" suffix
    const parsed = JSON.parse(jsonStr) as DiscoveryStreamEvent;
    expect(parsed.type).toBe("connected");
    expect(parsed.data.workspaceId).toBe("ws-123");
  });

  it("handles various event types correctly", () => {
    const enqueuedData: Uint8Array[] = [];
    const mockController = {
      enqueue: vi.fn((data: Uint8Array) => {
        enqueuedData.push(data);
      }),
    } as unknown as ReadableStreamDefaultController;

    // Progress event
    const progressEvent = createStreamEvent("progress", {
      foldersScanned: 5,
      totalFolders: 10,
      currentFolder: "docs",
      elapsedMs: 1500,
    });
    sendStreamEvent(mockController, progressEvent);

    const decoded = new TextDecoder().decode(enqueuedData[0]);
    const parsed = JSON.parse(decoded.slice(6, -2)) as DiscoveryStreamEvent;
    expect(parsed.type).toBe("progress");
    expect(parsed.data.foldersScanned).toBe(5);
    expect(parsed.data.elapsedMs).toBe(1500);
  });

  it("returns false when controller is closed", () => {
    const mockController = {
      enqueue: vi.fn(() => {
        throw new Error("Controller is closed");
      }),
    } as unknown as ReadableStreamDefaultController;

    const event = createStreamEvent("connected");
    const result = sendStreamEvent(mockController, event);

    expect(result).toBe(false);
  });

  it("gracefully handles errors without throwing", () => {
    const mockController = {
      enqueue: vi.fn(() => {
        throw new TypeError("Cannot enqueue to a closed stream");
      }),
    } as unknown as ReadableStreamDefaultController;

    const event = createStreamEvent("error", { error: "Test error" });

    // Should not throw
    expect(() => sendStreamEvent(mockController, event)).not.toThrow();
    expect(sendStreamEvent(mockController, event)).toBe(false);
  });
});

describe("createDiscoveryStreamResponse", () => {
  it("returns Response with correct Content-Type header", () => {
    const mockStream = new ReadableStream();
    const response = createDiscoveryStreamResponse(mockStream);

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("returns Response with Cache-Control: no-cache", () => {
    const mockStream = new ReadableStream();
    const response = createDiscoveryStreamResponse(mockStream);

    expect(response.headers.get("Cache-Control")).toBe("no-cache");
  });

  it("returns Response with Connection: keep-alive", () => {
    const mockStream = new ReadableStream();
    const response = createDiscoveryStreamResponse(mockStream);

    expect(response.headers.get("Connection")).toBe("keep-alive");
  });

  it("returns a Response object", () => {
    const mockStream = new ReadableStream();
    const response = createDiscoveryStreamResponse(mockStream);

    expect(response).toBeInstanceOf(Response);
  });

  it("wraps the provided stream", () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("test"));
        controller.close();
      },
    });

    const response = createDiscoveryStreamResponse(mockStream);
    expect(response.body).toBe(mockStream);
  });
});

describe("sendProgressEvent", () => {
  it("sends progress event with correct data", () => {
    const enqueuedData: Uint8Array[] = [];
    const mockController = {
      enqueue: vi.fn((data: Uint8Array) => {
        enqueuedData.push(data);
      }),
    } as unknown as ReadableStreamDefaultController;

    const result = sendProgressEvent(mockController, {
      foldersScanned: 3,
      totalFolders: 10,
      currentFolder: "initiatives",
      elapsedMs: 2000,
      estimatedRemainingMs: 5000,
    });

    expect(result).toBe(true);

    const decoded = new TextDecoder().decode(enqueuedData[0]);
    const parsed = JSON.parse(decoded.slice(6, -2)) as DiscoveryStreamEvent;

    expect(parsed.type).toBe("progress");
    expect(parsed.data.foldersScanned).toBe(3);
    expect(parsed.data.totalFolders).toBe(10);
    expect(parsed.data.currentFolder).toBe("initiatives");
    expect(parsed.data.elapsedMs).toBe(2000);
    expect(parsed.data.estimatedRemainingMs).toBe(5000);
  });

  it("handles null currentFolder", () => {
    const enqueuedData: Uint8Array[] = [];
    const mockController = {
      enqueue: vi.fn((data: Uint8Array) => {
        enqueuedData.push(data);
      }),
    } as unknown as ReadableStreamDefaultController;

    sendProgressEvent(mockController, {
      foldersScanned: 5,
      totalFolders: 5,
      currentFolder: null,
      elapsedMs: 3000,
    });

    const decoded = new TextDecoder().decode(enqueuedData[0]);
    const parsed = JSON.parse(decoded.slice(6, -2)) as DiscoveryStreamEvent;

    expect(parsed.data.currentFolder).toBeUndefined();
  });

  it("handles null estimatedRemainingMs", () => {
    const enqueuedData: Uint8Array[] = [];
    const mockController = {
      enqueue: vi.fn((data: Uint8Array) => {
        enqueuedData.push(data);
      }),
    } as unknown as ReadableStreamDefaultController;

    sendProgressEvent(mockController, {
      foldersScanned: 5,
      totalFolders: 5,
      currentFolder: "done",
      elapsedMs: 3000,
      estimatedRemainingMs: null,
    });

    const decoded = new TextDecoder().decode(enqueuedData[0]);
    const parsed = JSON.parse(decoded.slice(6, -2)) as DiscoveryStreamEvent;

    expect(parsed.data.estimatedRemainingMs).toBeUndefined();
  });
});

describe("sendErrorEvent", () => {
  it("sends error event with message", () => {
    const enqueuedData: Uint8Array[] = [];
    const mockController = {
      enqueue: vi.fn((data: Uint8Array) => {
        enqueuedData.push(data);
      }),
    } as unknown as ReadableStreamDefaultController;

    const result = sendErrorEvent(mockController, "Something went wrong");

    expect(result).toBe(true);

    const decoded = new TextDecoder().decode(enqueuedData[0]);
    const parsed = JSON.parse(decoded.slice(6, -2)) as DiscoveryStreamEvent;

    expect(parsed.type).toBe("error");
    expect(parsed.data.error).toBe("Something went wrong");
  });
});

describe("sendCompletedEvent", () => {
  it("sends completed event with result and elapsed time", () => {
    const enqueuedData: Uint8Array[] = [];
    const mockController = {
      enqueue: vi.fn((data: Uint8Array) => {
        enqueuedData.push(data);
      }),
    } as unknown as ReadableStreamDefaultController;

    const mockResult: DiscoveryResult = {
      repoOwner: "owner",
      repoName: "repo",
      branch: "main",
      scannedAt: "2026-01-27T00:00:00Z",
      initiatives: [],
      contextPaths: [],
      agents: [],
      stats: {
        foldersScanned: 10,
        initiativesFound: 2,
        contextPathsFound: 3,
        agentsFound: 1,
        prototypesFound: 0,
        metaJsonParsed: 2,
        metaJsonErrors: 0,
      },
      warnings: [],
    };

    const result = sendCompletedEvent(mockController, mockResult, 5000);

    expect(result).toBe(true);

    const decoded = new TextDecoder().decode(enqueuedData[0]);
    const parsed = JSON.parse(decoded.slice(6, -2)) as DiscoveryStreamEvent;

    expect(parsed.type).toBe("completed");
    expect(parsed.data.result).toEqual(mockResult);
    expect(parsed.data.elapsedMs).toBe(5000);
  });
});

describe("DiscoveryStreamEvent type", () => {
  it("allows all valid event types", () => {
    const validEvents: DiscoveryStreamEvent[] = [
      { type: "connected", timestamp: "2026-01-27T00:00:00Z", data: {} },
      { type: "scanning_started", timestamp: "2026-01-27T00:00:00Z", data: {} },
      { type: "folder_found", timestamp: "2026-01-27T00:00:00Z", data: {} },
      { type: "initiative_found", timestamp: "2026-01-27T00:00:00Z", data: {} },
      {
        type: "context_path_found",
        timestamp: "2026-01-27T00:00:00Z",
        data: {},
      },
      { type: "agent_found", timestamp: "2026-01-27T00:00:00Z", data: {} },
      { type: "progress", timestamp: "2026-01-27T00:00:00Z", data: {} },
      { type: "completed", timestamp: "2026-01-27T00:00:00Z", data: {} },
      { type: "error", timestamp: "2026-01-27T00:00:00Z", data: {} },
      { type: "cancelled", timestamp: "2026-01-27T00:00:00Z", data: {} },
    ];

    // This test verifies types compile - if it compiles, types are correct
    expect(validEvents.length).toBe(10);
  });

  it("allows optional data fields", () => {
    const event: DiscoveryStreamEvent = {
      type: "progress",
      timestamp: "2026-01-27T00:00:00Z",
      data: {
        foldersScanned: 5,
        // Other fields are optional
      },
    };

    expect(event.data.foldersScanned).toBe(5);
    expect(event.data.totalFolders).toBeUndefined();
    expect(event.data.currentFolder).toBeUndefined();
  });
});
