class MusicGenerator {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.analyser = null;
        this.isPlaying = false;
        this.currentComposition = null;
        this.scheduledNotes = [];
        this.startTime = 0;
        
        // Advanced synthesis components
        this.wavetables = {};
        this.effectsChain = {};
        this.compressor = null;
        this.reverb = null;
        this.delay = null;
        this.chorus = null;
        
        // Enhanced music theory
        this.advancedTheory = new AdvancedMusicTheory();
        this.harmonicRhythm = new AdvancedHarmonicRhythm();
        
        // Dynamic Song Structure Generation
        this.songStructures = {
            simple: ['verse', 'chorus', 'verse', 'chorus'],
            extended: ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus'],
            complex: ['intro', 'verse', 'prechorus', 'chorus', 'verse', 'prechorus', 'chorus', 'bridge', 'chorus', 'outro'],
            instrumental: ['intro', 'theme', 'variation1', 'theme', 'variation2', 'development', 'theme', 'outro']
        };

        this.sectionTemplates = {
            intro: { duration: 8, energy: 0.3, complexity: 'simple', instruments: ['piano'] },
            verse: { duration: 16, energy: 0.6, complexity: 'moderate', instruments: ['piano', 'bass'] },
            prechorus: { duration: 8, energy: 0.8, complexity: 'moderate', instruments: ['piano', 'bass', 'strings'] },
            chorus: { duration: 16, energy: 1.0, complexity: 'complex', instruments: ['piano', 'bass', 'strings', 'drums'] },
            bridge: { duration: 16, energy: 0.7, complexity: 'complex', instruments: ['strings', 'piano'] },
            outro: { duration: 8, energy: 0.4, complexity: 'simple', instruments: ['piano'] },
            theme: { duration: 16, energy: 0.8, complexity: 'moderate', instruments: ['piano', 'strings'] },
            variation1: { duration: 16, energy: 0.9, complexity: 'complex', instruments: ['piano', 'strings', 'bass'] },
            variation2: { duration: 16, energy: 0.7, complexity: 'moderate', instruments: ['strings', 'piano'] },
            development: { duration: 24, energy: 0.9, complexity: 'complex', instruments: ['piano', 'strings', 'bass', 'drums'] }
        };

        // Genre-specific templates
        this.genreTemplates = {
            pop: {
                chordProgressions: [
                    ['I', 'V', 'vi', 'IV'],
                    ['vi', 'IV', 'I', 'V'],
                    ['I', 'vi', 'IV', 'V']
                ],
                rhythmPatterns: ['pop', 'dance'],
                instruments: ['piano', 'bass', 'drums', 'strings'],
                tempo: [100, 140],
                energy: 0.8
            },
            rock: {
                chordProgressions: [
                    ['I', 'bVII', 'IV', 'I'],
                    ['vi', 'IV', 'I', 'V'],
                    ['I', 'V', 'vi', 'IV']
                ],
                rhythmPatterns: ['rock', 'driving'],
                instruments: ['guitar', 'bass', 'drums'],
                tempo: [120, 160],
                energy: 0.9
            },
            jazz: {
                chordProgressions: [
                    ['IIM7', 'V7', 'IM7', 'VIM7'],
                    ['IM7', 'VIM7', 'IIM7', 'V7'],
                    ['IIIM7', 'VIM7', 'IIM7', 'V7']
                ],
                rhythmPatterns: ['swing', 'latin'],
                instruments: ['piano', 'bass', 'drums'],
                tempo: [80, 140],
                energy: 0.7
            },
            classical: {
                chordProgressions: [
                    ['I', 'IV', 'V', 'I'],
                    ['I', 'vi', 'IV', 'V'],
                    ['I', 'V', 'vi', 'IV']
                ],
                rhythmPatterns: ['classical', 'waltz'],
                instruments: ['piano', 'strings'],
                tempo: [60, 120],
                energy: 0.6
            },
            electronic: {
                chordProgressions: [
                    ['vi', 'IV', 'I', 'V'],
                    ['I', 'V', 'vi', 'IV'],
                    ['vi', 'I', 'IV', 'V']
                ],
                rhythmPatterns: ['electronic', 'techno'],
                instruments: ['synth', 'bass', 'drums'],
                tempo: [120, 140],
                energy: 0.9
            },
            ambient: {
                chordProgressions: [
                    ['I', 'vi', 'IV', 'V'],
                    ['vi', 'IV', 'I', 'V'],
                    ['I', 'IV', 'vi', 'V']
                ],
                rhythmPatterns: ['ambient', 'floating'],
                instruments: ['piano', 'strings', 'synth'],
                tempo: [60, 90],
                energy: 0.4
            },
            cinematic: {
                chordProgressions: [
                    ['i', 'bVI', 'bVII', 'i'],
                    ['i', 'iv', 'V', 'i'],
                    ['i', 'bII', 'V', 'i']
                ],
                rhythmPatterns: ['cinematic', 'epic'],
                instruments: ['strings', 'piano', 'brass'],
                tempo: [70, 110],
                energy: 0.8
            }
        };
        
        this.initializeWavetables();
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master effects chain
            await this.createEffectsChain();
            
