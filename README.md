# AI语音对话助手

一个基于Web的AI语音对话系统，集成了语音识别(ASR)、Ollama大语言模型和语音合成(TTS)功能，不需要联网，开箱即用~~

## 功能特性

### 🎤 语音识别 (ASR)
- 使用浏览器原生Web Speech API
- 支持中文和英文识别
- 实时语音转文本
- 语音识别置信度可视化

### 🤖 AI对话
- 集成Ollama本地大语言模型
- 支持多种开源模型 (Llama 2, Mistral, CodeLlama等)
- 流式响应处理
- 对话历史管理

### 🔊 语音合成 (TTS)
- 使用浏览器原生Speech Synthesis API
- 多音色选择
- 语速和音调调节
- 实时音频播放

### 🎨 现代化界面
- 未来科技感设计
- 实时音频可视化效果
- 响应式布局
- 流畅的动画交互

## 技术栈

- **前端**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **ASR**: Web Speech API (浏览器原生)
- **AI模型**: Ollama API (本地运行)
- **TTS**: Web Speech API (浏览器原生)
- **视觉效果**: Anime.js, p5.js, ECharts.js

## 安装和配置

### 1. 安装Ollama

在macOS上安装Ollama：

```bash
brew install ollama
```

或者从官网下载安装包：
https://ollama.ai

### 2. 下载并运行模型

启动Ollama服务：
```bash
ollama serve
```

下载模型（以Llama 2为例）：
```bash
ollama pull qwen2.5
```

### 3. 启动Web应用

使用Python启动本地服务器：

```bash
cd ai_person
python -m http.server 8000
```

然后在浏览器中访问：`http://localhost:8000`

## 使用方法

### 1. 首次设置
- 打开设置面板（右上角齿轮图标）
- 配置Ollama API地址（默认：http://localhost:11434/api/generate）
- 选择要使用的AI模型
- 点击"测试连接"确保连接正常

### 2. 开始对话
- 点击中央的麦克风按钮开始录音
- 对着麦克风说话
- 说完后等待AI响应
- AI会以语音形式回复

### 3. 设置选项
- **语言选择**: 中文(zh-CN) / 英文(en-US)
- **语音选择**: 选择不同的合成语音
- **语速调节**: 调整语音播放速度
- **模型配置**: 温度、最大响应长度等参数

## 浏览器兼容性

### 支持的功能
- ✅ Chrome 88+ (完全支持)
- ✅ Firefox 86+ (完全支持)
- ✅ Safari 14.1+ (部分支持)
- ✅ Edge 88+ (完全支持)

### 必需的功能支持
- Web Speech API (语音识别和合成)
- Web Audio API (音频可视化)
- getUserMedia (麦克风访问)
- Fetch API (Ollama通信)

## 故障排除

### 常见问题

#### 1. 麦克风权限被拒绝
- 确保网站有麦克风访问权限
- 检查浏览器设置中的权限管理
- 在macOS系统偏好设置中检查麦克风权限

#### 2. Ollama连接失败
- 确保Ollama服务正在运行
- 检查API地址是否正确
- 确认防火墙没有阻止连接

#### 3. 语音识别不准确
- 检查语言设置是否正确
- 确保环境安静，减少背景噪音
- 尝试调整麦克风音量

#### 4. 语音合成无声
- 检查系统音量
- 确认选择了合适的语音
- 尝试调整语速设置

### 调试信息

在浏览器控制台中可以查看详细的调试信息：
- 语音识别状态
- API调用日志
- 错误信息
- 性能统计

## 项目结构

```
├── index.html          # 主页面
├── main.js            # 核心JavaScript逻辑
├── ai_avatar.png      # AI头像图片
├── hero_background.png # 背景图片
├── design.md          # 设计文档
├── outline.md         # 项目概述
└── README.md          # 说明文档
```

## 自定义配置

### 修改默认设置
在`main.js`中可以修改默认配置：

```javascript
this.settings = {
    language: 'zh-CN',        // 默认语言
    voice: null,              // 默认语音
    rate: 1.0,                // 默认语速
    model: 'qwen2.5',          // 默认模型
    apiUrl: 'http://localhost:11434/api/generate',  // API地址
    maxTokens: 512,           // 最大响应长度
    temperature: 0.7          // 温度参数
};
```

### 添加新模型
在设置面板中添加新的模型选项：

```html
<option value="newmodel">New Model</option>
```

享受您的AI语音对话体验！🎉