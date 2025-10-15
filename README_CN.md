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

下载模型（以qwen2.5为例）：
```bash
ollama pull qwen2.5
```

### 3. 启动Web应用

使用Python启动本地服务器：

```bash
cd ai-person
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

## 项目结构

```
├── index.html          # 主页面
├── main.js             # 核心JavaScript逻辑
├── ai_avatar.png       # AI头像图片
├── hero_background.png # 背景图片
├── outline.md          # 项目概述
├── demo.png            # 页面样式示例图片
└── README.md           # 说明文档
```

享受您的AI语音对话体验！🎉