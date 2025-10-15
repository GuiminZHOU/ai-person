# AI Voice Assistant

[中文版](README_CN.md)

A web-based AI voice conversation system integrating speech recognition (ASR), Ollama large language model, and speech synthesis (TTS) capabilities. No internet connection required, run entirely locally, enjoy~~

## Features

### 🎤 Speech Recognition (ASR)
- Uses browser native Web Speech API
- Supports Chinese and English recognition
- Real-time speech-to-text conversion
- Speech recognition confidence visualization

### 🤖 AI Conversation
- Integrates Ollama local large language model
- Supports multiple open-source models (Llama 2, Mistral, CodeLlama, etc.)
- Streaming response processing
- Conversation history management

### 🔊 Speech Synthesis (TTS)
- Uses browser native Speech Synthesis API
- Multiple voice selection
- Speech rate and pitch adjustment
- Real-time audio playback

### 🎨 Modern Interface
- Futuristic design
- Real-time audio visualization effects
- Responsive layout
- Smooth animation interactions

## Tech Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **ASR**: Web Speech API (browser native)
- **AI Model**: Ollama API (local running)
- **TTS**: Web Speech API (browser native)
- **Visual Effects**: Anime.js, p5.js, ECharts.js

## Installation and Configuration

### 1. Install Ollama

Install Ollama on macOS:

```bash
brew install ollama
```

Or download the installer from the official website:
https://ollama.ai

### 2. Download and Run Models

Start the Ollama service:
```bash
ollama serve
```

Download a model (using qwen2.5 as an example):
```bash
ollama pull qwen2.5
```

### 3. Launch the Web Application

Start a local server using Python:

```bash
cd ai-person
python -m http.server 8000
```

Then access in your browser: `http://localhost:8000`

## Usage

### 1. Initial Setup
- Open the settings panel (gear icon in the top right)
- Configure the Ollama API address (default: http://localhost:11434/api/generate)
- Select the AI model to use
- Click "Test Connection" to ensure the connection is working

### 2. Start Conversing
- Click the microphone button in the center to start recording
- Speak into the microphone
- Wait for the AI response after speaking
- The AI will reply in voice form

### 3. Settings Options
- **Language Selection**: Chinese (zh-CN) / English (en-US)
- **Voice Selection**: Choose different synthetic voices
- **Speech Rate Adjustment**: Adjust voice playback speed
- **Model Configuration**: Temperature, maximum response length, and other parameters

## Browser Compatibility

### Supported Features
- ✅ Chrome 88+ (fully supported)
- ✅ Firefox 86+ (fully supported)
- ✅ Safari 14.1+ (partially supported)
- ✅ Edge 88+ (fully supported)

### Required Feature Support
- Web Speech API (speech recognition and synthesis)
- Web Audio API (audio visualization)
- getUserMedia (microphone access)
- Fetch API (Ollama communication)

## Project Structure

```
├── index.html          # Main page
├── main.js             # Core JavaScript logic
├── ai_avatar.png       # AI avatar image
├── hero_background.png # Background image
├── outline.md          # Project overview
├── demo.png            # Page style example image
└── README.md           # Documentation
```

Enjoy! 🎉

