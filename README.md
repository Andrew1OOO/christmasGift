# Memory Game - Christmas Gift

A simple, clean photo guessing game where players try to remember the year each photo was taken.

## Setup

1. **Add your photos:**
   - Place your photos in the `/photos/` folder
   - Name them sequentially: `img001.jpg`, `img002.jpg`, etc.
   - Recommended: Resize photos to max width ~1600px and compress them for better performance

2. **Update photo data:**
   - Open `data.js`
   - Add entries for each photo following this format:
   ```javascript
   { src: "photos/img001.jpg", year: 2012, caption: "First big family trip." },
   ```

3. **Open the game:**
   - Simply open `index.html` in a web browser
   - No server needed - works locally!

## How It Works

- **Landing Screen:** Click "Start Game" to begin
- **Game Loop:** 5 rounds, each showing a random photo with 4 year options
- **Scoring:** +1 point per correct answer, no penalties
- **Final Screen:** Shows your score with a personalized message

## Customization

- Edit `data.js` to add/update photos and captions
- Modify `style.css` to change colors and styling
- The game automatically shuffles photos and selects 5 random ones each playthrough