            // Create analyser for visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            
            // Initialize data array for analyser
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            // Connect effects chain to analyser and destination
            this.effectsChain.output.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            console.log('Advanced Music Generator initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            return false;
        }
    }

    async createEffectsChain() {
        // Create compressor for professional dynamics
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
        this.compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);

        // Create reverb using convolution
        this.reverb = await this.createConvolutionReverb();
        
        // Create delay effect
        this.delay = this.createDelay();
        
        // Create chorus effect
        this.chorus = this.createChorus();
        
        // Create master gain
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
        
        // Connect effects chain: input -> compressor -> reverb -> delay -> chorus -> master -> output
        this.effectsChain = {
            input: this.compressor,
            output: this.masterGain
        };
        
        this.compressor.connect(this.reverb.input);
        this.reverb.output.connect(this.delay.input);
        this.delay.output.connect(this.chorus.input);
        this.chorus.output.connect(this.masterGain);
    }

    async createConvolutionReverb() {
        const convolver = this.audioContext.createConvolver();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const input = this.audioContext.createGain();
        const output = this.audioContext.createGain();
        
        // Create impulse response for hall reverb
        const length = this.audioContext.sampleRate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                channelData[i] = (Math.random() * 2 - 1) * decay;
            }
        }
        
        convolver.buffer = impulse;
        
        // Set up wet/dry mix
        wetGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
        
        // Connect reverb chain
        input.connect(convolver);
        input.connect(dryGain);
        convolver.connect(wetGain);
        wetGain.connect(output);
        dryGain.connect(output);
        
        return { input, output };
    }

    createDelay() {
        const delayNode = this.audioContext.createDelay(0.5);
        const feedback = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const input = this.audioContext.createGain();
        const output = this.audioContext.createGain();
        
        // Set delay parameters
        delayNode.delayTime.setValueAtTime(0.25, this.audioContext.currentTime);
        feedback.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        wetGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
        
        // Connect delay chain
        input.connect(delayNode);
        input.connect(dryGain);
        delayNode.connect(feedback);
        delayNode.connect(wetGain);
        feedback.connect(delayNode);
        wetGain.connect(output);
        dryGain.connect(output);
        
        return { input, output };
    }

    createChorus() {
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        const delay = this.audioContext.createDelay(0.1);
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const input = this.audioContext.createGain();
        const output = this.audioContext.createGain();
        
        // Set chorus parameters
        lfo.frequency.setValueAtTime(0.5, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(0.005, this.audioContext.currentTime);
        delay.delayTime.setValueAtTime(0.02, this.audioContext.currentTime);
        wetGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        dryGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
        
        // Connect chorus chain
        lfo.connect(lfoGain);
        lfoGain.connect(delay.delayTime);
        input.connect(delay);
        input.connect(dryGain);
        delay.connect(wetGain);
        wetGain.connect(output);
        dryGain.connect(output);
        
        lfo.start();
        
        return { input, output };
    }

    initializeWavetables() {
        const size = 2048;
        
        this.wavetables = {
            sine: this.createWavetable(size, (i, size) => Math.sin(2 * Math.PI * i / size)),
            saw: this.createWavetable(size, (i, size) => 2 * (i / size) - 1),
            square: this.createWavetable(size, (i, size) => i < size / 2 ? 1 : -1),
            triangle: this.createWavetable(size, (i, size) => {
                const phase = i / size;
                return phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
            }),
            warm: this.createWavetable(size, (i, size) => {
                const fundamental = Math.sin(2 * Math.PI * i / size);
                const harmonic2 = 0.5 * Math.sin(4 * Math.PI * i / size);
                const harmonic3 = 0.25 * Math.sin(6 * Math.PI * i / size);
                return fundamental + harmonic2 + harmonic3;
            }),
            bright: this.createWavetable(size, (i, size) => {
                let sum = 0;
                for (let h = 1; h <= 8; h++) {
                    sum += (1 / h) * Math.sin(2 * Math.PI * h * i / size);
                }
                return sum;
            }),
            hollow: this.createWavetable(size, (i, size) => {
                const fundamental = Math.sin(2 * Math.PI * i / size);
                const harmonic5 = 0.3 * Math.sin(10 * Math.PI * i / size);
                return fundamental + harmonic5;
            })
        };
    }

    createWavetable(size, waveFunction) {
        const real = new Float32Array(size);
        const imag = new Float32Array(size);
        
        for (let i = 0; i < size; i++) {
            real[i] = waveFunction(i, size);
        }
        
        return this.audioContext.createPeriodicWave(real, imag);
    }

    // Advanced synthesis methods
    createFMSynth(carrierFreq, modulatorFreq, modulationIndex, duration, waveform = 'sine') {
        const carrier = this.audioContext.createOscillator();
        const modulator = this.audioContext.createOscillator();
        const modulatorGain = this.audioContext.createGain();
        const carrierGain = this.audioContext.createGain();
        
        carrier.frequency.setValueAtTime(carrierFreq, this.audioContext.currentTime);
        modulator.frequency.setValueAtTime(modulatorFreq, this.audioContext.currentTime);
        modulatorGain.gain.setValueAtTime(modulationIndex * carrierFreq, this.audioContext.currentTime);
        
        if (this.wavetables[waveform]) {
            carrier.setPeriodicWave(this.wavetables[waveform]);
            modulator.setPeriodicWave(this.wavetables.sine);
        } else {
            carrier.type = waveform;
            modulator.type = 'sine';
        }
        
        modulator.connect(modulatorGain);
        modulatorGain.connect(carrier.frequency);
        carrier.connect(carrierGain);
        
        this.applyAdvancedEnvelope(carrierGain, duration);
        
        return { oscillator: carrier, gain: carrierGain, modulator };
    }

    applyAdvancedEnvelope(gainNode, duration) {
        const now = this.audioContext.currentTime;
        const attack = Math.min(0.1, duration * 0.1);
        const decay = Math.min(0.2, duration * 0.2);
        const sustain = 0.7;
        const release = Math.min(0.3, duration * 0.3);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(1, now + attack);
        gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
        gainNode.gain.setValueAtTime(sustain, now + duration - release);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
    }

    // Enhanced instrument models
    createAdvancedPiano(frequency, duration, velocity = 0.8) {
        const voices = [];
        const masterGain = this.audioContext.createGain();
        
        // Create multiple oscillators for rich piano sound
        for (let i = 0; i < 5; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            // Slight detuning for richness
            const detune = (i - 2) * 3;
            osc.frequency.setValueAtTime(frequency + detune, this.audioContext.currentTime);
            
            // Use different wavetables for each voice
            const wavetableNames = ['warm', 'bright', 'sine', 'hollow', 'triangle'];
            osc.setPeriodicWave(this.wavetables[wavetableNames[i]]);
            
            // Individual voice gain
            gain.gain.setValueAtTime(velocity * (0.3 - i * 0.05), this.audioContext.currentTime);
            
            // Filter for brightness control
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(frequency * 4 + (i * 500), this.audioContext.currentTime);
            filter.Q.setValueAtTime(1, this.audioContext.currentTime);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            voices.push({ oscillator: osc, gain, filter });
        }
        
        this.applyPianoEnvelope(masterGain, duration, velocity, frequency);
        masterGain.connect(this.effectsChain.input);
        
        return { voices, masterGain };
    }

    applyPianoEnvelope(gainNode, duration, velocity, frequency) {
        const now = this.audioContext.currentTime;
        const attack = 0.01 + (1 - velocity) * 0.05;
        const decay = 0.1 + frequency / 1000 * 0.1;
        const sustain = 0.3 + velocity * 0.4;
        const release = Math.max(0.5, duration * 0.6);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(velocity, now + attack);
        gainNode.gain.exponentialRampToValueAtTime(sustain, now + attack + decay);
        gainNode.gain.setValueAtTime(sustain, now + duration - release);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    }

    createAdvancedStrings(frequency, duration, velocity = 0.6) {
        const ensemble = [];
        const masterGain = this.audioContext.createGain();
        
        // Create string ensemble with multiple voices
        for (let i = 0; i < 4; i++) {
            const voice = this.createStringVoice(frequency * (1 + (i - 1.5) * 0.01), duration, velocity);
            voice.gain.connect(masterGain);
            ensemble.push(voice);
        }
        
        masterGain.connect(this.effectsChain.input);
        return { ensemble, masterGain };
    }

    createStringVoice(frequency, duration, velocity) {
        const fundamental = this.audioContext.createOscillator();
        const harmonic2 = this.audioContext.createOscillator();
        const harmonic3 = this.audioContext.createOscillator();
        const noise = this.createStringNoise(duration);
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        const vibrato = this.createVibrato(frequency);
        
        fundamental.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        harmonic2.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
        harmonic3.frequency.setValueAtTime(frequency * 3, this.audioContext.currentTime);
        
        fundamental.setPeriodicWave(this.wavetables.warm);
        harmonic2.setPeriodicWave(this.wavetables.sine);
        harmonic3.setPeriodicWave(this.wavetables.sine);
        
        // Connect vibrato to fundamental
        vibrato.connect(fundamental.frequency);
        
        // Mix harmonics
        const harmonic2Gain = this.audioContext.createGain();
        const harmonic3Gain = this.audioContext.createGain();
        harmonic2Gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        harmonic3Gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        fundamental.connect(filter);
        harmonic2.connect(harmonic2Gain);
        harmonic3.connect(harmonic3Gain);
        harmonic2Gain.connect(filter);
        harmonic3Gain.connect(filter);
        noise.gain.connect(filter);
        
        // String filter
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
        filter.Q.setValueAtTime(2, this.audioContext.currentTime);
        
        filter.connect(gain);
        
        this.applyStringEnvelope(gain, duration, velocity);
        
        return { 
            oscillators: [fundamental, harmonic2, harmonic3], 
            noise, 
            gain, 
            filter,
            vibrato: vibrato.oscillator
        };
    }

    createStringNoise(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        const source = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        
        source.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        
        gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        
        source.connect(filter);
        filter.connect(gain);
        
        return { source, gain };
    }

    applyStringEnvelope(gainNode, duration, velocity) {
        const now = this.audioContext.currentTime;
        const attack = 0.3; // Slow attack for strings
        const sustain = velocity * 0.8;
        const release = Math.max(0.5, duration * 0.4);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(sustain, now + attack);
        gainNode.gain.setValueAtTime(sustain, now + duration - release);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    }

    createVibrato(frequency) {
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        lfo.frequency.setValueAtTime(5, this.audioContext.currentTime); // 5Hz vibrato
        lfoGain.gain.setValueAtTime(frequency * 0.01, this.audioContext.currentTime); // 1% depth
        
        lfo.connect(lfoGain);
        lfo.start();
        
        return { oscillator: lfo, gain: lfoGain, connect: (destination) => lfoGain.connect(destination) };
    }

    // Generate advanced composition using new theory
    generateAdvancedComposition(settings) {
        const { key = 'C', style = 'medium', length = 16, tempo = 120 } = settings;
        
        // Generate advanced chord progression
        const progression = this.advancedTheory.generateAdvancedProgression(key, length, style);
        
        // Apply harmonic rhythm
        const rhythmicProgression = this.harmonicRhythm.generateHarmonicRhythm(progression, style);
        
        // Generate melody with advanced theory
        const melody = this.generateAdvancedMelody(progression, key, style);
        
        // Add modulation if composition is long enough
        let modulation = null;
        if (length > 12) {
            const targetKey = this.advancedTheory.transposeKey(key, 5); // Modulate to dominant
            modulation = this.advancedTheory.generateModulation(key, targetKey, 2);
        }
        
        return {
            chords: rhythmicProgression,
            melody: melody,
            modulation: modulation,
            key: key,
            tempo: tempo,
            style: style
        };
    }

    generateAdvancedMelody(progression, key, style) {
        const scale = this.advancedTheory.getScale(key, 'ionian');
        const melody = [];
        
        progression.forEach((chord, index) => {
            const chordTones = this.advancedTheory.chordQualities[chord.quality]
                .map(interval => (chord.root + interval) % 12);
            
            // Generate 2-4 notes per chord
            const notesPerChord = 2 + Math.floor(Math.random() * 3);
            
            for (let i = 0; i < notesPerChord; i++) {
                let note;
                
                // Prioritize chord tones and scale tones
                if (Math.random() < 0.6) {
                    // Use chord tone
                    note = chordTones[Math.floor(Math.random() * chordTones.length)];
                } else if (Math.random() < 0.8) {
                    // Use scale tone
                    note = scale[Math.floor(Math.random() * scale.length)];
                } else {
                    // Use passing tone
                    note = Math.floor(Math.random() * 12);
                }
                
                // Apply melodic contour
                if (melody.length > 0) {
                    const lastNote = melody[melody.length - 1].note;
                    const interval = Math.abs(note - lastNote);
                    
                    // Avoid large leaps
                    if (interval > 7) {
                        note = lastNote + (Math.random() < 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3));
                    }
                }
                
                melody.push({
                    note: note,
                    octave: 4 + Math.floor(Math.random() * 2),
                    duration: 0.25 + Math.random() * 0.5,
                    velocity: 0.6 + Math.random() * 0.3
                });
            }
        });
        
        return melody;
    }

    // AI-Driven Composition Features
    generateDynamicArrangement(genre = 'pop', structure = 'extended', options = {}) {
        const genreTemplate = this.genreTemplates[genre] || this.genreTemplates.pop;
        const songStructure = this.songStructures[structure] || this.songStructures.extended;
        
        const arrangement = {
            genre,
            structure: songStructure,
            sections: [],
            totalDuration: 0,
            key: options.key || 'C',
            tempo: options.tempo || this.randomInRange(genreTemplate.tempo[0], genreTemplate.tempo[1])
        };

        songStructure.forEach((sectionType, index) => {
            const sectionTemplate = this.sectionTemplates[sectionType];
            const section = this.generateSection(sectionType, sectionTemplate, genreTemplate, arrangement.key, index);
            arrangement.sections.push(section);
            arrangement.totalDuration += section.duration;
        });

        return arrangement;
    }

    generateSection(type, template, genreTemplate, key, index) {
        const section = {
            type,
            duration: template.duration,
            energy: template.energy,
            complexity: template.complexity,
            instruments: template.instruments,
            chords: [],
            melody: [],
            rhythm: [],
            dynamics: this.calculateDynamics(template.energy, index)
        };

        // Generate chord progression for section
        const progressionLength = Math.ceil(template.duration / 4);
        const baseProgression = this.selectRandomElement(genreTemplate.chordProgressions);
        section.chords = this.generateSectionChords(baseProgression, progressionLength, key, template.complexity);

        // Generate melody for section
        section.melody = this.generateSectionMelody(section.chords, key, template.complexity, template.energy);

        // Generate rhythm pattern
        const rhythmPattern = this.selectRandomElement(genreTemplate.rhythmPatterns);
        section.rhythm = this.generateSectionRhythm(rhythmPattern, template.duration, template.energy);

        // Apply section-specific effects
        section.effects = this.generateSectionEffects(type, template.energy);

        return section;
    }

    generateSectionChords(baseProgression, length, key, complexity) {
        const chords = [];
        const progressionRepeats = Math.ceil(length / baseProgression.length);
        
        for (let i = 0; i < progressionRepeats; i++) {
            baseProgression.forEach((chord, index) => {
                if (chords.length < length) {
                    let finalChord = chord;
                    
                    // Add complexity variations
                    if (complexity === 'complex' && Math.random() < 0.3) {
                        finalChord = this.addChordExtension(chord);
                    }
                    
                    chords.push({
                        symbol: finalChord,
                        notes: this.getChordNotes(finalChord, key),
                        duration: 1,
                        beat: chords.length
                    });
                }
            });
        }
        
        return chords;
    }

    generateSectionMelody(chords, key, complexity, energy) {
        const melody = [];
        const scale = this.advancedTheory.getScale(key, 'ionian');
        
        chords.forEach((chord, chordIndex) => {
            const notesPerChord = complexity === 'simple' ? 2 : complexity === 'moderate' ? 4 : 8;
            
            for (let i = 0; i < notesPerChord; i++) {
                let note;
                
                // Prioritize chord tones (70% chance)
                if (Math.random() < 0.7) {
                    note = this.selectRandomElement(chord.notes);
                } else {
                    // Use scale tones
                    note = this.selectRandomElement(scale);
                }
                
                // Apply energy-based octave selection
                const octave = energy > 0.7 ? 5 : energy > 0.4 ? 4 : 3;
                
                melody.push({
                    note: note + octave,
                    frequency: this.noteToFrequency(note + octave),
                    duration: 0.25,
                    beat: chordIndex + (i * 0.25),
                    velocity: Math.min(127, Math.floor(energy * 100) + this.randomInRange(-10, 10))
                });
            }
        });
        
        // Apply melodic contour
        return this.applyMelodicContour(melody, energy);
    }

    generateSectionRhythm(pattern, duration, energy) {
        const rhythm = [];
        const beatsPerMeasure = 4;
        const measures = duration / beatsPerMeasure;
        
        const patterns = {
            pop: [1, 0, 0.5, 0, 1, 0, 0.5, 0],
            rock: [1, 0, 0.8, 0, 1, 0, 0.8, 0],
            jazz: [1, 0, 0.6, 0.3, 0.8, 0, 0.4, 0.2],
            electronic: [1, 0.3, 0.6, 0.3, 1, 0.3, 0.6, 0.3],
            ambient: [1, 0, 0, 0, 0.5, 0, 0, 0],
            classical: [1, 0.5, 0.7, 0.5, 1, 0.5, 0.7, 0.5],
            cinematic: [1, 0, 0.8, 0, 0.6, 0, 0.9, 0]
        };
        
        const basePattern = patterns[pattern] || patterns.pop;
        
        for (let measure = 0; measure < measures; measure++) {
            basePattern.forEach((velocity, index) => {
                if (velocity > 0) {
                    rhythm.push({
                        beat: measure * beatsPerMeasure + (index * 0.5),
                        velocity: Math.floor(velocity * energy * 127),
                        instrument: 'drums'
                    });
                }
            });
        }
        
        return rhythm;
    }

    calculateDynamics(baseEnergy, sectionIndex) {
        // Create dynamic curve throughout the song
        const curve = Math.sin((sectionIndex / 8) * Math.PI) * 0.3;
        return Math.max(0.1, Math.min(1.0, baseEnergy + curve));
    }

    generateSectionEffects(sectionType, energy) {
        const effects = {
            reverb: 0.3,
            delay: 0.2,
            chorus: 0.1,
            compression: 0.5
        };
        
        // Adjust effects based on section type and energy
        switch (sectionType) {
            case 'intro':
                effects.reverb = 0.5;
                effects.delay = 0.3;
                break;
            case 'chorus':
                effects.compression = 0.7;
                effects.chorus = 0.3;
                break;
            case 'bridge':
                effects.reverb = 0.6;
                effects.delay = 0.4;
                break;
            case 'outro':
                effects.reverb = 0.7;
                effects.delay = 0.5;
                break;
        }
        
        // Scale effects by energy
        Object.keys(effects).forEach(key => {
            effects[key] *= energy;
        });
        
        return effects;
    }

    addChordExtension(chord) {
        const extensions = ['7', '9', '11', '13', 'sus2', 'sus4', 'add9'];
        if (Math.random() < 0.5) {
            return chord + this.selectRandomElement(extensions);
        }
        return chord;
    }

    applyMelodicContour(melody, energy) {
        // Apply contour based on energy level
        const contourTypes = energy > 0.7 ? ['ascending', 'arch'] : ['descending', 'valley'];
        const contour = this.selectRandomElement(contourTypes);
        
        melody.forEach((note, index) => {
            const progress = index / melody.length;
            let adjustment = 0;
            
            switch (contour) {
                case 'ascending':
                    adjustment = Math.floor(progress * 12);
                    break;
                case 'descending':
                    adjustment = Math.floor((1 - progress) * 12);
                    break;
                case 'arch':
                    adjustment = Math.floor(Math.sin(progress * Math.PI) * 12);
                    break;
                case 'valley':
                    adjustment = Math.floor(-Math.sin(progress * Math.PI) * 12);
                    break;
            }
            
            // Apply adjustment to note frequency
            note.frequency *= Math.pow(2, adjustment / 12);
        });
        
        return melody;
    }

    // Helper methods
    selectRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Legacy methods for compatibility
    get scales() {
        return {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            mixolydian: [0, 2, 4, 5, 7, 9, 10],
            pentatonic: [0, 2, 4, 7, 9]
        };
    }
    
    get chordProgressions() {
        return {
            pop: [1, 5, 6, 4],
            jazz: [1, 6, 2, 5],
            blues: [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5],
            classical: [1, 4, 5, 1]
        };
    }
    
    get rhythmPatterns() {
        return {
            simple: [1, 0, 1, 0],
            complex: [1, 0, 0.5, 0.5, 1, 0],
            syncopated: [0.5, 0.5, 0, 1, 0.5, 0.5]
        };
    }

    createOscillator(frequency, type = 'sine', duration = 1, startTime = 0) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + startTime);
        
        if (this.wavetables[type]) {
            oscillator.setPeriodicWave(this.wavetables[type]);
        } else {
            oscillator.type = type;
        }
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + startTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.effectsChain.input);
        
        oscillator.start(this.audioContext.currentTime + startTime);
        oscillator.stop(this.audioContext.currentTime + startTime + duration);
        
        return { oscillator, gainNode };
    }
    
    createPianoNote(frequency, startTime, duration, velocity = 0.7) {
        const piano = this.createAdvancedPiano(frequency, duration, velocity);
        
        piano.voices.forEach(voice => {
            voice.oscillator.start(this.audioContext.currentTime + startTime);
            voice.oscillator.stop(this.audioContext.currentTime + startTime + duration);
        });
        
        return piano;
    }
    
    createStringNote(frequency, startTime, duration, velocity = 0.5) {
        const strings = this.createAdvancedStrings(frequency, duration, velocity);
        
        strings.ensemble.forEach(voice => {
            voice.oscillators.forEach(osc => {
                osc.start(this.audioContext.currentTime + startTime);
                osc.stop(this.audioContext.currentTime + startTime + duration);
            });
            voice.noise.source.start(this.audioContext.currentTime + startTime);
            voice.vibrato.start(this.audioContext.currentTime + startTime);
        });
        
        return strings;
    }
    
    createBassNote(frequency, startTime, duration, velocity = 0.8) {
        const fm = this.createFMSynth(frequency, frequency * 0.5, 2, duration, 'sine');
        
        fm.oscillator.start(this.audioContext.currentTime + startTime);
        fm.modulator.start(this.audioContext.currentTime + startTime);
        fm.oscillator.stop(this.audioContext.currentTime + startTime + duration);
        fm.modulator.stop(this.audioContext.currentTime + startTime + duration);
        
        fm.gain.connect(this.effectsChain.input);
        
        return fm;
    }
    
    createDrumHit(type, startTime, velocity = 0.7) {
        return this.createAdvancedDrums(type, startTime, velocity);
    }

    createAdvancedDrums(type, startTime, velocity = 0.7) {
        switch (type) {
            case 'kick':
                return this.createAdvancedKick(startTime, velocity);
            case 'snare':
                return this.createAdvancedSnare(startTime, velocity);
            default:
                return this.createAdvancedKick(startTime, velocity);
        }
    }

    createAdvancedKick(startTime, velocity) {
        // Multi-layer kick drum using FM synthesis
        const subLayer = this.createFMSynth(60, 30, 3, 0.5, 'sine');
        const punchLayer = this.createFMSynth(80, 40, 2, 0.3, 'sine');
        const clickLayer = this.createFMSynth(2000, 1000, 1, 0.1, 'sine');
        
        const masterGain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const compressor = this.audioContext.createDynamicsCompressor();
        
        // Filter for punch
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, this.audioContext.currentTime);
        filter.Q.setValueAtTime(2, this.audioContext.currentTime);
        
        // Heavy compression for punch
        compressor.threshold.setValueAtTime(-20, this.audioContext.currentTime);
        compressor.ratio.setValueAtTime(20, this.audioContext.currentTime);
        
        // Mix layers
        subLayer.gain.gain.setValueAtTime(velocity * 0.8, this.audioContext.currentTime);
        punchLayer.gain.gain.setValueAtTime(velocity * 0.6, this.audioContext.currentTime);
        clickLayer.gain.gain.setValueAtTime(velocity * 0.3, this.audioContext.currentTime);
        
        subLayer.gain.connect(filter);
        punchLayer.gain.connect(filter);
        clickLayer.gain.connect(masterGain);
        filter.connect(compressor);
        compressor.connect(masterGain);
        masterGain.connect(this.effectsChain.input);
        
        // Start all layers
        [subLayer, punchLayer, clickLayer].forEach(layer => {
            layer.oscillator.start(this.audioContext.currentTime + startTime);
            layer.modulator.start(this.audioContext.currentTime + startTime);
            layer.oscillator.stop(this.audioContext.currentTime + startTime + 0.5);
            layer.modulator.stop(this.audioContext.currentTime + startTime + 0.5);
        });
        
        return { layers: [subLayer, punchLayer, clickLayer], masterGain };
    }

    createAdvancedSnare(startTime, velocity) {
        // Layered snare with tonal component and noise
        const tonal = this.createFMSynth(200, 150, 1.5, 0.2, 'triangle');
        const noise = this.createFilteredNoise(0.2, 'highpass', 1000, 2);
        const rattle = this.createFilteredNoise(0.15, 'bandpass', 3000, 5);
        
        const masterGain = this.audioContext.createGain();
        const compressor = this.audioContext.createDynamicsCompressor();
        
        compressor.threshold.setValueAtTime(-15, this.audioContext.currentTime);
        compressor.ratio.setValueAtTime(8, this.audioContext.currentTime);
        
        // Mix components
        tonal.gain.gain.setValueAtTime(velocity * 0.4, this.audioContext.currentTime);
        noise.gain.setValueAtTime(velocity * 0.6, this.audioContext.currentTime);
        rattle.gain.setValueAtTime(velocity * 0.3, this.audioContext.currentTime);
        
        tonal.gain.connect(compressor);
        noise.connect(compressor);
        rattle.connect(compressor);
        compressor.connect(masterGain);
        masterGain.connect(this.effectsChain.input);
        
        // Start components
        tonal.oscillator.start(this.audioContext.currentTime + startTime);
        tonal.modulator.start(this.audioContext.currentTime + startTime);
        noise.start(this.audioContext.currentTime + startTime);
        rattle.start(this.audioContext.currentTime + startTime);
        
        return { tonal, noise, rattle, masterGain };
    }

    createFilteredNoise(duration, filterType, frequency, Q) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        
        source.buffer = buffer;
        filter.type = filterType;
        filter.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        filter.Q.setValueAtTime(Q, this.audioContext.currentTime);
        
        source.connect(filter);
        filter.connect(gain);
        
        return source;
    }

    generateMelody(scale, length, style) {
        const melody = [];
        let currentNote = scale[0];
        
        for (let i = 0; i < length; i++) {
            const direction = Math.random() > 0.5 ? 1 : -1;
            const step = Math.floor(Math.random() * 3) + 1;
            let nextIndex = scale.indexOf(currentNote) + (direction * step);
            
            if (nextIndex >= scale.length) nextIndex = scale.length - 1;
            if (nextIndex < 0) nextIndex = 0;
            
            currentNote = scale[nextIndex];
            
            melody.push({
                note: currentNote,
                duration: style === 'complex' ? 
                    [0.25, 0.5, 0.75, 1][Math.floor(Math.random() * 4)] : 0.5,
                velocity: 0.6 + Math.random() * 0.3
            });
        }
        
        return melody;
    }
    
    generateChords(key, style, length) {
        const progression = this.chordProgressions[style] || this.chordProgressions.pop;
        const chords = [];
        
        for (let i = 0; i < length; i++) {
            const degree = progression[i % progression.length];
            chords.push({
                degree: degree,
                duration: 1,
                velocity: 0.5 + Math.random() * 0.3
            });
        }
        
        return chords;
    }
    
    generateComposition(settings) {
        const { key = 'C', style = 'pop', length = 8, complexity = 'medium' } = settings;
        
        // Use advanced composition if complexity is high
        if (complexity === 'complex' || complexity === 'high') {
            return this.generateAdvancedComposition(settings);
        }
        
        // Legacy simple composition
        const scale = this.scales.major.map(note => note + this.getNoteValue(key));
        const melody = this.generateMelody(scale, length * 2, style);
        const chords = this.generateChords(key, style, length);
        
        return {
            melody: melody,
            chords: chords,
            key: key,
            tempo: 120,
            style: style
        };
    }
    
    getNoteValue(note) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return notes.indexOf(note);
    }
    
    async playComposition(composition, instruments) {
        if (this.isPlaying) {
            this.stop();
        }
        
        this.isPlaying = true;
        this.currentComposition = composition;
        this.startTime = this.audioContext.currentTime;
        
        // Play melody
        if (composition.melody && instruments.melody) {
            let time = 0;
            composition.melody.forEach(note => {
                const frequency = this.noteToFrequency(note.note, note.octave || 4);
                
                switch (instruments.melody) {
                    case 'piano':
                        this.createPianoNote(frequency, time, note.duration, note.velocity);
                        break;
                    case 'strings':
                        this.createStringNote(frequency, time, note.duration, note.velocity);
                        break;
                    default:
                        this.createOscillator(frequency, 'sine', note.duration, time);
                }
                
                time += note.duration;
            });
        }
        
        // Play chords
        if (composition.chords && instruments.chords) {
            let time = 0;
            composition.chords.forEach(chord => {
                const chordNotes = this.getChordNotes(chord, composition.key);
                
                chordNotes.forEach(note => {
                    const frequency = this.noteToFrequency(note, 3);
                    
                    switch (instruments.chords) {
                        case 'piano':
                            this.createPianoNote(frequency, time, chord.duration, chord.velocity);
                            break;
                        case 'strings':
                            this.createStringNote(frequency, time, chord.duration, chord.velocity);
                            break;
                        default:
                            this.createOscillator(frequency, 'sine', chord.duration, time);
                    }
                });
                
                time += chord.duration;
            });
        }
    }
    
    getChordNotes(chord, key) {
        const keyValue = this.getNoteValue(key);
        const scale = this.scales.major;
        const root = (keyValue + scale[(chord.degree - 1) % scale.length]) % 12;
        
        return [root, (root + 4) % 12, (root + 7) % 12];
    }
    
    noteToFrequency(note, octave) {
        const A4 = 440;
        const noteValue = typeof note === 'number' ? note : this.getNoteValue(note);
        const semitones = (octave - 4) * 12 + noteValue - 9; // A4 is reference
        return A4 * Math.pow(2, semitones / 12);
    }
    
    stop() {
        this.isPlaying = false;
        this.scheduledNotes.forEach(note => {
            if (note.oscillator && note.oscillator.stop) {
                try {
                    note.oscillator.stop();
                } catch (e) {
                    // Oscillator already stopped
                }
            }
        });
        this.scheduledNotes = [];
    }
    
    getAnalyserData() {
        if (this.analyser && this.dataArray) {
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        }
        return new Uint8Array(1024);
    }
    
    async exportToWAV(composition, instruments, duration) {
        // Create offline context for rendering
        const offlineContext = new OfflineAudioContext(2, duration * 44100, 44100);
        
        // Render composition to buffer
        // This is a simplified version - full implementation would recreate all audio nodes
        const buffer = await offlineContext.startRendering();
        
        // Convert to WAV format
        const wavData = this.bufferToWave(buffer, buffer.length);
        
        return new Blob([wavData], { type: 'audio/wav' });
    }
    
    bufferToWave(abuffer, len) {
        const numOfChan = abuffer.numberOfChannels;
        const length = len * numOfChan * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        const channels = [];
        let sample;
        let offset = 0;
        let pos = 0;
        
        // Write WAV header
        const setUint16 = (data) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };
        
        const setUint32 = (data) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };
        
        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"
        
        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // length = 16
        setUint16(1); // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2); // block-align
        setUint16(16); // 16-bit (hardcoded in this demo)
        
        setUint32(0x61746164); // "data" - chunk
        setUint32(length - pos - 4); // chunk length
        
        // Write interleaved data
        for (let i = 0; i < abuffer.numberOfChannels; i++) {
            channels.push(abuffer.getChannelData(i));
        }
        
        while (pos < length) {
            for (let i = 0; i < numOfChan; i++) {
                sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
                view.setInt16(pos, sample, true); // write 16-bit sample
                pos += 2;
            }
            offset++; // next source sample
        }
        
        return buffer;
    }
}

