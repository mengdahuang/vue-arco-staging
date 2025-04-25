<template>
  <div class="ai-chat-page">
    <h1>AI智能对话助手</h1>
    <p class="description">基于TDesign Chat组件实现的智能对话界面，支持多轮对话和智能回复。</p>
    
    <div class="chat-container">
      <div class="chat-box">
        <t-chat
          ref="chatRef"
          clear-history
          :reverse="true"
          animation="moving"
          style="height: 600px"
          @scroll="handleChatScroll"
          @clear="clearConfirm"
        >
          <template v-for="(item, index) in chatList" :key="index">
            <t-chat-item
              :avatar="item.avatar"
              :name="item.name"
              :role="item.role"
              :datetime="item.datetime"
              :text-loading="index === 0 && loading"
              :content="item.content"
              :variant="item.role === 'assistant' ? 'outline' : 'base'"
            >
              <template #content>
                <t-chat-reasoning
                  v-if="item.reasoning?.length > 0"
                  expand-icon-placement="right"
                  @expand-change="handleExpandChange($event, { index })"
                >
                  <template #header>
                    <div v-if="index === 0 && isStreamLoad" style="display: flex; align-items: center">
                      <t-chat-loading text="思考中..." indicator />
                    </div>
                    <div v-else style="display: flex; align-items: center">
                      <CheckCircleIcon style="color: var(--td-success-color-5); font-size: 20px; margin-right: 8px" />
                      <span>已深度思考</span>
                    </div>
                  </template>
                  <t-chat-content v-if="item.reasoning.length > 0" :content="item.reasoning" />
                </t-chat-reasoning>
                <t-chat-content v-if="item.content.length > 0" :content="item.content" />
              </template>
              
              <template #actions>
                <t-chat-action
                  v-if="item.role === 'assistant'"
                  :content="item.content"
                  :operation-btn="isMobile ? ['copy', 'good'] : ['good', 'bad', 'replay', 'copy']"
                  @operation="handleOperation"
                />
              </template>
            </t-chat-item>
          </template>
          
          <template #footer>
            <t-chat-input :stop-disabled="isStreamLoad" @send="inputEnter" @stop="onStop">
              <template #submitButton>
                <t-button theme="primary" :icon="isMobile ? 'send' : undefined">
                  {{ isMobile ? '' : '发送' }}
                </t-button>
              </template>
            </t-chat-input>
          </template>
        </t-chat>
        <t-button v-show="isShowToBottom" variant="text" class="bottomBtn" @click="backBottom">
          <div class="to-bottom">
            <ArrowDownIcon />
          </div>
        </t-button>
      </div>
    </div>
    
    <div class="features-section">
      <h2>功能特点</h2>
      <t-space direction="vertical" class="features-list">
        <t-alert status="info" message="支持多轮对话，AI能够记住上下文" />
        <t-alert status="success" message="展示AI思考过程，增强透明度" />
        <t-alert status="warning" message="支持流式加载内容与思考过程" />
      </t-space>
    </div>
  </div>
</template>

<script setup lang="jsx">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { ArrowDownIcon, CheckCircleIcon, SendIcon } from 'tdesign-icons-vue-next';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 配置Markdown解析器
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-'
});

// 取消流式加载的控制器
const fetchCancel = ref(null);
// 加载状态
const loading = ref(false);
// 流式数据加载中
const isStreamLoad = ref(false);

// 聊天组件引用
const chatRef = ref(null);
// 是否显示回到底部按钮
const isShowToBottom = ref(false);

// 响应式设计 - 是否是移动设备
const isMobile = ref(window.innerWidth <= 768);

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 处理展开/收起事件
const handleExpandChange = (expanded, { index }) => {
  console.log('思考过程展开状态变化:', expanded, '索引:', index);
};

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', handleResize);
  
  // 初始滚动到底部
  setTimeout(() => {
    backBottom();
  }, 200);
});

// 移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// 滚动到底部
const backBottom = () => {
  chatRef.value?.scrollToBottom({
    behavior: 'smooth'
  });
};

