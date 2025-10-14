# 语音对话数字人系统 - 项目概述

## 项目架构

### 技术栈
- **前端**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **ASR**: Web Speech API (浏览器原生语音识别)
- **AI模型**: Ollama API (本地运行的开源LLM)
- **TTS**: Web Speech API (浏览器原生语音合成)
- **视觉效果**: Anime.js, p5.js, ECharts.js
- **音频可视化**: Web Audio API

### 核心功能模块

#### 1. 语音录制模块
- 使用 Web Audio API 录制用户语音
- 实时音频波形可视化
- 录音状态管理（开始/停止/暂停）

#### 2. ASR模块 (语音识别)
- 集成 Web Speech API 的 SpeechRecognition
- 实时语音转文本
- 多语言支持（中文、英文）
- 语音识别置信度检测

#### 3. AI对话模块
- Ollama API 集成
- 支持多种开源模型（llama2, mistral, codellama等）
- 对话上下文管理
- 响应流式处理

#### 4. TTS模块 (语音合成)
- Web Speech API 的 SpeechSynthesis
- 多音色选择
- 语速和音调调节
- 音频播放控制

#### 5. 数字人界面
- 现代化3D风格设计
- 实时语音波形动画
- 对话状态指示器
- 语音活动检测可视化

## 页面结构

### 主页面 (index.html)
- 数字人头像区域（带语音可视化效果）
- 对话历史显示区域
- 语音控制按钮区域
- 设置面板（模型选择、语音设置等）

### 功能特性
- 响应式设计，支持移动端
- 深色/浅色主题切换
- 实时语音波形显示
- 对话历史保存
- 模型响应时间统计
- 语音质量指示器

## 部署架构
- 纯前端应用，可静态部署
- Ollama 服务在本地运行
- 浏览器直接访问，无需服务器端代码
- 支持现代浏览器的语音API

## 开源组件集成
- Ollama: 本地LLM服务
- Web Speech API: 浏览器原生语音功能
- Anime.js: 动画效果
- p5.js: 音频可视化
- ECharts.js: 数据可视化