// Advanced Music Theory Implementation
class AdvancedMusicTheory {
    constructor() {
        this.modes = {
            ionian: [0, 2, 4, 5, 7, 9, 11],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            phrygian: [0, 1, 3, 5, 7, 8, 10],
            lydian: [0, 2, 4, 6, 7, 9, 11],
            mixolydian: [0, 2, 4, 5, 7, 9, 10],
            aeolian: [0, 2, 3, 5, 7, 8, 10],
            locrian: [0, 1, 3, 5, 6, 8, 10]
        };
        
        this.chordQualities = {
            major: [0, 4, 7],
            minor: [0, 3, 7],
            diminished: [0, 3, 6],
            augmented: [0, 4, 8],
            major7: [0, 4, 7, 11],
            minor7: [0, 3, 7, 10],
            dominant7: [0, 4, 7, 10],
            diminished7: [0, 3, 6, 9],
            halfDiminished7: [0, 3, 6, 10],
            major9: [0, 4, 7, 11, 14],
            minor9: [0, 3, 7, 10, 14],
            dominant9: [0, 4, 7, 10, 14],
            add9: [0, 4, 7, 14],
            sus2: [0, 2, 7],
            sus4: [0, 5, 7]
        };
        
        this.voiceLeadingRules = {
            maxInterval: 12,
            preferredMotion: 'contrary',
            avoidParallels: ['perfect5', 'octave'],
            smoothVoiceLeading: true
        };
        
        this.currentKey = 'C';
        this.currentMode = 'ionian';
        this.currentChordProgression = [];
        this.voiceHistory = [];
    }
    