// 是否显示回到底部按钮
const handleChatScroll = function ({ e }) {
  const scrollTop = e.target.scrollTop;
  isShowToBottom.value = scrollTop < 0;
};

// 清空消息
const clearConfirm = function () {
  chatList.value = [
    {
      avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
      name: 'AI助手',
      datetime: formatTime(new Date()),
      content: '您好！我是您的AI助手，有什么可以帮助您的吗？',
      role: 'assistant',
      reasoning: '',
    }
  ];
  
  // 滚动到底部
  setTimeout(() => {
    backBottom();
  }, 100);
};

// 处理操作按钮
const handleOperation = function (type, options) {
  console.log('handleOperation', type, options);
  
  if (type === 'copy') {
    copyMessage(options.content);
  } else if (type === 'replay') {
    regenerateLastMessage();
  } else if (type === 'good') {
    MessagePlugin.success('感谢您的反馈！');
  } else if (type === 'bad') {
    MessagePlugin.info('感谢您的反馈，我们会继续改进');
  }
};

// 复制消息
function copyMessage(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      MessagePlugin.success('复制成功');
    })
    .catch(() => {
      MessagePlugin.error('复制失败，请手动复制');
    });
}

// 重新生成最后一条消息
function regenerateLastMessage() {
  const assistantIndex = chatList.value.findIndex(item => item.role === 'assistant');
  if (assistantIndex === -1) return;
  
  // 找到该AI消息之前的用户消息
  let userMessage = null;
  for (let i = assistantIndex + 1; i < chatList.value.length; i++) {
    if (chatList.value[i].role === 'user') {
      userMessage = chatList.value[i];
      break;
    }
  }
  
  if (!userMessage) return;
  
  // 清空内容并显示思考过程
  chatList.value[assistantIndex].content = '';
  chatList.value[assistantIndex].reasoning = '';
  
  // 处理数据流式响应
  handleData(userMessage.content);
};

// 停止生成
const onStop = function () {
  if (fetchCancel.value) {
    fetchCancel.value.controller.close();
    loading.value = false;
    isStreamLoad.value = false;
  }
};

// 倒序渲染
const chatList = ref([
  {
    avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
    name: 'AI助手',
    datetime: formatTime(new Date()),
    content: '您好！我是您的AI助手，有什么可以帮助您的吗？',
    role: 'assistant',
    reasoning: '',
  }
]);

// 处理输入消息
const inputEnter = function (inputValue) {
  if (isStreamLoad.value) {
    return;
  }
  if (!inputValue) return;
  
  // 添加用户消息 (新消息在数组前面)
  const params = {
    avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
    name: '用户',
    datetime: formatTime(new Date()),
    content: inputValue,
    role: 'user',
    reasoning: '',
  };
  chatList.value.unshift(params);
  
  // 空消息占位
  const params2 = {
    avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
    name: 'AI助手',
    datetime: formatTime(new Date()),
    content: '',
    reasoning: '',
    role: 'assistant',
    duration: 0,
  };
  chatList.value.unshift(params2);
  
  // 流式处理数据
  handleData(inputValue);
};

// 模拟流式响应数据 - 这里使用简单的 MockSSEResponse 类
class MockSSEResponse {
  constructor(data) {
    this.data = data;
    this.controller = new AbortController();
    this.signal = this.controller.signal;
    this.contentChunks = this.splitIntoChunks(data.content, 5);
    this.reasoningChunks = this.splitIntoChunks(data.reasoning, 10);
    this.index = 0;
    this.maxIndex = Math.max(this.contentChunks.length, this.reasoningChunks.length);
  }

  splitIntoChunks(text, chunkSize) {
    if (!text) return [];
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async getResponse() {
    return {
      ok: true,
      body: {
        getReader: () => {
          return {
            read: async () => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  if (this.index >= this.maxIndex || this.signal.aborted) {
                    resolve({ done: true });
                    return;
                  }
                  
                  const contentChunk = this.index < this.contentChunks.length 
                    ? this.contentChunks[this.index] 
                    : '';
                  
                  const reasoningChunk = this.index < this.reasoningChunks.length 
                    ? this.reasoningChunks[this.index] 
                    : '';
                  
                  const chunk = JSON.stringify({
                    delta: {
                      content: contentChunk,
                      reasoning_content: reasoningChunk
                    }
                  });
                  
                  const encoder = new TextEncoder();
                  this.index++;
                  
                  resolve({
                    done: false,
                    value: encoder.encode(chunk)
                  });
                }, 100);
              });
            }
          };
        }
      }
    };
  }
}

