import { z } from "zod";
export const AgentSpec = z.object({
  agent_name: z.string().min(1),
  persona: z.string(),
  first_message: z.string().min(1),
  system_prompt: z.string().min(20),
  language: z.enum(["en", "hi", "ta", "bn", "mr", "te"]).default("en"),
  voice_style: z.string().default("warm, clear"),
  guardrails: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  knowledge_suggestions: z.array(z.string()).default([]),
  test_scenarios: z.array(z.string()).default([]),
});
export type AgentSpec = z.infer<typeof AgentSpec>;
export const DEFAULT_GUARDRAILS = [
  "Never give medical, legal or financial advice.",
  "Never invent prices, policies or availability; say you will check with the team.",
  "Offer a handoff to a human whenever the caller asks or seems frustrated.",
  "Ask for consent before saving any personal data.",
];
export const demoSpec = (desc: string): AgentSpec => ({
  agent_name: "Demo Receptionist",
  persona: "Friendly, concise Hinglish-speaking receptionist.",
  first_message: "Namaste! Main aapki kaise madad kar sakti hoon?",
  system_prompt: `You are a friendly voice receptionist. Business brief: ${desc}\nSpeak short sentences. Mirror the caller's language (Hindi, Hinglish or English).`,
  language: "en", voice_style: "warm", guardrails: DEFAULT_GUARDRAILS,
  tools: [], knowledge_suggestions: [], test_scenarios: [],
});