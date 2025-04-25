import '@vue/runtime-core'
import type { App } from 'vue'

declare module '@tdesign-vue-next/chat' {
  const TDesignChat: {
    install: (app: App) => void;
  }
  export default TDesignChat;

  export const Chat: any;
  export const ChatAction: any;
  export const ChatContent: any;
  export const ChatInput: any;
  export const ChatItem: any;
}