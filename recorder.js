class AudioRecorder {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.destination = null;
    }
    
    async startRecording() {
        try {
            // Create a destination node for recording
            this.destination = this.audioContext.createMediaStreamDestination();
            
            // Set up MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.destination.stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            return this.destination;
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }
    
    stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || !this.isRecording) {
                resolve(null);
                return;
            }
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                this.isRecording = false;
                resolve(blob);
            };
            
            this.mediaRecorder.stop();
        });
    }
    
    // Convert WebM to WAV (simplified - in production you'd want a proper converter)
    async convertToWAV(webmBlob) {
        // For now, we'll return the WebM blob as-is
        // In a production app, you'd use a library like lamejs or ffmpeg.wasm
        return webmBlob;
    }
}

// Enhanced WAV encoder for better audio export
class WAVEncoder {
    constructor(sampleRate = 44100, numChannels = 2) {
        this.sampleRate = sampleRate;
        this.numChannels = numChannels;
        this.bytesPerSample = 2;
    }
    
    encodeWAV(audioBuffer) {
        const length = audioBuffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * this.numChannels * this.bytesPerSample);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        let pos = 0;
        
        // RIFF chunk descriptor
        writeString(pos, 'RIFF'); pos += 4;
        view.setUint32(pos, 36 + length * this.numChannels * this.bytesPerSample, true); pos += 4;
        writeString(pos, 'WAVE'); pos += 4;
        
        // FMT sub-chunk
        writeString(pos, 'fmt '); pos += 4;
        view.setUint32(pos, 16, true); pos += 4; // Sub-chunk size
        view.setUint16(pos, 1, true); pos += 2; // Audio format (PCM)
        view.setUint16(pos, this.numChannels, true); pos += 2;
        view.setUint32(pos, this.sampleRate, true); pos += 4;
        view.setUint32(pos, this.sampleRate * this.numChannels * this.bytesPerSample, true); pos += 4;
        view.setUint16(pos, this.numChannels * this.bytesPerSample, true); pos += 2;
        view.setUint16(pos, this.bytesPerSample * 8, true); pos += 2;
        
        // Data sub-chunk
        writeString(pos, 'data'); pos += 4;
        view.setUint32(pos, length * this.numChannels * this.bytesPerSample, true); pos += 4;
        
        // Audio data
        const channels = [];
        for (let i = 0; i < this.numChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }
        
        let offset = pos;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < this.numChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, channels[channel][i]));
                view.setInt16(offset, sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
    
    // Create an audio buffer from generated music data
    createAudioBuffer(audioContext, composition, instruments, duration) {
        const sampleRate = audioContext.sampleRate;
        const numSamples = Math.floor(duration * sampleRate);
        const audioBuffer = audioContext.createBuffer(2, numSamples, sampleRate);
        
        // This is a simplified implementation
        // In practice, you'd render the composition to the buffer
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = audioBuffer.getChannelData(1);
        
        // Generate silence for now - in a real implementation,
        // you'd render the actual composition
        for (let i = 0; i < numSamples; i++) {
            leftChannel[i] = 0;
            rightChannel[i] = 0;
        }
        
        return audioBuffer;
    }
}

// Offline audio renderer for high-quality exports
class OfflineRenderer {
    constructor() {
        this.offlineContext = null;
    }
    
    async renderComposition(composition, instruments, settings) {
        const { length, tempo } = settings;
        const sampleRate = 44100;
        const duration = length;
        
        // Create offline audio context
        this.offlineContext = new OfflineAudioContext(2, duration * sampleRate, sampleRate);
        
        // Create master gain
        const masterGain = this.offlineContext.createGain();
        masterGain.connect(this.offlineContext.destination);
        masterGain.gain.value = 0.3;
        
        // Render each part of the composition
        await this.renderMelody(composition.melody, instruments.piano, masterGain);
        await this.renderChords(composition.chords, instruments.piano, masterGain);
        await this.renderBass(composition.bass, instruments.bass, masterGain);
        await this.renderStrings(composition.chords, instruments.strings, masterGain);
        await this.renderDrums(composition.drums, instruments.drums, masterGain);
        
        // Render the audio
        const renderedBuffer = await this.offlineContext.startRendering();
        return renderedBuffer;
    }
    
    async renderMelody(melody, enabled, destination) {
        if (!enabled || !melody) return;
        
        melody.forEach(note => {
            this.createOfflineOscillator(
                note.frequency, 
                'triangle', 
                note.startTime, 
                note.duration, 
                note.velocity * 0.6,
                destination
            );
        });
    }
    
    async renderChords(chords, enabled, destination) {
        if (!enabled || !chords) return;
        
        chords.forEach(note => {
            this.createOfflineOscillator(
                note.frequency, 
                'triangle', 
                note.startTime, 
                note.duration, 
                note.velocity * 0.4,
                destination
            );
        });
    }
    
    async renderBass(bass, enabled, destination) {
        if (!enabled || !bass) return;
        
        bass.forEach(note => {
            this.createOfflineOscillator(
                note.frequency / 2, 
                'square', 
                note.startTime, 
                note.duration, 
                note.velocity * 0.7,
                destination
            );
        });
    }
    
    async renderStrings(chords, enabled, destination) {
        if (!enabled || !chords) return;
        
        chords.forEach(note => {
            this.createOfflineOscillator(
                note.frequency, 
                'sawtooth', 
                note.startTime, 
                note.duration * 1.5, 
                note.velocity * 0.3,
                destination
            );
        });
    }
    
    async renderDrums(drums, enabled, destination) {
        if (!enabled || !drums) return;
        
        drums.forEach(hit => {
            this.createOfflineDrum(hit.type, hit.startTime, hit.velocity, destination);
        });
    }
    
    createOfflineOscillator(frequency, type, startTime, duration, velocity, destination) {
        const oscillator = this.offlineContext.createOscillator();
        const gainNode = this.offlineContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // ADSR envelope
        const attackTime = 0.1;
        const decayTime = 0.2;
        const sustainLevel = 0.7;
        const releaseTime = 0.3;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(velocity, startTime + attackTime);
        gainNode.gain.linearRampToValueAtTime(sustainLevel * velocity, startTime + attackTime + decayTime);
        gainNode.gain.setValueAtTime(sustainLevel * velocity, startTime + duration - releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
    
    createOfflineDrum(type, startTime, velocity, destination) {
        if (type === 'kick') {
            const oscillator = this.offlineContext.createOscillator();
            const gainNode = this.offlineContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(60, startTime);
            oscillator.frequency.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            
            gainNode.gain.setValueAtTime(velocity, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(destination);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.5);
        }
        // Add other drum types as needed
    }
}