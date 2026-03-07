import { describe } from "vitest";

export const describeIfDatabase = process.env.DATABASE_URL
  ? describe
  : describe.skip;
