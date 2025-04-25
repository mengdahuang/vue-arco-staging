<template>
  <div class="td-chat-page">
    <h1>TDesign Chat for AI 组件示例</h1>
    <p class="description">这是一个集成了 @tdesign-vue-next/chat 组件的示例页面，展示了基本的聊天界面功能。</p>
    
    <div class="demo-container">
      <TDChatDemo />
    </div>
    
    <div class="usage-guide">
      <h2>使用指南</h2>
      <div class="code-block">
        <pre><code>// 全局注册
import TDesignChat from '@tdesign-vue-next/chat';
app.use(TDesignChat);

// 按需引入
import {
  Chat as TChat,
  ChatAction as TChatAction,
  ChatContent as TChatContent,
  ChatInput as TChatInput,
  ChatItem as TChatItem
} from '@tdesign-vue-next/chat';</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TDChatDemo from '../components/TDChatDemo.vue';
</script>

<style scoped>
.td-chat-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 16px;
  font-size: 28px;
}

.description {
  color: #666;
  margin-bottom: 32px;
}

.demo-container {
  margin-bottom: 40px;
}

.usage-guide {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.usage-guide h2 {
  margin-bottom: 16px;
  font-size: 20px;
}

.code-block {
  background-color: #282c34;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
}

.code-block pre {
  margin: 0;
}

.code-block code {
  color: #abb2bf;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>