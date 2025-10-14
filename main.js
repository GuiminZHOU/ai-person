// AI语音对话助手 - 主要JavaScript逻辑
class AIVoiceAssistant {
    constructor() {
        // 语音识别
        this.recognition = null;
        this.isListening = false;
        
        // 语音合成
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isSpeaking = false;
        
        // 音频上下文
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.volumeData = new Uint8Array(32);
        
        // 状态管理
        this.isRecording = false;
        this.isProcessing = false;
        this.chatHistory = [];
        
        // 设置
        this.settings = {
            language: 'zh-CN',
            voice: null,
            rate: 1.0,
            model: 'qwen2.5',
            apiUrl: 'http://localhost:11434/api/generate',
            maxTokens: 512,
            temperature: 0.7
        };
        
        // 初始化
        this.init();
    }
    
    async init() {
        await this.checkBrowserSupport();
        this.initializeSpeechRecognition();
        this.initializeSpeechSynthesis();
        this.initializeAudioContext();
        this.setupEventListeners();
        this.createFloatingParticles();
        this.initializeConfidenceChart();
        this.loadSettings();
        this.updateVoiceList();

        // 在初始化完成后尝试获取模型列表
        setTimeout(() => {
            this.updateModelSelector();
        }, 1000);
        
        console.log('AI语音助手初始化完成');
    }
    
    // 检查浏览器支持
    async checkBrowserSupport() {
        const features = {
            speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
            speechSynthesis: 'speechSynthesis' in window,
            webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
            getUserMedia: 'getUserMedia' in navigator || 'webkitGetUserMedia' in navigator
        };
        
        const unsupported = Object.entries(features)
            .filter(([key, supported]) => !supported)
            .map(([key]) => key);
            
        if (unsupported.length > 0) {
            console.warn('不支持的功能:', unsupported);
            this.showWarning(`您的浏览器不支持以下功能: ${unsupported.join(', ')}`);
        }
        
        return features;
    }
    
    // 初始化语音识别
    initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('浏览器不支持语音识别');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.settings.language;
        
        this.recognition.onstart = () => {
            console.log('语音识别开始');
            this.isListening = true;
            this.updateStatus('正在聆听...', '请说话');
            this.startRecordingAnimation();
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    this.updateConfidenceChart(confidence);
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                console.log('最终识别结果:', finalTranscript);
                this.handleVoiceInput(finalTranscript);
            } else if (interimTranscript) {
                this.updateStatus('识别中...', interimTranscript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            this.handleSpeechError(event.error);
        };
        
        this.recognition.onend = () => {
            console.log('语音识别结束');
            this.isListening = false;
            this.stopRecordingAnimation();
            
            if (this.isRecording) {
                // 如果仍在录音状态，重新开始识别
                setTimeout(() => {
                    if (this.isRecording) {
                        this.recognition.start();
                    }
                }, 100);
            }
        };
    }
    
