class AIComposer {
    constructor() {
        this.musicGenerator = new MusicGenerator();
        this.isInitialized = false;
        this.currentComposition = null;
        this.isPlaying = false;
        this.analyser = null;
        this.visualizerCanvas = null;
        this.visualizerContext = null;
        this.animationId = null;
        this.progressInterval = null;
        this.playStartTime = 0;
        this.compositionDuration = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.startVisualization();
        this.initializeAIFeatures();
    }
    
    initializeElements() {
        // Control elements
        this.keySelect = document.getElementById('key');
        this.tempoSlider = document.getElementById('tempo');
        this.tempoValue = document.getElementById('tempoValue');
        this.complexitySelect = document.getElementById('complexity');
        this.structureSelect = document.getElementById('structure');
        this.genreSelect = document.getElementById('genre');
        
        // Control buttons - using correct IDs from HTML
        this.generateBtn = document.getElementById('generateBtn');
        this.playPauseBtn = document.getElementById('playBtn');  // This is the play button
        this.stopBtn = document.getElementById('stopBtn');
        this.downloadBtn = document.getElementById('exportBtn'); // This is the export button
        
        // Visualization elements
        this.visualizer = document.getElementById('visualizer');
        this.visualizerCtx = this.visualizer ? this.visualizer.getContext('2d') : null;
        this.status = document.getElementById('status');
        
        // Progress bar elements
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        
        // Set canvas size if visualizer exists
        if (this.visualizer) {
            this.visualizer.width = 800;
            this.visualizer.height = 250;
        }
    }
    
