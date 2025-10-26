import { create } from 'zustand';

interface ChatState {
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;

  canSend: boolean;
  setCanSend: (value: boolean) => void;

  isMessageError: boolean;
  setIsMessageError: (isMessageError: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isTyping: false,
  setIsTyping: (value) => set({ isTyping: value }),

  canSend: true,
  setCanSend: (value) => set({ canSend: value }),

  isMessageError: false,
  setIsMessageError: (value) => set({ isMessageError: value }),
}));
