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
        
        // Control buttons
        this.generateBtn = document.getElementById('generateBtn');
        this.playBtn = document.getElementById('playBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Visualization elements
        this.visualizer = document.getElementById('visualizer');
        this.visualizerCtx = this.visualizer ? this.visualizer.getContext('2d') : null;
        this.status = document.getElementById('status');
        
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
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.playMusic());
        }
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stopMusic());
        }
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.downloadMusic());
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
        
        // Reset progress
        this.progressFill.style.width = '0%';
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
            if (this.isPlaying && this.compositionDuration > 0) {
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
            
            let exportedData;
            let filename;
            let mimeType;

            switch (format) {
                case 'wav':
                    exportedData = await this.musicGenerator.exportToWAV(
                        this.currentComposition, 
                        settings.instruments, 
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
                        settings.instruments, 
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
        // Enhanced AI composition generation with style blending
        const aiSettings = {
            ...settings,
            complexity: this.getAIComplexity(),
            energy: this.getAIEnergy(),
            layers: this.getAILayers(),
            genre: this.getSelectedGenre(),
            structure: this.getSelectedStructure()
        };
        
        // Apply style blending if secondary genre is selected
        if (settings.secondaryGenre && settings.secondaryGenre !== '') {
            const blendedStyle = this.musicGenerator.blendGenreStyles(
                settings.genre, 
                settings.secondaryGenre, 
                settings.blendRatio
            );
            aiSettings.blendedStyle = blendedStyle;
        }
        
        // Use advanced music generation with AI features
        const composition = this.musicGenerator.generateComposition(aiSettings);
        
        // Apply AI enhancements and style characteristics
        if (composition) {
            composition.aiEnhanced = true;
            composition.complexity = aiSettings.complexity;
            composition.energy = aiSettings.energy;
            composition.layers = aiSettings.layers;
            
            // Apply style-specific characteristics if blended style exists
            if (aiSettings.blendedStyle) {
                this.musicGenerator.applyStyleCharacteristics(composition, aiSettings.blendedStyle);
            }
        }
        
        return composition;
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
}

// Initialize the AI Composer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AIComposer();
});