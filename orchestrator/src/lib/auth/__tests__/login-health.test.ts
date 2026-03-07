import { describe, expect, it } from "vitest";
import { evaluateLoginRouteHealth } from "../login-health";

const HEALTHY_LOGIN_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <link rel="preload" href="https://clerk.example/npm/@clerk/ui@1/dist/ui.browser.js" as="script" />
  </head>
  <body>
    <script src="https://clerk.example/npm/@clerk/clerk-js@6/dist/clerk.browser.js" data-clerk-js-script="true" data-clerk-publishable-key="pk_test_example"></script>
  </body>
</html>`;

describe("evaluateLoginRouteHealth", () => {
  it("passes for healthy Clerk login HTML", () => {
    expect(
      evaluateLoginRouteHealth({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: HEALTHY_LOGIN_HTML,
      }),
    ).toEqual({
      ok: true,
      detail: "status 200 and Clerk bootstrap markers present",
    });
  });

  it("fails for non-2xx status codes", () => {
    expect(
      evaluateLoginRouteHealth({
        status: 500,
        contentType: "text/html; charset=utf-8",
        body: "<html><body>Something broke</body></html>",
      }),
    ).toEqual({
      ok: false,
      detail: "route returned status 500",
    });
  });

  it("fails for framework error HTML", () => {
    expect(
      evaluateLoginRouteHealth({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: "<html><body>Internal Server Error</body></html>",
      }),
    ).toEqual({
      ok: false,
      detail: "response body contains framework error marker: Internal Server Error",
    });
  });

  it("fails when Clerk bootstrap markers are missing", () => {
    expect(
      evaluateLoginRouteHealth({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: "<html><body><h1>Sign in</h1></body></html>",
      }),
    ).toEqual({
      ok: false,
      detail: "response body is missing Clerk script bootstrap markers",
    });
  });

  it("fails when Clerk configuration markers are missing", () => {
    expect(
      evaluateLoginRouteHealth({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body:
          '<html><body><script src="https://clerk.example/npm/@clerk/clerk-js@6/dist/clerk.browser.js" data-clerk-js-script="true"></script></body></html>',
      }),
    ).toEqual({
      ok: false,
      detail: "response body is missing Clerk configuration markers",
    });
  });

  it("fails when the response is not HTML", () => {
    expect(
      evaluateLoginRouteHealth({
        status: 200,
        contentType: "application/json",
        body: '{"ok":true}',
      }),
    ).toEqual({
      ok: false,
      detail: "expected text/html response, received application/json",
    });
  });
});
