<template>
  <div class="td-chat-demo-container">
    <h2>TD Chat for AI 示例</h2>
    <t-chat class="chat-container">
      <t-chat-item
        avatar="https://tdesign.gtimg.com/site/avatar.jpg"
        name="助手"
        time="10:23"
        placement="left"
      >
        <t-chat-content>
          <p>您好！我是您的AI助手，有什么可以帮助您的吗？</p>
        </t-chat-content>
      </t-chat-item>
      
      <t-chat-item
        avatar="https://tdesign.gtimg.com/site/avatar-user.jpg"
        name="用户"
        time="10:25"
        placement="right"
      >
        <t-chat-content>
          <p>你好！请介绍一下你自己。</p>
        </t-chat-content>
      </t-chat-item>
      
      <t-chat-item
        avatar="https://tdesign.gtimg.com/site/avatar.jpg"
        name="助手"
        time="10:26"
        placement="left"
      >
        <t-chat-content>
          <p>我是基于人工智能技术开发的助手，可以回答问题、提供信息和协助完成各种任务。我的知识库涵盖了广泛的领域，包括科学、历史、文化、技术等。我会不断学习和更新，以提供更准确和有用的回答。</p>
        </t-chat-content>
        <t-chat-action>
          <t-button variant="text" size="small">复制</t-button>
          <t-button variant="text" size="small">点赞</t-button>
        </t-chat-action>
      </t-chat-item>
      
      <t-chat-input
        placeholder="请输入消息..."
        @send="onSend"
      />
    </t-chat>
  </div>
</template>

<script setup lang="ts">
const onSend = (value: string) => {
  console.log('发送消息:', value);
  // 这里可以添加发送消息的逻辑
};
</script>

<style scoped>
.td-chat-demo-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.chat-container {
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  height: 600px;
  overflow: hidden;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}
</style>