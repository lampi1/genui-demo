"use client";

import { createContext, useContext } from "react";

/**
 * Actions generated components can trigger back into the conversation —
 * the round trip that makes forms generative: the visitor's answers become
 * the next user message and the model tailors what it renders next.
 */
export const GenUIActionsContext = createContext<{
  /** `hidden` sends the text to the model without rendering it in the chat. */
  submit: (text: string, options?: { hidden?: boolean }) => void;
  regenerate: () => void;
} | null>(null);

export function useGenUIActions() {
  return useContext(GenUIActionsContext);
}