    bindEvents() {
        // Slider updates
        if (this.tempoSlider) {
            this.tempoSlider.addEventListener('input', (e) => {
                if (this.tempoValue) this.tempoValue.textContent = e.target.value;
            });
        }
        
        // Button events
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateMusic());
        }
        
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.playMusic());
        }
        
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stopMusic());
        }
        
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadMusic());
        }
        
        // Style blending controls
        const secondaryGenreSelect = document.getElementById('secondaryGenre');
        const blendRatioSlider = document.getElementById('blendRatio');
        const blendRatioValue = document.getElementById('blendRatioValue');
        
        if (secondaryGenreSelect && blendRatioSlider && blendRatioValue) {
            secondaryGenreSelect.addEventListener('change', (e) => {
                const hasSecondary = e.target.value !== '';
                blendRatioSlider.disabled = !hasSecondary;
                if (!hasSecondary) {
                    blendRatioSlider.value = 30;
                    blendRatioValue.textContent = '30%';
                }
            });
            
            blendRatioSlider.addEventListener('input', (e) => {
                blendRatioValue.textContent = e.target.value + '%';
            });
        }
        
        // AI Input Features
        this.bindAIInputEvents();
        
        // AI Feature events
        this.bindAIFeatureEvents();
        
        // Initialize audio context on first user interaction
        document.addEventListener('click', () => this.initializeAudio(), { once: true });
    }
    
    async initializeAudio() {
        if (!this.isInitialized) {
            const success = await this.musicGenerator.initialize();
            if (success) {
                this.isInitialized = true;
                console.log('Audio system initialized');
            } else {
                this.showError('Failed to initialize audio system. Please check your browser compatibility.');
            }
        }
    }
    
    getSettings() {
        const secondaryGenreSelect = document.getElementById('secondaryGenre');
        const blendRatioSlider = document.getElementById('blendRatio');
        
        return {
            key: this.keySelect ? this.keySelect.value : 'C',
            tempo: this.tempoSlider ? parseInt(this.tempoSlider.value) : 120,
            complexity: this.complexitySelect ? this.complexitySelect.value : 'moderate',
            structure: this.structureSelect ? this.structureSelect.value : 'simple',
            genre: this.genreSelect ? this.genreSelect.value : 'pop',
            secondaryGenre: secondaryGenreSelect ? secondaryGenreSelect.value : '',
            blendRatio: blendRatioSlider ? parseInt(blendRatioSlider.value) / 100 : 0.3,
            length: 30,
            instruments: { piano: true, strings: true, bass: true, drums: true }
        };
    }
    
    async generateMusic() {
        // Show loading state
        this.generateBtn.classList.add('loading');
        this.generateBtn.disabled = true;
        
        try {
            // Initialize audio if not already done
            if (!this.isInitialized) {
                await this.initializeAudio();
            }
            
            if (!this.isInitialized) {
                this.showError('Failed to initialize audio system. Please try clicking the generate button again.');
                return;
            }

            // Check for AI input modes
            const textPrompt = document.getElementById('textPrompt')?.value.trim();
            const audioInput = document.getElementById('audioInput')?.files[0];
            
            if (textPrompt) {
                // Generate music from text prompt
                await this.generateFromTextPrompt(textPrompt);
                return;
            }
            
            if (audioInput) {
                // Generate music from audio input
                await this.generateFromAudioInput(audioInput);
                return;
            }
            
            // Default generation using existing settings
            const settings = this.getSettings();
            
            // Validate that at least one instrument is selected
            const hasInstruments = Object.values(settings.instruments).some(enabled => enabled);
            if (!hasInstruments) {
                this.showError('Please select at least one instrument.');
                return;
            }
            
            // Generate AI-enhanced composition
            this.currentComposition = await this.generateAIComposition(settings);
            
            if (!this.currentComposition) {
                this.showError('Failed to generate composition. Please try again.');
                return;
            }
            
            this.compositionDuration = settings.length;
            
            // Enable controls
            this.stopBtn.disabled = false;
            this.downloadBtn.disabled = false;
            this.playPauseBtn.disabled = false;
            
            // Auto-play the generated music
            await this.playMusic();
            
            this.showSuccess('AI-enhanced music generated successfully! Click play to listen.');
            
        } catch (error) {
            console.error('Error generating music:', error);
            this.showError('Failed to generate music. Please try again.');
        } finally {
            // Hide loading state
            this.generateBtn.classList.remove('loading');
            this.generateBtn.disabled = false;
        }
    }
    
    async playMusic() {
        if (!this.currentComposition || !this.isInitialized) {
            return;
        }
        
        const settings = this.getSettings();
        
        try {
            await this.musicGenerator.playComposition(this.currentComposition, settings.instruments);
            this.isPlaying = true;
            this.playStartTime = Date.now();
            
            // Update UI
            this.playPauseBtn.classList.add('playing');
            this.stopBtn.disabled = false;
            
            // Show and reset progress bar
            if (this.progressBar) {
                this.progressBar.style.display = 'block';
            }
            if (this.progressFill) {
                this.progressFill.style.width = '0%';
            }
            
            // Start progress tracking
            this.startProgressTracking();
            
            // Auto-stop after composition duration
            setTimeout(() => {
                if (this.isPlaying) {
                    this.stopMusic();
                }
            }, this.compositionDuration * 1000);
            
        } catch (error) {
            console.error('Error playing music:', error);
            this.showError('Failed to play music.');
        }
    }
    
    stopMusic() {
        this.musicGenerator.stop();
        this.isPlaying = false;
        
        // Update UI
        this.playPauseBtn.classList.remove('playing');
        this.stopBtn.disabled = true;
        
        // Stop progress tracking
        this.stopProgressTracking();
        
        // Reset and hide progress bar
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        if (this.progressBar) {
            this.progressBar.style.display = 'none';
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.stopMusic();
        } else if (this.currentComposition) {
            this.playMusic();
        }
    }
    
    startProgressTracking() {
        this.progressInterval = setInterval(() => {
            if (this.isPlaying && this.compositionDuration > 0 && this.progressFill) {
                const elapsed = (Date.now() - this.playStartTime) / 1000;
                const progress = Math.min((elapsed / this.compositionDuration) * 100, 100);
                this.progressFill.style.width = `${progress}%`;
                
                if (progress >= 100) {
                    this.stopMusic();
                }
            }
        }, 100);
    }
    
    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    async downloadMusic(format = 'wav') {
        if (!this.currentComposition || !this.isInitialized) {
            this.showError('No music to download. Please generate music first.');
            return;
        }
        
        try {
            const settings = this.getSettings();
            
            // Show loading state
            this.downloadBtn.disabled = true;
            this.downloadBtn.textContent = 'Preparing...';
            
            // Convert instruments object to array of enabled instruments
            const enabledInstruments = Object.keys(settings.instruments).filter(
                instrument => settings.instruments[instrument]
            );
            
            let exportedData;
            let filename;
            let mimeType;

            switch (format) {
                case 'wav':
                    exportedData = await this.musicGenerator.exportToWAV(
                        this.currentComposition, 
                        enabledInstruments, 
                        settings.length,
                        24 // 24-bit high quality
                    );
                    filename = `hs-music-ai-${Date.now()}.wav`;
                    mimeType = 'audio/wav';
                    break;
                    
                case 'midi':
                    exportedData = await this.musicGenerator.exportToMIDI(this.currentComposition);
                    filename = `hs-music-ai-${Date.now()}.mid`;
                    mimeType = 'audio/midi';
                    break;
                    
                case 'stems':
                    const stems = await this.musicGenerator.exportStems(
                        this.currentComposition, 
                        enabledInstruments, 
                        settings.length
                    );
                    
                    // Download each stem separately
                    for (const [instrument, stemData] of Object.entries(stems)) {
                        this.downloadBlob(stemData, `hs-music-ai-${instrument}-${Date.now()}.wav`, 'audio/wav');
                    }
                    
                    this.showSuccess('Individual stems downloaded successfully!');
                    return;
                    
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            this.downloadBlob(exportedData, filename, mimeType);
            this.showSuccess(`Music downloaded as ${format.toUpperCase()} successfully!`);
            
        } catch (error) {
            console.error('Error downloading music:', error);
            this.showError(`Failed to download music: ${error.message}`);
        } finally {
            // Reset button state
            this.downloadBtn.disabled = false;
            this.downloadBtn.textContent = 'Download';
        }
    }

    downloadBlob(blob, filename, mimeType) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    startVisualization() {
        const draw = () => {
            this.animationId = requestAnimationFrame(draw);
            
            // Clear canvas
            this.visualizerCtx.fillStyle = '#1a202c';
            this.visualizerCtx.fillRect(0, 0, this.visualizer.width, this.visualizer.height);
            
            // Get audio data
            const dataArray = this.musicGenerator.getAnalyserData();
            const frequencyData = this.musicGenerator.getFrequencyData();
            
            if (dataArray && this.isPlaying) {
                this.drawSpectrumVisualization(dataArray, frequencyData);
            } else {
                this.drawIdleAnimation();
            }
        };
        
        draw();
    }

    drawSpectrumVisualization(dataArray, frequencyData) {
        const width = this.visualizer.width;
        const height = this.visualizer.height;
        
        // Draw frequency spectrum bars
        const barWidth = width / dataArray.length;
        let x = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * height * 0.8;
            
            // Create dynamic gradient based on frequency content
            const gradient = this.visualizerCtx.createLinearGradient(0, height, 0, height - barHeight);
            const intensity = dataArray[i] / 255;
            
            if (i < dataArray.length * 0.3) {
                // Low frequencies - red to orange
                gradient.addColorStop(0, `rgba(255, 69, 0, ${intensity})`);
                gradient.addColorStop(1, `rgba(255, 140, 0, ${intensity})`);
            } else if (i < dataArray.length * 0.7) {
                // Mid frequencies - blue to purple
                gradient.addColorStop(0, `rgba(102, 126, 234, ${intensity})`);
                gradient.addColorStop(1, `rgba(118, 75, 162, ${intensity})`);
            } else {
                // High frequencies - cyan to white
                gradient.addColorStop(0, `rgba(0, 255, 255, ${intensity})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, ${intensity})`);
            }
            
            this.visualizerCtx.fillStyle = gradient;
            this.visualizerCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
            
            // Add glow effect for high intensity bars
            if (intensity > 0.7) {
                this.visualizerCtx.shadowColor = gradient;
                this.visualizerCtx.shadowBlur = 10;
                this.visualizerCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
                this.visualizerCtx.shadowBlur = 0;
            }
            
            x += barWidth;
        }
        
        // Draw waveform overlay
        this.drawWaveformOverlay(frequencyData);
        
        // Draw frequency analysis
        this.drawFrequencyAnalysis(dataArray);
    }

    drawWaveformOverlay(frequencyData) {
        if (!frequencyData) return;
        
        const width = this.visualizer.width;
        const height = this.visualizer.height;
        const centerY = height / 2;
        
        this.visualizerCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.visualizerCtx.lineWidth = 2;
        this.visualizerCtx.beginPath();
        
        const sliceWidth = width / frequencyData.length;
        let x = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const v = (frequencyData[i] - 128) / 128.0;
            const y = centerY + v * centerY * 0.5;
            
            if (i === 0) {
                this.visualizerCtx.moveTo(x, y);
            } else {
                this.visualizerCtx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.visualizerCtx.stroke();
    }

    drawFrequencyAnalysis(dataArray) {
        // Calculate dominant frequencies
        let bassLevel = 0, midLevel = 0, trebleLevel = 0;
        const bassRange = Math.floor(dataArray.length * 0.1);
        const midRange = Math.floor(dataArray.length * 0.5);
        
        for (let i = 0; i < bassRange; i++) {
            bassLevel += dataArray[i];
        }
        for (let i = bassRange; i < midRange; i++) {
            midLevel += dataArray[i];
        }
        for (let i = midRange; i < dataArray.length; i++) {
            trebleLevel += dataArray[i];
        }
        
        bassLevel /= bassRange;
        midLevel /= (midRange - bassRange);
        trebleLevel /= (dataArray.length - midRange);
        
        // Draw frequency level indicators
        const width = this.visualizer.width;
        const height = this.visualizer.height;
        
        // Bass indicator (bottom left)
        this.visualizerCtx.fillStyle = `rgba(255, 69, 0, ${bassLevel / 255})`;
        this.visualizerCtx.fillRect(10, height - 30, 60, 20);
        
        // Mid indicator (bottom center)
        this.visualizerCtx.fillStyle = `rgba(102, 126, 234, ${midLevel / 255})`;
        this.visualizerCtx.fillRect(width / 2 - 30, height - 30, 60, 20);
        
        // Treble indicator (bottom right)
        this.visualizerCtx.fillStyle = `rgba(0, 255, 255, ${trebleLevel / 255})`;
        this.visualizerCtx.fillRect(width - 70, height - 30, 60, 20);
        
        // Add labels
        this.visualizerCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.visualizerCtx.font = '12px Arial';
        this.visualizerCtx.fillText('BASS', 15, height - 35);
        this.visualizerCtx.fillText('MID', width / 2 - 15, height - 35);
        this.visualizerCtx.fillText('TREBLE', width - 65, height - 35);
    }

    drawIdleAnimation() {
        const time = Date.now() * 0.002;
        const centerY = this.visualizer.height / 2;
        const width = this.visualizer.width;
        
        // Draw multiple sine waves with different frequencies and phases
        const waves = [
            { freq: 0.01, amp: 20, phase: 0, color: 'rgba(102, 126, 234, 0.8)' },
            { freq: 0.02, amp: 15, phase: Math.PI / 3, color: 'rgba(118, 75, 162, 0.6)' },
            { freq: 0.015, amp: 25, phase: Math.PI / 2, color: 'rgba(0, 255, 255, 0.4)' }
        ];
        
        waves.forEach(wave => {
            this.visualizerCtx.strokeStyle = wave.color;
            this.visualizerCtx.lineWidth = 2;
            this.visualizerCtx.beginPath();
            
            for (let x = 0; x < width; x += 2) {
                const y = centerY + Math.sin((x * wave.freq) + time + wave.phase) * wave.amp;
                if (x === 0) {
                    this.visualizerCtx.moveTo(x, y);
                } else {
                    this.visualizerCtx.lineTo(x, y);
                }
            }
            
            this.visualizerCtx.stroke();
        });
        
        // Add pulsing center dot
        const pulseRadius = 5 + Math.sin(time * 2) * 3;
        this.visualizerCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.visualizerCtx.beginPath();
        this.visualizerCtx.arc(width / 2, centerY, pulseRadius, 0, 2 * Math.PI);
        this.visualizerCtx.fill();
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #f56565, #e53e3e)';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    initializeAIFeatures() {
        // Setup AI-specific features
        this.setupAdvancedVisualizer();
        this.initializeAIControls();
    }
    
    bindAIFeatureEvents() {
        // AI Generation buttons
        const generateAIBtn = document.getElementById('generate-ai-composition');
        const harmonizeBtn = document.getElementById('harmonize-melody');
        const arrangeBtn = document.getElementById('arrange-song');
        const masterBtn = document.getElementById('master-track');
        
        if (generateAIBtn) {
            generateAIBtn.addEventListener('click', () => this.generateAIComposition());
        }
        if (harmonizeBtn) {
            harmonizeBtn.addEventListener('click', () => this.harmonizeMelody());
        }
        if (arrangeBtn) {
            arrangeBtn.addEventListener('click', () => this.arrangeSong());
        }
        if (masterBtn) {
            masterBtn.addEventListener('click', () => this.masterTrack());
        }
        
        // Advanced controls
        const complexitySlider = document.getElementById('complexity-slider');
        const energySlider = document.getElementById('energy-slider');
        const layersSlider = document.getElementById('layers-slider');
        
        if (complexitySlider) {
            complexitySlider.addEventListener('input', (e) => {
                const complexityValue = document.getElementById('complexity-value');
                if (complexityValue) complexityValue.textContent = e.target.value;
            });
        }
        
        if (energySlider) {
            energySlider.addEventListener('input', (e) => {
                const energyValue = document.getElementById('energy-value');
                if (energyValue) energyValue.textContent = e.target.value;
            });
        }
        
        if (layersSlider) {
            layersSlider.addEventListener('input', (e) => {
                const layersValue = document.getElementById('layers-value');
                if (layersValue) layersValue.textContent = e.target.value;
            });
        }
    }
    
    bindAIInputEvents() {
        // Tab switching functionality
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show/hide tab content
                tabContents.forEach(content => {
                    if (content.id === `${targetTab}-tab`) {
                        content.classList.remove('hidden');
                    } else {
                        content.classList.add('hidden');
                    }
                });
            });
        });
        
        // Text prompt suggestions
        const suggestionButtons = document.querySelectorAll('.suggestion-btn');
        const textPrompt = document.getElementById('textPrompt');
        
        suggestionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const prompt = button.getAttribute('data-prompt');
                if (textPrompt) {
                    textPrompt.value = prompt;
                    textPrompt.focus();
                }
            });
        });
        
        // Audio file input handling
        const audioInput = document.getElementById('audioInput');
        const fileInputDisplay = document.querySelector('.file-input-display .file-text');
        
        if (audioInput && fileInputDisplay) {
            audioInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileInputDisplay.textContent = `Selected: ${file.name}`;
                    this.handleAudioFileUpload(file);
                } else {
                    fileInputDisplay.textContent = 'Choose audio file or drag & drop';
                }
            });
        }
        
        // Extension duration slider
        const extensionDurationSlider = document.getElementById('extensionDuration');
        const extensionDurationValue = document.getElementById('extensionDurationValue');
        
        if (extensionDurationSlider && extensionDurationValue) {
            extensionDurationSlider.addEventListener('input', (e) => {
                extensionDurationValue.textContent = e.target.value + 's';
            });
        }
        
        // Drag and drop functionality for audio files
        const fileInputWrapper = document.querySelector('.file-input-wrapper');
        if (fileInputWrapper) {
            fileInputWrapper.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileInputWrapper.classList.add('drag-over');
            });
            
            fileInputWrapper.addEventListener('dragleave', (e) => {
                e.preventDefault();
                fileInputWrapper.classList.remove('drag-over');
            });
            
            fileInputWrapper.addEventListener('drop', (e) => {
                e.preventDefault();
                fileInputWrapper.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('audio/')) {
                    audioInput.files = files;
                    fileInputDisplay.textContent = `Selected: ${files[0].name}`;
                    this.handleAudioFileUpload(files[0]);
                }
            });
        }
    }
    
    initializeAIControls() {
        // Initialize AI-specific control values
        const complexitySlider = document.getElementById('complexity-slider');
        const energySlider = document.getElementById('energy-slider');
        const layersSlider = document.getElementById('layers-slider');
        
        if (complexitySlider) {
            const complexityValue = document.getElementById('complexity-value');
            if (complexityValue) complexityValue.textContent = complexitySlider.value;
        }
        
        if (energySlider) {
            const energyValue = document.getElementById('energy-value');
            if (energyValue) energyValue.textContent = energySlider.value;
        }
        
        if (layersSlider) {
            const layersValue = document.getElementById('layers-value');
            if (layersValue) layersValue.textContent = layersSlider.value;
        }
    }
    
    setupAdvancedVisualizer() {
        // Enhanced visualizer for AI features
        if (this.visualizer && this.musicGenerator.audioContext) {
            this.analyser = this.musicGenerator.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            // Connect to audio context when available
            if (this.musicGenerator.masterGain) {
                this.musicGenerator.masterGain.connect(this.analyser);
            }
        }
    }
    
    async generateAIComposition(settings) {
        try {
            console.log('Generating AI composition with settings:', settings);
            
            // Enhanced AI composition generation with style blending
            const aiSettings = {
                ...settings,
                complexity: this.getAIComplexity(),
                energy: this.getAIEnergy(),
                layers: this.getAILayers(),
                genre: this.getSelectedGenre(),
                structure: this.getSelectedStructure()
            };
            
            console.log('AI settings prepared:', aiSettings);
            
            // Apply style blending if secondary genre is selected
            if (settings.secondaryGenre && settings.secondaryGenre !== '') {
                console.log('Applying style blending:', settings.genre, 'with', settings.secondaryGenre);
                const blendedStyle = this.musicGenerator.blendGenreStyles(
                    settings.genre, 
                    settings.secondaryGenre, 
                    settings.blendRatio
                );
                aiSettings.blendedStyle = blendedStyle;
            }
            
            // Use advanced music generation with AI features
            console.log('Calling generateComposition...');
            const composition = this.musicGenerator.generateComposition(aiSettings);
            console.log('Composition generated:', composition);
            
            // Apply AI enhancements and style characteristics
            if (composition) {
                composition.aiEnhanced = true;
                composition.complexity = aiSettings.complexity;
                composition.energy = aiSettings.energy;
                composition.layers = aiSettings.layers;
                
                // Apply style-specific characteristics if blended style exists
                if (aiSettings.blendedStyle) {
                    console.log('Applying style characteristics...');
                    this.musicGenerator.applyStyleCharacteristics(composition, aiSettings.blendedStyle);
                }
                
                console.log('AI composition completed successfully');
            } else {
                console.error('generateComposition returned null/undefined');
            }
            
            return composition;
        } catch (error) {
            console.error('Error in generateAIComposition:', error);
            throw error;
        }
    }
    
    async harmonizeMelody() {
        if (!this.currentComposition) {
            this.showError('Generate a composition first');
            return;
        }
        
        try {
            // Apply AI harmonization
            const harmonizedComposition = await this.musicGenerator.harmonizeComposition(
                this.currentComposition,
                this.getSettings()
            );
            
            this.currentComposition = harmonizedComposition;
            this.showSuccess('Applied AI harmonization to melody');
        } catch (error) {
            console.error('Error harmonizing melody:', error);
            this.showError('Failed to harmonize melody');
        }
    }
    
    async arrangeSong() {
        if (!this.currentComposition) {
            this.showError('Generate a composition first');
            return;
        }
        
        try {
            // Apply intelligent arrangement
            const arrangedComposition = await this.musicGenerator.arrangeComposition(
                this.currentComposition,
                {
                    energy: this.getAIEnergy(),
                    layers: this.getAILayers(),
                    structure: this.getSelectedStructure()
                }
            );
            
            this.currentComposition = arrangedComposition;
            this.showSuccess('Applied intelligent song arrangement');
        } catch (error) {
            console.error('Error arranging song:', error);
            this.showError('Failed to arrange song');
        }
    }
    
    async masterTrack() {
        if (!this.currentComposition) {
            this.showError('Generate a composition first');
            return;
        }
        
        try {
            // Apply AI mastering
            const masteredComposition = await this.musicGenerator.masterComposition(
                this.currentComposition,
                {
                    compression: this.getCompressionLevel(),
                    eq: this.getEQSettings(),
                    stereoWidth: this.getStereoWidth()
                }
            );
            
            this.currentComposition = masteredComposition;
            this.showSuccess('Applied AI mastering to track');
        } catch (error) {
            console.error('Error mastering track:', error);
            this.showError('Failed to master track');
        }
    }
    
    getAIComplexity() {
        const complexitySlider = document.getElementById('complexity-slider');
        return complexitySlider ? parseFloat(complexitySlider.value) : 0.5;
    }
    
    getAIEnergy() {
        const energySlider = document.getElementById('energy-slider');
        return energySlider ? parseFloat(energySlider.value) : 0.5;
    }
    
    getAILayers() {
        const layersSlider = document.getElementById('layers-slider');
        return layersSlider ? parseInt(layersSlider.value) : 3;
    }
    
    getSelectedGenre() {
        const genreSelect = document.getElementById('genre-select');
        return genreSelect ? genreSelect.value : 'pop';
    }
    
    getSelectedStructure() {
        const structureSelect = document.getElementById('structure-select');
        return structureSelect ? structureSelect.value : 'verse-chorus';
    }
    
    getCompressionLevel() {
        const compressionSlider = document.getElementById('compression-slider');
        return compressionSlider ? parseFloat(compressionSlider.value) : 0.5;
    }
    
    getEQSettings() {
        return {
            low: 1.0,
            mid: 1.0,
            high: 1.0
        };
    }
    
    getStereoWidth() {
        return 1.0;
    }
    
    // AI Input Generation Methods
    async generateFromTextPrompt(prompt) {
        try {
            this.showNotification('Analyzing text prompt...', 'info');
            
            // Parse the text prompt to extract musical characteristics
            const musicParams = this.parseTextPrompt(prompt);
            
            // Generate settings based on the parsed prompt
            const settings = this.createSettingsFromPrompt(musicParams);
            
            // Generate the composition
            this.currentComposition = await this.generateAIComposition(settings);
            
            if (!this.currentComposition) {
                this.showError('Failed to generate music from text prompt. Please try again.');
                return;
            }
            
            this.compositionDuration = settings.length;
            
            // Enable controls
            this.stopBtn.disabled = false;
            this.downloadBtn.disabled = false;
            this.playPauseBtn.disabled = false;
            
            // Auto-play the generated music
            await this.playMusic();
            
            this.showSuccess(`Music generated from prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
            
        } catch (error) {
            console.error('Error generating music from text prompt:', error);
            this.showError('Failed to generate music from text prompt. Please try again.');
        }
    }
    
    parseTextPrompt(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        const params = {
            genre: 'electronic',
            tempo: 120,
            energy: 0.5,
            complexity: 'moderate',
            instruments: { piano: true, strings: false, drums: true, bass: true },
            mood: 'neutral',
            structure: 'verse-chorus',
            key: 'C'
        };
        
        // Genre detection
        if (lowerPrompt.includes('piano') || lowerPrompt.includes('ballad') || lowerPrompt.includes('classical')) {
            params.genre = 'classical';
            params.instruments.piano = true;
            params.instruments.strings = true;
            params.instruments.drums = false;
        } else if (lowerPrompt.includes('rock') || lowerPrompt.includes('guitar')) {
            params.genre = 'rock';
            params.instruments.drums = true;
            params.instruments.bass = true;
        } else if (lowerPrompt.includes('electronic') || lowerPrompt.includes('edm') || lowerPrompt.includes('dance')) {
            params.genre = 'electronic';
            params.instruments.piano = false;
            params.instruments.strings = false;
        } else if (lowerPrompt.includes('jazz')) {
            params.genre = 'jazz';
            params.complexity = 'jazz';
            params.instruments.piano = true;
            params.instruments.bass = true;
        } else if (lowerPrompt.includes('ambient') || lowerPrompt.includes('atmospheric')) {
            params.genre = 'ambient';
            params.tempo = 80;
            params.energy = 0.3;
            params.instruments.strings = true;
            params.instruments.drums = false;
        }
        
        // Tempo detection
        if (lowerPrompt.includes('slow') || lowerPrompt.includes('peaceful') || lowerPrompt.includes('relaxing')) {
            params.tempo = 80;
        } else if (lowerPrompt.includes('fast') || lowerPrompt.includes('upbeat') || lowerPrompt.includes('energetic')) {
            params.tempo = 140;
        } else if (lowerPrompt.includes('moderate') || lowerPrompt.includes('medium')) {
            params.tempo = 120;
        }
        
        // Energy detection
        if (lowerPrompt.includes('calm') || lowerPrompt.includes('peaceful') || lowerPrompt.includes('gentle')) {
            params.energy = 0.3;
        } else if (lowerPrompt.includes('energetic') || lowerPrompt.includes('powerful') || lowerPrompt.includes('intense')) {
            params.energy = 0.8;
        } else if (lowerPrompt.includes('upbeat') || lowerPrompt.includes('lively')) {
            params.energy = 0.7;
        }
        
        // Complexity detection
        if (lowerPrompt.includes('simple') || lowerPrompt.includes('minimal')) {
            params.complexity = 'simple';
        } else if (lowerPrompt.includes('complex') || lowerPrompt.includes('intricate')) {
            params.complexity = 'complex';
        } else if (lowerPrompt.includes('jazz')) {
            params.complexity = 'jazz';
        }
        
        return params;
    }
    
    createSettingsFromPrompt(params) {
        return {
            key: params.key,
            tempo: params.tempo,
            complexity: params.complexity,
            genre: params.genre,
            secondaryGenre: '',
            blendRatio: 30,
            energy: Math.round(params.energy * 100),
            songStructure: params.structure,
            length: 30,
            instruments: params.instruments
        };
    }
    
    async generateFromAudioInput(audioFile) {
        try {
            this.showNotification('Analyzing audio file...', 'info');
            
            // Get extension mode
            const extensionMode = document.querySelector('input[name="extensionMode"]:checked')?.value || 'extend-end';
            const extensionDuration = parseInt(document.getElementById('extensionDuration')?.value || '30');
            
            // Analyze the audio file
            const audioAnalysis = await this.analyzeAudioFile(audioFile);
            
            if (!audioAnalysis) {
                this.showError('Failed to analyze audio file. Please try a different file.');
                return;
            }
            
            // Generate music based on the analysis and extension mode
            await this.generateFromAudioAnalysis(audioAnalysis, extensionMode, extensionDuration);
            
        } catch (error) {
            console.error('Error generating music from audio input:', error);
            this.showError('Failed to generate music from audio input. Please try again.');
        }
    }
    
    async analyzeAudioFile(audioFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                    
                    // Analyze the audio buffer
                    const analysis = this.performAudioAnalysis(audioBuffer);
                    resolve(analysis);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(audioFile);
        });
    }
    
    performAudioAnalysis(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        
        // Basic tempo detection (simplified)
        const tempo = this.detectTempo(channelData, sampleRate);
        
        // Key detection (simplified)
        const key = this.detectKey(channelData, sampleRate);
        
        // Energy analysis
        const energy = this.calculateEnergy(channelData);
        
        // Spectral analysis for genre hints
        const spectralFeatures = this.analyzeSpectralFeatures(channelData, sampleRate);
        
        return {
            tempo: tempo,
            key: key,
            energy: energy,
            duration: duration,
            spectralFeatures: spectralFeatures,
            originalBuffer: audioBuffer
        };
    }
    
    detectTempo(channelData, sampleRate) {
        // Simplified tempo detection - in a real implementation, this would be more sophisticated
        // For now, return a reasonable default based on energy patterns
        const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
        let avgEnergy = 0;
        let peakCount = 0;
        
        for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
            let windowEnergy = 0;
            for (let j = 0; j < windowSize; j++) {
                windowEnergy += Math.abs(channelData[i + j]);
            }
            windowEnergy /= windowSize;
            
            if (windowEnergy > avgEnergy * 1.2) {
                peakCount++;
            }
            avgEnergy = (avgEnergy + windowEnergy) / 2;
        }
        
        const estimatedTempo = Math.min(Math.max((peakCount / (channelData.length / sampleRate)) * 60, 60), 180);
        return Math.round(estimatedTempo);
    }
    
    detectKey(channelData, sampleRate) {
        // Simplified key detection - return a reasonable default
        // In a real implementation, this would use FFT and chromagram analysis
        const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
        return keys[Math.floor(Math.random() * keys.length)];
    }
    
    calculateEnergy(channelData) {
        let totalEnergy = 0;
        for (let i = 0; i < channelData.length; i++) {
            totalEnergy += channelData[i] * channelData[i];
        }
        return Math.min(totalEnergy / channelData.length * 1000, 1.0);
    }
    
    analyzeSpectralFeatures(channelData, sampleRate) {
        // Simplified spectral analysis
        return {
            brightness: Math.random() * 0.5 + 0.3, // Placeholder
            spectralCentroid: Math.random() * 2000 + 1000, // Placeholder
            spectralRolloff: Math.random() * 5000 + 3000 // Placeholder
        };
    }
    
    async generateFromAudioAnalysis(analysis, extensionMode, extensionDuration) {
        try {
            let settings;
            
            switch (extensionMode) {
                case 'extend-end':
                    settings = this.createExtensionSettings(analysis, extensionDuration);
                    this.showNotification(`Extending audio at the end for ${extensionDuration}s...`, 'info');
                    break;
                case 'extend-start':
                    settings = this.createExtensionSettings(analysis, extensionDuration);
                    this.showNotification(`Extending audio at the start for ${extensionDuration}s...`, 'info');
                    break;
                case 'analyze-style':
                    settings = this.createStyleBasedSettings(analysis);
                    this.showNotification('Generating similar style music...', 'info');
                    break;
                default:
                    settings = this.createExtensionSettings(analysis, extensionDuration);
            }
            
            // Generate the composition
            this.currentComposition = await this.generateAIComposition(settings);
            
            if (!this.currentComposition) {
                this.showError('Failed to generate music from audio analysis. Please try again.');
                return;
            }
            
            this.compositionDuration = settings.length;
            
            // Enable controls
            this.stopBtn.disabled = false;
            this.downloadBtn.disabled = false;
            this.playPauseBtn.disabled = false;
            
            // Auto-play the generated music
            await this.playMusic();
            
            this.showSuccess(`Music generated successfully using ${extensionMode} mode!`);
            
        } catch (error) {
            console.error('Error generating music from audio analysis:', error);
            this.showError('Failed to generate music from audio analysis. Please try again.');
        }
    }
    
    createExtensionSettings(analysis, duration) {
        return {
            key: analysis.key,
            tempo: analysis.tempo,
            complexity: analysis.energy > 0.6 ? 'complex' : 'moderate',
            genre: this.inferGenreFromAnalysis(analysis),
            secondaryGenre: '',
            blendRatio: 30,
            energy: Math.round(analysis.energy * 100),
            songStructure: 'verse-chorus',
            length: duration,
            instruments: this.selectInstrumentsFromAnalysis(analysis)
        };
    }
    
    createStyleBasedSettings(analysis) {
        return {
            key: analysis.key,
            tempo: analysis.tempo,
            complexity: analysis.energy > 0.6 ? 'complex' : 'moderate',
            genre: this.inferGenreFromAnalysis(analysis),
            secondaryGenre: '',
            blendRatio: 30,
            energy: Math.round(analysis.energy * 100),
            songStructure: 'verse-chorus',
            length: 60, // Generate a full minute for style-based generation
            instruments: this.selectInstrumentsFromAnalysis(analysis)
        };
    }
    
    inferGenreFromAnalysis(analysis) {
        // Simple genre inference based on spectral features and energy
        if (analysis.energy > 0.7) {
            return 'rock';
        } else if (analysis.spectralFeatures.brightness > 0.6) {
            return 'electronic';
        } else if (analysis.energy < 0.4) {
            return 'ambient';
        } else {
            return 'pop';
        }
    }
    
    selectInstrumentsFromAnalysis(analysis) {
        const instruments = { piano: false, strings: false, drums: false, bass: false };
        
        // Select instruments based on analysis
        if (analysis.energy > 0.5) {
            instruments.drums = true;
            instruments.bass = true;
        }
        
        if (analysis.spectralFeatures.brightness < 0.5) {
            instruments.piano = true;
            instruments.strings = true;
        }
        
        // Ensure at least one instrument is selected
        if (!Object.values(instruments).some(enabled => enabled)) {
            instruments.piano = true;
            instruments.drums = true;
        }
        
        return instruments;
    }
    
    async handleAudioFileUpload(file) {
        try {
            this.showNotification(`Audio file "${file.name}" uploaded successfully!`, 'success');
            
            // Optionally, you could perform immediate analysis here
            // const analysis = await this.analyzeAudioFile(file);
            // console.log('Audio analysis:', analysis);
            
        } catch (error) {
            console.error('Error handling audio file upload:', error);
            this.showError('Failed to process audio file. Please try again.');
        }
    }
}

// Initialize the AI Composer when the page loads and expose it globally
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AIComposer();
});