    // Generate sophisticated chord progressions with voice leading
    generateAdvancedProgression(key, length = 8, complexity = 'medium') {
        const progressions = {
            simple: [
                [1, 5, 6, 4], // I-V-vi-IV
                [1, 6, 4, 5], // I-vi-IV-V
                [6, 4, 1, 5]  // vi-IV-I-V
            ],
            medium: [
                [1, 3, 6, 4, 1, 5, 1], // I-iii-vi-IV-I-V-I
                [1, 7, 3, 6, 2, 5, 1], // I-vii°-iii-vi-ii-V-I
                [6, 4, 1, 5, 3, 6, 2, 5] // vi-IV-I-V-iii-vi-ii-V
            ],
            complex: [
                [1, 6, 2, 5, 3, 6, 4, 7, 1], // I-vi-ii-V-iii-vi-IV-vii°-I
                [1, 3, 4, 4, 1, 6, 2, 5, 1], // I-iii-IV-iv-I-vi-ii-V-I (modal interchange)
                [6, 7, 1, 1, 4, 3, 2, 5, 1] // vi-vii°-I-I7-IV-iii-ii-V-I
            ]
        };
        
        const baseProgression = progressions[complexity][Math.floor(Math.random() * progressions[complexity].length)];
        const extendedProgression = [];
        
        // Extend progression to desired length
        for (let i = 0; i < length; i++) {
            extendedProgression.push(baseProgression[i % baseProgression.length]);
        }
        
        return this.harmonizeProgression(extendedProgression, key);
    }
    
