import { z } from "zod";
import { getServerConfig } from "../config.server";

const inputSchema = z.object({ name: z.string().min(1) });

export async function getGreeting(input: { name: string }) {
  "use server";
  const data = inputSchema.parse(input);
  const config = getServerConfig();
  return {
    greeting: `Hello, ${data.name}!`,
    mode: config.nodeEnv ?? "unknown",
  };
}
