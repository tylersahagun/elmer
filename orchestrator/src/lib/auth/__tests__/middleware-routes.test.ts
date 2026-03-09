import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isPublicRoute } from "@/middleware";

describe("middleware public routes", () => {
  it("allows prototype demo links without authentication", () => {
    const request = new NextRequest("http://localhost:3000/prototype/project-babar");

    expect(isPublicRoute(request)).toBe(true);
  });

  it("keeps workspace routes protected", () => {
    const request = new NextRequest("http://localhost:3000/workspace/demo-id");

    expect(isPublicRoute(request)).toBe(false);
  });
});
