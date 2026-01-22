/**
 * Authentication Flow Tests
 * 
 * Tests the authentication system:
 * - Password hashing with bcryptjs
 * - Signup validation
 * - Login flows
 * - Session handling
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

// Test fixtures
const TEST_USER_EMAIL = `test_${nanoid(8)}@example.com`;
const TEST_USER_PASSWORD = "SecurePassword123!";

describe("Authentication System Tests", () => {
  describe("Password Hashing", () => {
    it("should hash passwords using bcryptjs", async () => {
      const password = "MySecurePassword123";
      const hash = await bcrypt.hash(password, 10);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are ~60 chars
    });

    it("should verify correct password against hash", async () => {
      const password = "MySecurePassword123";
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password against hash", async () => {
      const password = "MySecurePassword123";
      const wrongPassword = "WrongPassword456";
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should produce different hashes for same password", async () => {
      const password = "MySecurePassword123";
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      expect(hash1).not.toBe(hash2); // Salt makes them different
      
      // But both should verify
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  describe("User Creation", () => {
    afterAll(async () => {
      // Cleanup test user
      await db.delete(users).where(eq(users.email, TEST_USER_EMAIL));
    });

    it("should create a user with hashed password", async () => {
      const passwordHash = await bcrypt.hash(TEST_USER_PASSWORD, 10);

      await db.insert(users).values({
        id: `user_${nanoid(8)}`,
        email: TEST_USER_EMAIL,
        name: "Test User",
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await db.query.users.findFirst({
        where: eq(users.email, TEST_USER_EMAIL),
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe(TEST_USER_EMAIL);
      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe(TEST_USER_PASSWORD);
    });

    it("should verify stored password hash", async () => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, TEST_USER_EMAIL),
      });

      expect(user?.passwordHash).toBeDefined();
      const isValid = await bcrypt.compare(TEST_USER_PASSWORD, user!.passwordHash!);
      expect(isValid).toBe(true);
    });
  });

  describe("Signup Validation", () => {
    const SIGNUP_TEST_EMAIL = `signup_${nanoid(8)}@example.com`;

    afterAll(async () => {
      await db.delete(users).where(eq(users.email, SIGNUP_TEST_EMAIL));
    });

    it("should reject signup without email", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "ValidPassword123",
          name: "Test User",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should reject signup without password", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: SIGNUP_TEST_EMAIL,
          name: "Test User",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should reject signup with short password", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: SIGNUP_TEST_EMAIL,
          password: "short",
          name: "Test User",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("8 characters");
    });

    it("should accept valid signup", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: SIGNUP_TEST_EMAIL,
          password: "ValidPassword123",
          name: "Signup Test User",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(SIGNUP_TEST_EMAIL);
    });

    it("should reject duplicate email", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: SIGNUP_TEST_EMAIL,
          password: "AnotherPassword123",
          name: "Duplicate User",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("already exists");
    });
  });

  describe("Login Validation", () => {
    const LOGIN_TEST_EMAIL = `login_${nanoid(8)}@example.com`;
    const LOGIN_TEST_PASSWORD = "LoginTestPassword123";

    beforeAll(async () => {
      // Create test user for login tests
      const passwordHash = await bcrypt.hash(LOGIN_TEST_PASSWORD, 10);
      await db.insert(users).values({
        id: `user_${nanoid(8)}`,
        email: LOGIN_TEST_EMAIL,
        name: "Login Test User",
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    afterAll(async () => {
      await db.delete(users).where(eq(users.email, LOGIN_TEST_EMAIL));
    });

    it("should validate credentials correctly", async () => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, LOGIN_TEST_EMAIL),
      });

      expect(user).toBeDefined();
      const isValid = await bcrypt.compare(LOGIN_TEST_PASSWORD, user!.passwordHash!);
      expect(isValid).toBe(true);
    });

    it("should reject invalid password", async () => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, LOGIN_TEST_EMAIL),
      });

      expect(user).toBeDefined();
      const isValid = await bcrypt.compare("WrongPassword", user!.passwordHash!);
      expect(isValid).toBe(false);
    });

    it("should reject login with non-existent email", async () => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, "nonexistent@example.com"),
      });

      expect(user).toBeUndefined();
    });
  });
});
