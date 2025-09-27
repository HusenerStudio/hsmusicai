# 🎵 HS Music AI - Free Music Generator

A powerful, browser-based AI music generator that creates beautiful compositions using advanced Web Audio API and music theory algorithms. Generate unique music in various styles, keys, and with different instruments - completely free!

## ✨ Features

- **🎼 Multiple Musical Styles**: Pop, Classical, Jazz, Ambient, and Electronic
- **🎹 Various Instruments**: Piano, Strings, Bass, and Drums
- **🎵 Music Theory Based**: Uses proper chord progressions and scales
- **🎚️ Customizable Parameters**: Key, tempo, length, and instrument selection
- **📊 Real-time Visualization**: Beautiful audio visualization while playing
- **💾 Export Functionality**: Download generated music as audio files
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🆓 Completely Free**: No registration or payment required

## 🚀 Getting Started

### Prerequisites

- Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start generating music!

### Usage

1. **Select Musical Parameters**:
   - Choose a key (C Major, G Major, A Minor, etc.)
   - Set tempo (60-180 BPM)
   - Select musical style
   - Set composition length (10-120 seconds)

2. **Choose Instruments**:
   - Toggle Piano, Strings, Bass, and/or Drums
   - At least one instrument must be selected

3. **Generate Music**:
   - Click "Generate Music" button
   - The AI will create a unique composition
   - Music will automatically start playing

4. **Control Playback**:
   - Use play/pause button to control playback
   - Stop button to halt playback
   - Progress bar shows current position

5. **Export Music**:
   - Click "Download" to save the generated music
   - File will be saved as WAV format

## 🎼 Music Theory

### Scales and Keys
The application uses proper musical scales for each key:
- **Major Keys**: C, G, D, A, E, F, Bb
- **Minor Keys**: Am, Em, Dm

### Chord Progressions
Different styles use authentic chord progressions:
- **Pop**: I-vi-IV-V progressions
- **Classical**: Traditional cadences
- **Jazz**: Extended chords with ii-V-I
- **Ambient**: Suspended and open chords
- **Electronic**: Modern progressions

### Rhythm Patterns
Each style has characteristic rhythm patterns:
- **Pop**: Strong beats on 1 and 3
- **Classical**: Varied rhythmic complexity
- **Jazz**: Syncopated patterns
- **Ambient**: Sparse, atmospheric
- **Electronic**: Steady, driving beats

## 🔧 Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, and JavaScript
- **Audio Engine**: Web Audio API
- **Music Generation**: Custom algorithms based on music theory
- **Visualization**: Canvas-based real-time audio visualization
- **Export**: Offline audio rendering with WAV encoding

### Browser Compatibility
- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+

### File Structure
```
hs-music-ai/
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── app.js             # Main application logic
├── musicGenerator.js   # Core music generation engine
├── recorder.js        # Audio recording and export
└── README.md          # Documentation
```

## 🎨 Customization

### Adding New Scales
To add new musical scales, modify the `scales` object in `musicGenerator.js`:

```javascript
this.scales = {
    'NewKey': [freq1, freq2, freq3, freq4, freq5, freq6, freq7],
    // ... existing scales
};
```

### Creating New Styles
Add new musical styles by extending the `chordProgressions` and `rhythmPatterns` objects:

```javascript
this.chordProgressions = {
    'newStyle': [[0, 2, 4], [1, 3, 5], [4, 6, 1], [5, 0, 2]],
    // ... existing progressions
};

this.rhythmPatterns = {
    'newStyle': [1, 0, 0.5, 0, 0.8, 0, 0.3, 0],
    // ... existing patterns
};
```

### Modifying Instruments
Instrument sounds can be customized by modifying the synthesis methods in `musicGenerator.js`:
- `createPianoNote()` - Piano sound synthesis
- `createStringNote()` - String instrument synthesis
- `createBassNote()` - Bass synthesis
- `createDrumHit()` - Drum sound synthesis

## 🐛 Troubleshooting

### Audio Not Playing
- Ensure your browser supports Web Audio API
- Check if audio is muted or volume is low
- Try clicking on the page first (browsers require user interaction for audio)

### Export Not Working
- Verify browser supports MediaRecorder API
- Check if sufficient storage space is available
- Try a different browser if issues persist

### Performance Issues
- Close other browser tabs to free up memory
- Reduce composition length for better performance
- Disable other instruments if experiencing lag

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Bug Reports**: Report issues via GitHub issues
2. **Feature Requests**: Suggest new features or improvements
3. **Code Contributions**: Submit pull requests with enhancements
4. **Documentation**: Improve documentation and examples

### Development Setup
1. Fork the repository
2. Make your changes
3. Test thoroughly in multiple browsers
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Web Audio API documentation and community
- Music theory resources and educational materials
- Open source audio processing libraries and examples

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

**Enjoy creating music with HS Music AI! 🎵**