    // 初始化语音合成
    initializeSpeechSynthesis() {
        if (!this.synthesis) {
            console.error('浏览器不支持语音合成');
            return;
        }
        
        // 加载语音列表
        this.updateVoiceList();
        
        // 语音加载完成事件
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => this.updateVoiceList();
        }
    }
    
    // 更新语音列表
    updateVoiceList() {
        const voices = this.synthesis.getVoices();
        const voiceSelect = document.getElementById('voiceSelect');
        
        // 清空现有选项
        voiceSelect.innerHTML = '<option value="">选择语音...</option>';
        
        // 添加语音选项
        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            
            // 优先选择中文语音
            if (voice.lang.startsWith('zh') && !this.settings.voice) {
                this.settings.voice = voice;
                option.selected = true;
            } else if (index === 0) {
                this.settings.voice = voice;
                option.selected = true;
            }
            
            voiceSelect.appendChild(option);
        });
        
        // 如果没有中文语音，选择第一个可用语音
        if (!this.settings.voice && voices.length > 0) {
            this.settings.voice = voices[0];
        }
    }
    
    // 初始化音频上下文
    async initializeAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // 获取麦克风权限
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            
            this.analyser.fftSize = 64;
            this.analyser.smoothingTimeConstant = 0.8;
            
            this.microphone.connect(this.analyser);
            
            // 开始音量监测
            this.startVolumeMonitoring();
            
            console.log('音频上下文初始化完成');
        } catch (error) {
            console.error('音频上下文初始化失败:', error);
        }
    }
    
    // 开始音量监测
    startVolumeMonitoring() {
        const updateVolume = () => {
            if (this.analyser && this.isRecording) {
                this.analyser.getByteFrequencyData(this.volumeData);
                
                // 计算平均音量
                const averageVolume = this.volumeData.reduce((sum, value) => sum + value, 0) / this.volumeData.length;
                
                // 更新音量指示器
                this.updateVolumeIndicator(averageVolume);
            }
            
            requestAnimationFrame(updateVolume);
        };
        
        updateVolume();
    }
    
    // 更新音量指示器
    updateVolumeIndicator(volume) {
        const container = document.getElementById('volumeIndicator');
        const barCount = 20;
        
        // 创建音量条（如果不存在）
        if (container.children.length !== barCount) {
            container.innerHTML = '';
            for (let i = 0; i < barCount; i++) {
                const bar = document.createElement('div');
                bar.className = 'volume-bar';
                bar.style.height = '4px';
                container.appendChild(bar);
            }
        }
        
        // 更新音量条高度
        const bars = container.querySelectorAll('.volume-bar');
        bars.forEach((bar, index) => {
            const height = Math.max(4, (volume / 128) * 20 * Math.random());
            bar.style.height = `${height}px`;
        });
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 录音按钮
        document.getElementById('recordBtn').addEventListener('click', () => {
            this.toggleRecording();
        });
        
        // 播放按钮
        document.getElementById('playBtn').addEventListener('click', () => {
            this.toggleSpeaking();
        });
        
        // 停止按钮
        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stopAll();
        });
        
        // 清空对话
        document.getElementById('clearChat').addEventListener('click', () => {
            this.clearChat();
        });
        
        // 设置按钮
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });
        
        // 关闭设置
        document.getElementById('closeSettings').addEventListener('click', () => {
            this.hideSettings();
        });
        
        document.getElementById('modalBackdrop').addEventListener('click', () => {
            this.hideSettings();
        });
        
        // 设置变更
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            if (this.recognition) {
                this.recognition.lang = this.settings.language;
            }
        });
        
        document.getElementById('voiceSelect').addEventListener('change', (e) => {
            const voices = this.synthesis.getVoices();
            this.settings.voice = voices[e.target.value] || null;
        });
        
        document.getElementById('rateSlider').addEventListener('input', (e) => {
            this.settings.rate = parseFloat(e.target.value);
            document.getElementById('rateValue').textContent = this.settings.rate.toFixed(1);
        });
        
        // 模型设置
        document.getElementById('modelSelect').addEventListener('change', (e) => {
            this.settings.model = e.target.value;
        });
        
        document.getElementById('apiUrl').addEventListener('input', (e) => {
            this.settings.apiUrl = e.target.value;
        });
        
        document.getElementById('maxTokens').addEventListener('input', (e) => {
            this.settings.maxTokens = parseInt(e.target.value);
        });
        
        document.getElementById('temperature').addEventListener('input', (e) => {
            this.settings.temperature = parseFloat(e.target.value);
            document.getElementById('temperatureValue').textContent = this.settings.temperature.toFixed(1);
        });
        
        // 测试连接
        document.getElementById('testConnection').addEventListener('click', () => {
            this.testOllamaConnection();
        });
    }
    
    // 切换录音状态
    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    // 开始录音
    startRecording() {
        if (!this.recognition) {
            this.showError('语音识别不可用');
            return;
        }
        
        this.isRecording = true;
        this.recognition.lang = this.settings.language;
        this.recognition.start();
        
        // 更新UI
        const recordBtn = document.getElementById('recordBtn');
        recordBtn.classList.add('recording-indicator');
        
        console.log('开始录音');
    }
    
    // 停止录音
    stopRecording() {
        this.isRecording = false;
        
        if (this.recognition) {
            this.recognition.stop();
        }
        
        // 更新UI
        const recordBtn = document.getElementById('recordBtn');
        recordBtn.classList.remove('recording-indicator');
        
        console.log('停止录音');
    }
    
    // 处理语音输入
    async handleVoiceInput(text) {
        console.log('处理语音输入:', text);
        
        // 添加到对话历史
        this.addMessage('user', text);
        
        // 停止录音
        this.stopRecording();
        
        // 显示加载状态
        this.showLoading('AI正在思考...');
        
        try {
            // 调用Ollama API
            const response = await this.callOllamaAPI(text);
            
            // 隐藏加载状态
            this.hideLoading();
            
            // 添加到对话历史
            this.addMessage('ai', response);
            
            // 语音回复
            this.speakResponse(response);
            
        } catch (error) {
            console.error('处理语音输入失败:', error);
            this.hideLoading();
            this.showError('AI响应失败，请重试');
            this.addMessage('ai', '抱歉，我现在无法回答这个问题。');
        }
    }
    
    // 调用Ollama API
    async callOllamaAPI(prompt) {
        const response = await fetch(this.settings.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.settings.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: this.settings.temperature,
                    num_predict: this.settings.maxTokens
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response;
    }
    
    // 语音回复
    speakResponse(text) {
        if (!this.synthesis || !this.settings.voice) {
            console.warn('语音合成不可用');
            return;
        }
        
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.voice = this.settings.voice;
        this.currentUtterance.rate = this.settings.rate;
        this.currentUtterance.lang = this.settings.language;
        
        this.currentUtterance.onstart = () => {
            this.isSpeaking = true;
            this.updateStatus('正在说话...', text.substring(0, 50) + '...');
            this.updatePlayButton(true);
        };
        
        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            this.updateStatus('准备就绪', '点击麦克风开始对话');
            this.updatePlayButton(false);
        };
        
        this.currentUtterance.onerror = (event) => {
            console.error('语音合成错误:', event.error);
            this.isSpeaking = false;
            this.updateStatus('准备就绪', '点击麦克风开始对话');
        };
        
        this.synthesis.speak(this.currentUtterance);
    }
    
    // 切换播放状态
    toggleSpeaking() {
        if (!this.synthesis) return;
        
        if (this.isSpeaking) {
            this.synthesis.pause();
            this.isSpeaking = false;
        } else if (this.synthesis.paused) {
            this.synthesis.resume();
            this.isSpeaking = true;
        }
    }
    
    // 停止所有操作
    stopAll() {
        // 停止录音
        if (this.isRecording) {
            this.stopRecording();
        }
        
        // 停止语音合成
        if (this.synthesis && this.synthesis.speaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
        
        // 重置状态
        this.updateStatus('准备就绪', '点击麦克风开始对话');
        this.updatePlayButton(false);
    }
    
    // 添加消息到对话历史
    addMessage(sender, content) {
        const message = {
            sender: sender,
            content: content,
            timestamp: new Date()
        };
        
        this.chatHistory.push(message);
        this.renderMessage(message);
    }
    
    // 渲染消息
    renderMessage(message) {
        const chatContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        
        const isUser = message.sender === 'user';
        messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} message-bubble`;
        
        const bubbleClass = isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
            : 'glass-effect text-gray-100';
        
        messageDiv.innerHTML = `
            <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${bubbleClass}">
                <p class="text-sm">${this.escapeHtml(message.content)}</p>
                <p class="text-xs opacity-70 mt-1">${this.formatTime(message.timestamp)}</p>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // 清空对话
    clearChat() {
        this.chatHistory = [];
        document.getElementById('chatMessages').innerHTML = '';
    }
    
    // 更新状态显示
    updateStatus(status, detail) {
        document.getElementById('aiStatus').textContent = status;
        document.getElementById('aiStatusDetail').textContent = detail;
    }
    
    // 更新播放按钮状态
    updatePlayButton(active) {
        const playBtn = document.getElementById('playBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (active) {
            playBtn.disabled = false;
            playBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            stopBtn.disabled = false;
            stopBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            playBtn.disabled = true;
            playBtn.classList.add('opacity-50', 'cursor-not-allowed');
            stopBtn.disabled = true;
            stopBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
    
    // 显示加载状态
    showLoading(text = '加载中...') {
        document.getElementById('loadingText').textContent = text;
        document.getElementById('loadingIndicator').classList.remove('hidden');
        this.isProcessing = true;
    }
    
    // 隐藏加载状态
    hideLoading() {
        document.getElementById('loadingIndicator').classList.add('hidden');
        this.isProcessing = false;
    }
    
    // 显示设置面板
    showSettings() {
        document.getElementById('settingsModal').classList.remove('hidden');
    }
    
    // 隐藏设置面板
    hideSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
        this.saveSettings();
    }

    async fetchOllamaModels() {
        try {
            const response = await fetch('http://localhost:11434/api/tags');

            if (response.ok) {
                const data = await response.json();
                return data.models || [];
            } else {
                console.warn('无法获取模型列表，使用默认模型');
                return [];
            }
        } catch (error) {
            console.error('获取模型列表失败:', error);
            return [];
        }
    }

    async updateModelSelector() {
        const models = await this.fetchOllamaModels();
        const modelSelect = document.getElementById('modelSelect');

        // 清空现有选项
        modelSelect.innerHTML = '';

        if (models.length === 0) {
            // 如果没有获取到模型，使用默认选项
            const defaultModels = [
                { name: 'llama2', size: 'default' },
                { name: 'mistral', size: 'default' },
                { name: 'codellama', size: 'default' }
            ];

            defaultModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model.name;
                option.textContent = `${model.name} (默认)`;
                modelSelect.appendChild(option);
            });

            console.log('使用默认模型列表');
        } else {
            // 使用获取到的模型列表
            models.forEach((model, index)=> {
                const option = document.createElement('option');
                option.value = model.name;

                // 格式化模型大小
                const sizeInGB = (model.size / (1024 ** 3)).toFixed(1);
                option.textContent = `${model.name} (${sizeInGB}GB)`;

                // 设置第一个选项为默认选中
                if (index === 0) {
                    option.selected = true;
                }

                modelSelect.appendChild(option);
            });

            console.log(`成功加载 ${models.length} 个模型`);

            // 如果有之前保存的设置，恢复选择
            const savedSettings = localStorage.getItem('aiAssistantSettings');
            if (savedSettings) {
                try {
                    const settings = JSON.parse(savedSettings);
                    if (settings.model) {
                        modelSelect.value = settings.model;
                    }
                } catch (error) {
                    console.error('恢复模型设置失败:', error);
                }
            }
        }

        this.settings.model = modelSelect.value
        console.log(`当前llm模型是${this.settings.model}`)
    }

    // 测试Ollama连接
    async testOllamaConnection() {
        const testBtn = document.getElementById('testConnection');
        const originalText = testBtn.textContent;

        testBtn.textContent = '测试中...';
        testBtn.disabled = true;

        try {
            // 测试连接并更新模型列表
            await this.updateModelSelector();
            this.showSuccess('连接成功！模型列表已更新');
        } catch (error) {
            console.error('连接测试失败:', error);
            this.showError('连接失败，请确保Ollama正在运行');
        } finally {
            testBtn.textContent = originalText;
            testBtn.disabled = false;
        }
    }
    
    // 创建浮动粒子效果
    createFloatingParticles() {
        const container = document.getElementById('particles');
        
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 6}s`;
            particle.style.animationDuration = `${6 + Math.random() * 4}s`;
            
            container.appendChild(particle);
            
            // 清理粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 10000);
        };
        
        // 定期创建粒子
        setInterval(createParticle, 500);
    }
    
    // 初始化置信度图表
    initializeConfidenceChart() {
        const chartDom = document.getElementById('confidenceChart');
        const myChart = echarts.init(chartDom);
        
        const option = {
            backgroundColor: 'transparent',
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLine: { lineStyle: { color: '#4a5568' } },
                axisLabel: { color: '#a0aec0' }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 1,
                axisLine: { lineStyle: { color: '#4a5568' } },
                axisLabel: { color: '#a0aec0' },
                splitLine: { lineStyle: { color: '#2d3748' } }
            },
            series: [{
                data: [],
                type: 'line',
                smooth: true,
                lineStyle: { color: '#00d4ff' },
                itemStyle: { color: '#00d4ff' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
                            { offset: 1, color: 'rgba(0, 212, 255, 0.1)' }
                        ]
                    }
                }
            }]
        };
        
        myChart.setOption(option);
        this.confidenceChart = myChart;
        
        // 响应式调整
        window.addEventListener('resize', () => {
            myChart.resize();
        });
    }
    
    // 更新置信度图表
    updateConfidenceChart(confidence) {
        if (!this.confidenceChart) return;
        
        const option = this.confidenceChart.getOption();
        const data = option.series[0].data;
        const categories = option.xAxis[0].data;
        
        // 添加新数据点
        const timestamp = new Date().toLocaleTimeString();
        categories.push(timestamp);
        data.push(confidence);
        
        // 保持最近20个数据点
        if (categories.length > 20) {
            categories.shift();
            data.shift();
        }
        
        this.confidenceChart.setOption({
            xAxis: { data: categories },
            series: [{ data: data }]
        });
    }
    
    // 开始录音动画
    startRecordingAnimation() {
        const avatarContainer = document.querySelector('.avatar-container');
        avatarContainer.classList.add('pulse-animation');
    }
    
    // 停止录音动画
    stopRecordingAnimation() {
        const avatarContainer = document.querySelector('.avatar-container');
        avatarContainer.classList.remove('pulse-animation');
    }
    
    // 处理语音识别错误
    handleSpeechError(error) {
        console.error('语音识别错误:', error);
        
        let errorMessage = '语音识别出错';
        
        switch (error) {
            case 'no-speech':
                errorMessage = '未检测到语音';
                break;
            case 'audio-capture':
                errorMessage = '音频捕获失败';
                break;
            case 'not-allowed':
                errorMessage = '麦克风权限被拒绝';
                break;
            case 'network':
                errorMessage = '网络连接错误';
                break;
            default:
                errorMessage = `语音识别错误: ${error}`;
        }
        
        this.showError(errorMessage);
        this.updateStatus('准备就绪', '点击麦克风开始对话');
    }
    
    // 保存设置
    saveSettings() {
        localStorage.setItem('aiAssistantSettings', JSON.stringify(this.settings));
    }
    
    // 加载设置
    loadSettings() {
        const saved = localStorage.getItem('aiAssistantSettings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
                this.applySettingsToUI();
            } catch (error) {
                console.error('加载设置失败:', error);
            }
        }
    }
    
    // 应用设置到UI
    applySettingsToUI() {
        document.getElementById('languageSelect').value = this.settings.language;
        document.getElementById('rateSlider').value = this.settings.rate;
        document.getElementById('rateValue').textContent = this.settings.rate.toFixed(1);
        document.getElementById('modelSelect').value = this.settings.model;
        document.getElementById('apiUrl').value = this.settings.apiUrl;
        document.getElementById('maxTokens').value = this.settings.maxTokens;
        document.getElementById('temperature').value = this.settings.temperature;
        document.getElementById('temperatureValue').textContent = this.settings.temperature.toFixed(1);
    }
    
    // 显示成功消息
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    // 显示错误消息
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    // 显示警告消息
    showWarning(message) {
        this.showNotification(message, 'warning');
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm transition-all duration-300 transform translate-x-full`;
        
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-blue-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // 工具函数：转义HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 工具函数：格式化时间
    formatTime(date) {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIVoiceAssistant();
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (window.aiAssistant) {
        window.aiAssistant.stopAll();
        window.aiAssistant.saveSettings();
    }
});