    // Harmonize progression with advanced voice leading
    harmonizeProgression(progression, key) {
        const harmonizedChords = [];
        let previousVoicing = null;
        
        progression.forEach((degree, index) => {
            const chord = this.getChordFromDegree(degree, key);
            const voicing = this.getOptimalVoicing(chord, previousVoicing);
            
            harmonizedChords.push({
                root: chord.root,
                quality: chord.quality,
                voicing: voicing,
                degree: degree,
                inversion: this.getInversion(voicing)
            });
            
            previousVoicing = voicing;
        });
        
        return harmonizedChords;
    }
    
    // Get chord from scale degree
    getChordFromDegree(degree, key) {
        const scale = this.getScale(key, this.currentMode);
        const rootIndex = (degree - 1) % 7;
        const root = scale[rootIndex];
        
        // Determine chord quality based on scale degree and mode
        const chordQualities = {
            ionian: ['major7', 'minor7', 'minor7', 'major7', 'dominant7', 'minor7', 'halfDiminished7'],
            dorian: ['minor7', 'minor7', 'major7', 'dominant7', 'minor7', 'halfDiminished7', 'major7'],
            aeolian: ['minor7', 'halfDiminished7', 'major7', 'minor7', 'minor7', 'major7', 'dominant7']
        };
        
        const qualities = chordQualities[this.currentMode] || chordQualities.ionian;
        const quality = qualities[rootIndex];
        
        return { root, quality };
    }
    