// 模拟流式请求
const fetchSSE = async (fetchFn, options) => {
  const response = await fetchFn();
  const { success, fail, complete } = options;
  
  // 如果不 ok 说明有请求错误
  if (!response.ok) {
    complete?.(false, response.statusText);
    fail?.();
    return;
  }
  
  const reader = response?.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  reader.read().then(function processText({ done, value }) {
    if (done) {
      // 正常的返回
      complete?.(true);
      return;
    }
    
    const chunk = decoder.decode(value, { stream: true });
    const jsonData = JSON.parse(chunk);
    success(jsonData);
    reader.read().then(processText);
  });
};

// 处理数据流式响应
const handleData = async (userInput) => {
  loading.value = true;
  isStreamLoad.value = true;
  const lastItem = chatList.value[0];
  
  // 根据用户输入生成响应
  const aiResponse = generateAIResponse(userInput);
  const mockedData = {
    reasoning: aiResponse.reasoning || '',
    content: aiResponse.content || '',
  };
  
  const mockResponse = new MockSSEResponse(mockedData);
  fetchCancel.value = mockResponse;
  
  await fetchSSE(
    () => {
      return mockResponse.getResponse();
    },
    {
      success(result) {
        lastItem.reasoning += result.delta.reasoning_content;
        lastItem.content += result.delta.content;
        
        // 自动滚动到底部
        if (chatRef.value && !isShowToBottom.value) {
          backBottom();
        }
      },
      complete(isOk, msg) {
        if (!isOk) {
          lastItem.role = 'error';
          lastItem.content = msg || '生成回答时出错，请重试';
          lastItem.reasoning = msg || '生成思考过程时出错，请重试';
        }
        
        // 显示用时xx秒
        lastItem.duration = Math.floor(Math.random() * 10) + 5;
        
        // 控制终止按钮
        isStreamLoad.value = false;
        loading.value = false;
      },
    },
  );
};

// 格式化时间
function formatTime(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = date >= today;
  const isYesterday = date >= yesterday && date < today;
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (isToday) {
    return `今天${hours}:${minutes}`;
  } else if (isYesterday) {
    return `昨天${hours}:${minutes}`;
  } else {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  }
}

