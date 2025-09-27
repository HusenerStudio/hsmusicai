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
        this.keySelect = document.getElementById('key-select');
        this.tempoSlider = document.getElementById('tempo-slider');
        this.tempoValue = document.getElementById('tempo-value');
        this.styleSelect = document.getElementById('style-select');
        this.lengthSlider = document.getElementById('length-slider');
        this.lengthValue = document.getElementById('length-value');
        
        // Instrument toggles
        this.pianoToggle = document.getElementById('piano-toggle');
        this.stringsToggle = document.getElementById('strings-toggle');
        this.bassToggle = document.getElementById('bass-toggle');
        this.drumsToggle = document.getElementById('drums-toggle');
        
        // Control buttons
        this.generateBtn = document.getElementById('generate-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        
        // Visualization elements
        this.visualizer = document.getElementById('visualizer');
        this.visualizerCtx = this.visualizer.getContext('2d');
        this.progressFill = document.querySelector('.progress-fill');
        
        // Set canvas size
        this.visualizer.width = 800;
        this.visualizer.height = 200;
    }
    
    bindEvents() {
        // Slider updates
        this.tempoSlider.addEventListener('input', (e) => {
            this.tempoValue.textContent = e.target.value;
        });
        
        this.lengthSlider.addEventListener('input', (e) => {
            this.lengthValue.textContent = e.target.value;
        });
        
        // Button events
        this.generateBtn.addEventListener('click', () => this.generateMusic());
        this.stopBtn.addEventListener('click', () => this.stopMusic());
        this.downloadBtn.addEventListener('click', () => this.downloadMusic());
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
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
        return {
            key: this.keySelect.value,
            tempo: parseInt(this.tempoSlider.value),
            style: this.styleSelect.value,
            length: parseInt(this.lengthSlider.value),
            instruments: {
                piano: this.pianoToggle.checked,
                strings: this.stringsToggle.checked,
                bass: this.bassToggle.checked,
                drums: this.drumsToggle.checked
            }
        };
    }
    
    async generateMusic() {
        if (!this.isInitialized) {
            await this.initializeAudio();
        }
        
        if (!this.isInitialized) {
            return;
        }
        
        // Show loading state
        this.generateBtn.classList.add('loading');
        this.generateBtn.disabled = true;
        
        try {
            const settings = this.getSettings();
            
            // Validate that at least one instrument is selected
            const hasInstruments = Object.values(settings.instruments).some(enabled => enabled);
            if (!hasInstruments) {
                this.showError('Please select at least one instrument.');
                return;
            }
            
            // Generate AI-enhanced composition
            this.currentComposition = await this.generateAIComposition(settings);
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
    
    async downloadMusic() {
        if (!this.currentComposition || !this.isInitialized) {
            this.showError('No music to download. Please generate music first.');
            return;
        }
        
        try {
            const settings = this.getSettings();
            
            // Show loading state
            this.downloadBtn.disabled = true;
            this.downloadBtn.textContent = 'Preparing...';
            
            // Export to WAV (simplified implementation)
            const blob = await this.musicGenerator.exportToWAV(
                this.currentComposition, 
                settings.instruments, 
                settings.length
            );
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hs-music-ai-${Date.now()}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Music downloaded successfully!');
            
        } catch (error) {
            console.error('Error downloading music:', error);
            this.showError('Failed to download music. Please try again.');
        } finally {
            // Reset button state
            this.downloadBtn.disabled = false;
            this.downloadBtn.textContent = 'Download';
        }
    }
    
    startVisualization() {
        const draw = () => {
            this.animationId = requestAnimationFrame(draw);
            
            // Clear canvas
            this.visualizerCtx.fillStyle = '#1a202c';
            this.visualizerCtx.fillRect(0, 0, this.visualizer.width, this.visualizer.height);
            
            // Get audio data
            const dataArray = this.musicGenerator.getAnalyserData();
            
            if (dataArray && this.isPlaying) {
                // Draw frequency bars
                const barWidth = this.visualizer.width / dataArray.length;
                let x = 0;
                
                for (let i = 0; i < dataArray.length; i++) {
                    const barHeight = (dataArray[i] / 255) * this.visualizer.height * 0.8;
                    
                    // Create gradient
                    const gradient = this.visualizerCtx.createLinearGradient(0, this.visualizer.height, 0, this.visualizer.height - barHeight);
                    gradient.addColorStop(0, '#667eea');
                    gradient.addColorStop(1, '#764ba2');
                    
                    this.visualizerCtx.fillStyle = gradient;
                    this.visualizerCtx.fillRect(x, this.visualizer.height - barHeight, barWidth - 1, barHeight);
                    
                    x += barWidth;
                }
            } else {
                // Draw idle animation
                const time = Date.now() * 0.002;
                const centerY = this.visualizer.height / 2;
                
                this.visualizerCtx.strokeStyle = '#667eea';
                this.visualizerCtx.lineWidth = 2;
                this.visualizerCtx.beginPath();
                
                for (let x = 0; x < this.visualizer.width; x += 2) {
                    const y = centerY + Math.sin((x * 0.01) + time) * 20 + Math.sin((x * 0.02) + time * 1.5) * 10;
                    if (x === 0) {
                        this.visualizerCtx.moveTo(x, y);
                    } else {
                        this.visualizerCtx.lineTo(x, y);
                    }
                }
                
                this.visualizerCtx.stroke();
            }
        };
        
        draw();
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
        // Enhanced AI composition generation
        const aiSettings = {
            ...settings,
            complexity: this.getAIComplexity(),
            energy: this.getAIEnergy(),
            layers: this.getAILayers(),
            genre: this.getSelectedGenre(),
            structure: this.getSelectedStructure()
        };
        
        // Use advanced music generation with AI features
        const composition = this.musicGenerator.generateComposition(aiSettings);
        
        // Apply AI enhancements
        if (composition) {
            composition.aiEnhanced = true;
            composition.complexity = aiSettings.complexity;
            composition.energy = aiSettings.energy;
            composition.layers = aiSettings.layers;
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