    // Get optimal voicing with smooth voice leading
    getOptimalVoicing(chord, previousVoicing) {
        const chordTones = this.chordQualities[chord.quality].map(interval => 
            (chord.root + interval) % 12
        );
        
        if (!previousVoicing) {
            // First chord - use close position
            return this.getClosePosition(chordTones);
        }
        
        // Find voicing with minimal voice movement
        const possibleVoicings = this.generateVoicings(chordTones);
        let bestVoicing = possibleVoicings[0];
        let minMovement = Infinity;
        
        possibleVoicings.forEach(voicing => {
            const movement = this.calculateVoiceMovement(previousVoicing, voicing);
            if (movement < minMovement) {
                minMovement = movement;
                bestVoicing = voicing;
            }
        });
        
        return bestVoicing;
    }
    
    // Generate possible voicings for a chord
    generateVoicings(chordTones) {
        const voicings = [];
        const octaves = [3, 4, 5]; // Available octaves
        
        // Generate different inversions and positions
        for (let inversion = 0; inversion < chordTones.length; inversion++) {
            const invertedChord = [...chordTones.slice(inversion), ...chordTones.slice(0, inversion)];
            
            octaves.forEach(baseOctave => {
                const voicing = invertedChord.map((note, index) => {
                    let octave = baseOctave;
                    if (index > 0 && note < invertedChord[index - 1]) {
                        octave++;
                    }
                    return note + (octave * 12);
                });
                
                voicings.push(voicing);
            });
        }
        
        return voicings;
    }
    