// 生成AI响应
function generateAIResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('你好') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
    return {
      content: '你好！很高兴为您服务。请问有什么我可以帮助您的吗？',
      reasoning: '用户发送了问候语，我应该友好回应并询问能提供什么帮助。这是建立良好对话氛围的开始。'
    };
  }
  
  if (lowerMessage.includes('介绍') || lowerMessage.includes('你是谁')) {
    return {
      content: '我是基于人工智能技术开发的助手，可以回答问题、提供信息和协助完成各种任务。我的知识库涵盖了广泛的领域，包括科学、历史、文化、技术等。',
      reasoning: '用户询问我的身份或者要求自我介绍，我应该清晰地说明我是一个AI助手，并概述我的主要功能和知识领域，这样用户就能对我的能力有个大致的了解。'
    };
  }
  
  if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
    return {
      content: '不客气！如果您还有其他问题，随时可以问我。',
      reasoning: '用户表达了感谢，我应该礼貌回应并表明我随时可以提供进一步帮助，这样可以保持对话的开放性。'
    };
  }
  
  if (lowerMessage.includes('再见') || lowerMessage.includes('拜拜')) {
    return {
      content: '再见！祝您有愉快的一天。如果有需要，随时可以回来咨询。',
      reasoning: '用户准备结束对话，我应该礼貌地道别并留下一个积极的印象，同时表明我随时欢迎他们返回继续对话。'
    };
  }
  
  if (lowerMessage.includes('牛顿') || lowerMessage.includes('定律') || lowerMessage.includes('参考系')) {
    return {
      content: `牛顿第一定律（惯性定律）**并不适用于所有参考系**，它只在**惯性参考系**中成立。以下是关键点：

---

### **1. 牛顿第一定律的核心**
- **内容**：物体在不受外力（或合力为零）时，将保持静止或匀速直线运动状态。
- **本质**：定义了惯性系的存在——即存在一类参考系，在其中惯性定律成立。`,
      reasoning: `嗯，用户问牛顿第一定律是不是适用于所有参考系。首先，我得先回忆一下牛顿第一定律的内容。牛顿第一定律，也就是惯性定律，说物体在没有外力作用时会保持静止或匀速直线运动。也就是说，保持原来的运动状态。

那问题来了，这个定律是否适用于所有参考系呢？记得以前学过的参考系分惯性系和非惯性系。惯性系里，牛顿定律成立；非惯性系里，可能需要引入惯性力之类的修正。所以牛顿第一定律应该只在惯性参考系中成立，而在非惯性系中不适用，比如加速的电梯或者旋转的参考系，这时候物体会有看似无外力下的加速度，所以必须引入假想的力来解释。`
    };
  }
  
  if (lowerMessage.includes('代码') || lowerMessage.includes('编程') || lowerMessage.includes('javascript')) {
    return {
      content: `让我为您展示一段简单的JavaScript代码示例：

\`\`\`javascript
// 一个简单的函数，用于计算斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  
  return b;
}

// 测试函数
console.log(fibonacci(10)); // 输出: 55
\`\`\`

这是一个优化的斐波那契数列计算函数，使用迭代而非递归，时间复杂度为O(n)。`,
      reasoning: `用户询问了与编程或JavaScript相关的问题。我认为最好提供一个实用的代码示例来回应。

选择斐波那契数列作为示例是因为：
1. 它是编程中的经典问题
2. 可以展示多种实现方式（我选择了迭代而非递归，因为它更高效）
3. 代码简洁易懂

我添加了注释说明代码的功能，并提到了时间复杂度，这对程序员来说是重要的信息。同时使用代码块格式化，使代码易于阅读。`
    };
  }
  
  if (lowerMessage.includes('南极') || lowerMessage.includes('提款机')) {
    return {
      content: '它叫 McMurdo Station ATM，是美国富国银行安装在南极洲最大科学中心麦克默多站的一台自动提款机。',
      reasoning: `用户询问了关于南极的提款机，这是一个有趣的地理知识问题。

我需要提供关于McMurdo Station ATM的准确信息：
1. 这是世界上最南端的ATM
2. 由美国富国银行(Wells Fargo)运营
3. 位于南极洲最大的科研基地麦克默多站(McMurdo Station)
4. 主要服务于在那里工作的科研人员

这个事实展示了现代银行设施如何延伸到地球最偏远的地区，是一个有趣的知识点。`
    };
  }
  
  return {
    content: '我理解您的问题是关于"' + userMessage + '"。这是一个很好的问题，在实际应用中，我会连接到后端AI服务来提供准确的回答。现在是演示模式，所以我只能提供这个通用回复。',
    reasoning: `用户提出了一个问题："${userMessage}"。

这个问题在我当前的演示模式下没有特定的处理逻辑。我需要：
1. 确认我理解了用户的问题
2. 解释当前是演示模式的限制
3. 提供一个通用但友好的回应
4. 不要虚构信息或给出可能不准确的答案

在真实环境中，我会连接到更强大的AI后端或知识库来提供专业回答。这种透明的沟通有助于管理用户期望。`
  };
}
</script>

<style scoped lang="less">
.ai-chat-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  
  // 移动端适配
  @media (max-width: 768px) {
    padding: 16px 12px;
  }
}

h1 {
  margin-bottom: 16px;
  font-size: 28px;
  color: var(--td-brand-color);
  
  // 移动端适配
  @media (max-width: 768px) {
    font-size: 22px;
    margin-bottom: 12px;
  }
}

.description {
  color: #666;
  margin-bottom: 32px;
  
  // 移动端适配
  @media (max-width: 768px) {
    margin-bottom: 16px;
    font-size: 14px;
  }
}

