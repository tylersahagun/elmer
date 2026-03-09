import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createServer } from "node:net";
import { evaluateLoginRouteHealth } from "../login-health";

const SERVER_START_TIMEOUT_MS = 240_000;
const SERVER_POLL_INTERVAL_MS = 500;
const repoRoot = process.cwd();

async function getAvailablePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Failed to allocate a test port"));
        return;
      }

      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
    server.on("error", reject);
  });
}

async function waitForServer(url: string, logs: string[]) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < SERVER_START_TIMEOUT_MS) {
    try {
      const response = await fetch(url);
      if (response.status >= 200) {
        return;
      }
    } catch {
      // Keep polling until the dev server is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, SERVER_POLL_INTERVAL_MS));
  }

  throw new Error(`Timed out waiting for ${url}\n${logs.join("")}`);
}

async function stopServer(serverProcess: ChildProcessWithoutNullStreams) {
  if (serverProcess.exitCode !== null || serverProcess.killed) {
    serverProcess.stdout.destroy();
    serverProcess.stderr.destroy();
    return;
  }

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };

    const forceKillTimer = setTimeout(() => {
      serverProcess.kill("SIGKILL");
    }, 5_000);

    const handleExit = () => {
      clearTimeout(forceKillTimer);
      serverProcess.stdout.destroy();
      serverProcess.stderr.destroy();
      finish();
    };

    serverProcess.once("exit", handleExit);
    serverProcess.once("close", handleExit);

    serverProcess.kill("SIGINT");
  });
}

describe.sequential("runtime auth routes without Convex client config", () => {
  let serverProcess: ChildProcessWithoutNullStreams | null = null;
  let baseUrl = "";
  const logs: string[] = [];

  beforeAll(async () => {
    const port = await getAvailablePort();
    baseUrl = `http://127.0.0.1:${port}`;

    serverProcess = spawn(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["run", "dev", "--", "--port", String(port)],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          NEXT_PUBLIC_CONVEX_URL: "",
          PORT: String(port),
          NEXT_TELEMETRY_DISABLED: "1",
        },
        stdio: "pipe",
      },
    );

    serverProcess.stdout.on("data", (chunk) => {
      logs.push(chunk.toString());
    });
    serverProcess.stderr.on("data", (chunk) => {
      logs.push(chunk.toString());
    });

    await waitForServer(`${baseUrl}/login`, logs);
  }, SERVER_START_TIMEOUT_MS);

  afterAll(async () => {
    if (!serverProcess) {
      return;
    }

    await stopServer(serverProcess);
  });

  it(
    "serves /login and /signup with Clerk bootstrap markers",
    async () => {
      const loginResponse = await fetch(`${baseUrl}/login`);
      const loginBody = await loginResponse.text();

      expect(
        evaluateLoginRouteHealth({
          status: loginResponse.status,
          contentType: loginResponse.headers.get("content-type"),
          body: loginBody,
        }),
      ).toEqual({
        ok: true,
        detail: "status 200 and Clerk bootstrap markers present",
      });

      const signupResponse = await fetch(`${baseUrl}/signup`);
      expect(signupResponse.status).toBe(200);
      expect(signupResponse.headers.get("content-type")).toContain("text/html");
    },
    SERVER_START_TIMEOUT_MS,
  );

  it(
    "fails closed on app routes with a deterministic runtime configuration error",
    async () => {
      const response = await fetch(baseUrl);
      const body = await response.text();

      expect(response.status).toBe(200);
      expect(body).toContain("Runtime configuration error");
      expect(body).toContain("missing NEXT_PUBLIC_CONVEX_URL");
      expect(body).not.toContain("Internal Server Error");
    },
    SERVER_START_TIMEOUT_MS,
  );
});