    // Calculate voice movement between voicings
    calculateVoiceMovement(voicing1, voicing2) {
        if (voicing1.length !== voicing2.length) return Infinity;
        
        let totalMovement = 0;
        for (let i = 0; i < voicing1.length; i++) {
            totalMovement += Math.abs(voicing1[i] - voicing2[i]);
        }
        
        return totalMovement;
    }
    
    // Get close position voicing
    getClosePosition(chordTones) {
        const baseOctave = 4;
        return chordTones.map((note, index) => {
            let octave = baseOctave;
            if (index > 0 && note < chordTones[index - 1]) {
                octave++;
            }
            return note + (octave * 12);
        });
    }
    
    // Determine chord inversion
    getInversion(voicing) {
        const bassNote = voicing[0] % 12;
        const chordTones = voicing.map(note => note % 12);
        const uniqueTones = [...new Set(chordTones)].sort((a, b) => a - b);
        
        return uniqueTones.indexOf(bassNote);
    }
    
    // Get scale for key and mode
    getScale(key, mode) {
        const keyIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(key);
        const modeIntervals = this.modes[mode];
        
        return modeIntervals.map(interval => (keyIndex + interval) % 12);
    }
    
    // Generate modulation sequence
    generateModulation(fromKey, toKey, steps = 2) {
        const modulationTypes = ['pivot', 'chromatic', 'enharmonic', 'direct'];
        const type = modulationTypes[Math.floor(Math.random() * modulationTypes.length)];
        
        switch (type) {
            case 'pivot':
                return this.generatePivotModulation(fromKey, toKey, steps);
            case 'chromatic':
                return this.generateChromaticModulation(fromKey, toKey, steps);
            case 'enharmonic':
                return this.generateEnharmonicModulation(fromKey, toKey, steps);
            default:
                return this.generateDirectModulation(fromKey, toKey);
        }
    }
    