.chat-container {
  margin-bottom: 40px;
  
  // 移动端适配
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
}

.chat-box {
  position: relative;
  border: 1px solid var(--td-component-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  :deep(.t-chat) {
    // 移动端适配 - 调整聊天窗口高度
    @media (max-width: 768px) {
      height: calc(100vh - 220px) !important;
    }
  }
  
  // 移动端适配 - 调整消息布局
  :deep(.t-chat-item) {
    @media (max-width: 768px) {
      padding: 12px 8px;
    }
  }
  
  // 移动端适配 - 调整输入框
  :deep(.t-chat-input) {
    @media (max-width: 768px) {
      padding: 8px;
    }
  }
  
  // 移动端适配 - 调整头像大小
  :deep(.t-avatar) {
    @media (max-width: 768px) {
      width: 32px !important;
      height: 32px !important;
    }
  }
  
  // 移动端适配 - 调整操作按钮大小
  :deep(.t-chat-action) {
    @media (max-width: 768px) {
      padding: 4px 0;
      font-size: 13px;
      
      .t-button {
        padding: 4px 8px;
      }
    }
  }
  
  // 移动端适配 - 调整消息内容
  :deep(.t-chat-item__content) {
    @media (max-width: 768px) {
      font-size: 14px;
      padding: 8px 12px;
    }
  }
  
  // 移动端适配 - 调整思考过程
  :deep(.t-chat-reasoning) {
    @media (max-width: 768px) {
      margin-bottom: 8px;
      font-size: 13px;
      
      .t-chat-reasoning__header {
        padding: 6px 10px;
      }
      
      .t-chat-reasoning__content {
        padding: 8px 10px;
      }
    }
  }
}

.features-section {
  background-color: var(--td-bg-color-container);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  // 移动端适配
  @media (max-width: 768px) {
    padding: 16px 12px;
  }
  
  h2 {
    margin-bottom: 16px;
    font-size: 20px;
    
    // 移动端适配
    @media (max-width: 768px) {
      font-size: 18px;
      margin-bottom: 12px;
    }
  }
  
  // 移动端适配 - 隐藏功能特点
  @media (max-width: 480px) {
    display: none;
  }
}

// 功能列表移动端适配
.features-list {
  @media (max-width: 768px) {
    :deep(.t-alert) {
      padding: 8px 12px;
      font-size: 13px;
    }
  }
}

/* 回到底部按钮 */
.bottomBtn {
  position: absolute;
  left: 50%;
  margin-left: -20px;
  bottom: 210px;
  padding: 0;
  border: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0px 8px 10px -5px rgba(0, 0, 0, 0.08), 0px 16px 24px 2px rgba(0, 0, 0, 0.04),
    0px 6px 30px 5px rgba(0, 0, 0, 0.05);
  
  // 移动端适配
  @media (max-width: 768px) {
    bottom: 180px;
    width: 36px;
    height: 36px;
    margin-left: -18px;
  }
}

.to-bottom {
  width: 40px;
  height: 40px;
  border: 1px solid #dcdcdc;
  box-sizing: border-box;
  background: var(--td-bg-color-container);
  border-radius: 50%;
  font-size: 24px;
  line-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  // 移动端适配
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 20px;
    line-height: 36px;
  }
}

.to-bottom .t-icon {
  font-size: 24px;
  
  // 移动端适配
  @media (max-width: 768px) {
    font-size: 20px;
  }
}

/* 应用滚动条样式 */
:deep(::-webkit-scrollbar-thumb) {
  background-color: var(--td-scrollbar-color);
}

:deep(::-webkit-scrollbar-thumb:horizontal:hover) {
  background-color: var(--td-scrollbar-hover-color);
}

:deep(::-webkit-scrollbar-track) {
  background-color: var(--td-scroll-track-color);
}

:deep(.t-chat-item__content) pre {
  background-color: var(--td-bg-color-component);
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  
  // 移动端适配 - 调整代码块
  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 13px;
  }
}

:deep(.t-chat-item__content) code {
  font-family: 'Courier New', Courier, monospace;
}
</style>