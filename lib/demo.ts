import type { AgentSpec } from "./schema";
export function applyRefine(spec: AgentSpec, msg: string): { spec: AgentSpec; note: string } {
  const m = msg.toLowerCase();
  const s: AgentSpec = { ...spec, guardrails: [...spec.guardrails] };
  const notes: string[] = [];
  if (/friend|warm|casual/.test(m)) {
    s.persona = "Very warm, friendly and casual.";
    s.system_prompt += "\nTone: extra friendly and warm; use the caller's name once known.";
    notes.push("Made the tone friendlier");
  }
  if (/hindi|hinglish/.test(m)) {
    s.language = "hi";
    s.first_message = "Namaste! Main aapki kya madad kar sakti hoon?";
    s.system_prompt += "\nSpeak mainly in Hindi/Hinglish; switch to English if the caller does.";
    notes.push("Switched to Hindi/Hinglish");
  }
  if (/pric|cost|fee|rate/.test(m) && /never|don't|dont|not|no /.test(m)) {
    s.guardrails.push("Never discuss pricing; offer a callback from the team instead.");
    notes.push("Added a no-pricing guardrail");
  }
  if (/cancel/.test(m)) {
    s.system_prompt += "\nCancellations: follow the policy in the knowledge base. If none is given, say the team will confirm.";
    notes.push("Added a cancellation rule");
  }
  if (notes.length === 0) {
    s.system_prompt += `\nExtra instruction from owner: ${msg}`;
    notes.push("Added your instruction to the prompt");
  }
  return { spec: s, note: notes.join(". ") + "." };
}