    // Generate pivot chord modulation
    generatePivotModulation(fromKey, toKey, steps) {
        const fromScale = this.getScale(fromKey, 'ionian');
        const toScale = this.getScale(toKey, 'ionian');
        
        // Find common chords between keys
        const commonChords = this.findCommonChords(fromScale, toScale);
        const pivotChord = commonChords[Math.floor(Math.random() * commonChords.length)];
        
        return [
            { key: fromKey, chord: this.getChordFromDegree(1, fromKey) },
            { key: fromKey, chord: pivotChord, pivot: true },
            { key: toKey, chord: this.getChordFromDegree(5, toKey) },
            { key: toKey, chord: this.getChordFromDegree(1, toKey) }
        ];
    }
    
    // Find common chords between two keys
    findCommonChords(scale1, scale2) {
        const commonTones = scale1.filter(note => scale2.includes(note));
        return commonTones.map(root => ({
            root: root,
            quality: 'major' // Simplified for now
        }));
    }
    
    // Generate chromatic modulation
    generateChromaticModulation(fromKey, toKey, steps) {
        const keyDistance = this.getKeyDistance(fromKey, toKey);
        const chromaticSteps = [];
        
        for (let i = 0; i <= steps; i++) {
            const currentKey = this.transposeKey(fromKey, (keyDistance / steps) * i);
            chromaticSteps.push({
                key: currentKey,
                chord: this.getChordFromDegree(1, currentKey)
            });
        }
        
        return chromaticSteps;
    }
    
    // Generate enharmonic modulation
    generateEnharmonicModulation(fromKey, toKey, steps) {
        // Simplified enharmonic modulation using diminished 7th chords
        return [
            { key: fromKey, chord: this.getChordFromDegree(1, fromKey) },
            { key: fromKey, chord: { root: 0, quality: 'diminished7' }, enharmonic: true },
            { key: toKey, chord: this.getChordFromDegree(1, toKey) }
        ];
    }
    
    // Generate direct modulation
    generateDirectModulation(fromKey, toKey) {
        return [
            { key: fromKey, chord: this.getChordFromDegree(1, fromKey) },
            { key: toKey, chord: this.getChordFromDegree(1, toKey), direct: true }
        ];
    }
    
    // Get distance between keys in semitones
    getKeyDistance(key1, key2) {
        const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const index1 = keys.indexOf(key1);
        const index2 = keys.indexOf(key2);
        
        return (index2 - index1 + 12) % 12;
    }
    
    // Transpose key by semitones
    transposeKey(key, semitones) {
        const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const index = keys.indexOf(key);
        return keys[(index + Math.round(semitones)) % 12];
    }
}

// Enhanced Harmonic Rhythm class
class AdvancedHarmonicRhythm {
    constructor() {
        this.rhythmPatterns = {
            simple: [1, 1, 1, 1], // One chord per beat
            moderate: [2, 1, 1, 2], // Varied chord durations
            complex: [1, 0.5, 0.5, 1, 1, 2], // Syncopated changes
            jazz: [1, 0.5, 1.5, 1], // Jazz-style rhythm
            classical: [4, 2, 1, 1] // Classical phrase structure
        };
        
        this.currentPattern = 'moderate';
        this.tempo = 120;
    }
    
    generateHarmonicRhythm(chordProgression, style = 'moderate') {
        const pattern = this.rhythmPatterns[style];
        const rhythmicProgression = [];
        
        chordProgression.forEach((chord, index) => {
            const duration = pattern[index % pattern.length];
            const subdivision = this.getSubdivision(duration, style);
            
            rhythmicProgression.push({
                ...chord,
                duration: duration,
                subdivision: subdivision,
                emphasis: this.getEmphasis(index, pattern.length)
            });
        });
        
        return rhythmicProgression;
    }
    
    getSubdivision(duration, style) {
        const subdivisions = {
            simple: ['quarter', 'quarter', 'quarter', 'quarter'],
            moderate: ['half', 'quarter', 'quarter', 'half'],
            complex: ['quarter', 'eighth', 'eighth', 'quarter', 'quarter', 'half'],
            jazz: ['quarter', 'eighth', 'dotted-quarter', 'quarter'],
            classical: ['whole', 'half', 'quarter', 'quarter']
        };
        
        return subdivisions[style] || subdivisions.moderate;
    }
    
    getEmphasis(index, patternLength) {
        // Strong emphasis on downbeats, weaker on offbeats
        if (index % patternLength === 0) return 'strong';
        if (index % (patternLength / 2) === 0) return 'medium';
        return 'weak';
    }
}