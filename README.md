# 🚀 Sci-Fi Photo Booth

A futuristic photo booth web application with neon aesthetics, overlay effects, and QR code sharing capabilities. Perfect for events, parties, or fun interactive experiences!

## ✨ Features

### 🎥 **Webcam Integration**
- Real-time webcam preview with 1080p support
- Automatic camera initialization
- Camera status indicator

### 🎭 **Overlay Effects**
- Idle animation loop when not in use
- Random pose overlay videos during photo capture
- Transparent video overlays with blend modes

### ⏱️ **Countdown Timer**
- Animated "3, 2, 1" countdown with sound effects
- Sci-fi glowing number animations
- Audio cues for each countdown number

### 📸 **Photo Capture**
- High-quality image capture combining webcam and overlay
- Optional PNG frame overlay
- Automatic timestamp-based file naming
- Instant photo preview

### 📱 **QR Code Generation**
- Automatic QR code generation for each photo
- Scannable link to photo location
- Customizable QR code styling

### 🖨️ **Printing Support**
- Direct printing to macOS printers
- Browser-based print dialog
- Electron app support for native printing

### 🎨 **Sci-Fi Design**
- Neon pink, purple, and teal color scheme
- Glowing button effects
- Animated background particles
- Futuristic typography (Orbitron, Rajdhani)
- Responsive design for different screen sizes

## 🛠️ Installation

1. **Clone/Download** the project files
2. **Set up media files** in the following structure:
   ```
   photo-booth-app/
   ├── overlays/
   │   ├── idle.webm
   │   ├── pose1.webm
   │   ├── pose2.webm
   │   └── pose3.webm
   ├── sounds/
   │   ├── countdown.mp3
   │   ├── shutter.mp3
   │   └── bg-music.mp3
   ├── assets/
   │   └── frame.png
   └── photos/
   ```

3. **Start a local server** (required for webcam access):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Open in browser**: `http://localhost:8000`

## 🎮 Usage

### Basic Operation
1. **Allow camera access** when prompted
2. **Click "TAKE PHOTO"** or press **Spacebar**
3. **Wait for countdown** (3-2-1)
4. **Photo is captured** and saved automatically
5. **View result** with QR code for sharing
6. **Print or take another photo**

### Keyboard Shortcuts
- **Spacebar**: Take photo
- **Escape**: Reset/cancel (if implemented)

### File Structure
```
photo-booth-app/
├── index.html          # Main HTML structure
├── style.css           # Sci-fi styling and animations
├── script.js           # Core photo booth functionality
├── print.js            # Printing functionality
├── qr.js               # QR code generation
├── libs/
│   └── qrcode.min.js   # QR code library
├── overlays/           # Video overlay files
├── sounds/             # Audio files
├── assets/             # Image assets (frames, etc.)
└── photos/             # Captured photos (auto-created)
```

## 🎨 Customization

### Colors
Edit `style.css` to change the color scheme:
```css
:root {
  --primary-neon: #ff14ff;    /* Pink neon */
  --secondary-neon: #00ffff;  /* Cyan neon */
  --accent-neon: #8a2be2;     /* Purple neon */
}
```

### Overlay Videos
Replace videos in `/overlays/` folder:
- `idle.webm` - Loops when idle
- `pose1.webm`, `pose2.webm`, `pose3.webm` - Random selection during capture

### Audio
Replace audio files in `/sounds/` folder:
- `countdown.mp3` - Plays with each countdown number
- `shutter.mp3` - Plays when photo is captured
- `bg-music.mp3` - Background ambient music

### Frame Overlay
Replace `assets/frame.png` with your own frame design (transparent PNG recommended)

## 🔧 Technical Requirements

### Browser Support
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may need user interaction for audio)

### Permissions Required
- **Camera access**: Required for webcam functionality
- **Microphone access**: Not required (audio disabled)

### Recommended Specs
- **Resolution**: 1920x1080 or higher
- **RAM**: 4GB minimum
- **CPU**: Modern processor for smooth video rendering

## 🌐 Deployment

### Local Network
1. Replace `localhost` URLs in `qr.js` with your local IP
2. Start server on network-accessible port
3. Connect devices to same network

### Production Server
1. Upload files to web server
2. Update `baseURL` in `qr.js` with your domain
3. Configure HTTPS for webcam access
4. Set up photo storage and serving

## 🐛 Troubleshooting

### Camera Not Working
- Ensure HTTPS or localhost (required for webcam)
- Check browser permissions
- Try different browsers
- Verify camera is not in use by other apps

### Audio Not Playing
- Click anywhere on page first (browser autoplay policy)
- Check audio file paths
- Verify audio formats are supported

### QR Code Not Generating
- Check if `qrcode.min.js` is loaded
- Verify QR code container exists
- Check browser console for errors

### Photos Not Saving
- Modern browsers will prompt for download location
- Check browser's download settings
- Verify popup blockers aren't interfering

## 🔮 Future Enhancements

- [ ] Multiple frame options
- [ ] Social media sharing
- [ ] Photo gallery/slideshow
- [ ] Custom overlay upload
- [ ] Green screen effects
- [ ] Animated GIF creation
- [ ] Photo editing filters
- [ ] Database storage
- [ ] Analytics dashboard

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Enjoy your sci-fi photo booth experience!** 🚀✨ 