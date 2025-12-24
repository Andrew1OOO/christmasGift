#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get all files in photos folder
const photosDir = path.join(__dirname, 'photos');
const dataJsPath = path.join(__dirname, 'data.js');

// Image file extensions
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.MP.jpg'];

// Function to check if file is an image
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.some(imgExt => filename.toLowerCase().endsWith(imgExt.toLowerCase()));
}

// Function to try extracting year from filename
function extractYear(filename) {
  const yearMatch = filename.match(/(20\d{2})/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  return null;
}

// Function to read existing data.js and get current photos
function getExistingPhotos() {
  try {
    const content = fs.readFileSync(dataJsPath, 'utf8');
    const photosMatch = content.match(/const photos = \[([\s\S]*?)\];/);
    if (photosMatch) {
      // Extract existing photo sources
      const existingSources = [];
      const photoMatches = photosMatch[1].matchAll(/src:\s*"photos\/([^"]+)"/g);
      for (const match of photoMatches) {
        existingSources.push(match[1]);
      }
      return existingSources;
    }
  } catch (err) {
    console.log('No existing data.js found, will create new one.');
  }
  return [];
}

// Function to generate data.js
function generateDataJs() {
  const files = fs.readdirSync(photosDir);
  const existingSources = getExistingPhotos();
  
  // Filter image files and sort
  const imageFiles = files
    .filter(file => isImageFile(file))
    .sort();

  // Check for new files
  const newFiles = imageFiles.filter(file => !existingSources.includes(file));
  if (newFiles.length > 0) {
    console.log(`\n🆕 Detected ${newFiles.length} new photo(s):`);
    newFiles.forEach(file => {
      const year = extractYear(file);
      console.log(`   - ${file}${year ? ` (year: ${year})` : ''}`);
    });
  }

  // Generate data.js content
  let dataJsContent = `// Photo metadata
// Add your photos to the /photos/ folder and update this array
const photos = [
`;

  imageFiles.forEach((file, index) => {
    const year = extractYear(file);
    const yearValue = year ? year : 2020;
    
    // Check if this photo already exists in data.js with a custom year/caption
    const existingPhoto = existingSources.includes(file);
    let caption = "Your caption here.";
    
    if (existingPhoto) {
      // Try to preserve existing caption if possible
      try {
        const content = fs.readFileSync(dataJsPath, 'utf8');
        const photoMatch = content.match(new RegExp(`src:\\s*"photos/${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*caption:\\s*"([^"]+)"`));
        if (photoMatch) {
          caption = photoMatch[1];
        }
        // Try to preserve existing year if it's not auto-detected
        const yearMatch = content.match(new RegExp(`src:\\s*"photos/${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*year:\\s*(\\d+)`));
        if (yearMatch && !year) {
          // Use existing year if we couldn't detect one
          const existingYear = parseInt(yearMatch[1]);
          if (existingYear !== 2020) { // Don't use placeholder
            dataJsContent += `    { src: "photos/${file}", year: ${existingYear}, caption: "${caption}" }`;
            if (index < imageFiles.length - 1) {
              dataJsContent += ',';
            }
            dataJsContent += '\n';
            return;
          }
        }
      } catch (err) {
        // If we can't read, just use defaults
      }
    }
    
    dataJsContent += `    { src: "photos/${file}", year: ${yearValue}, caption: "${caption}" }`;
    
    if (index < imageFiles.length - 1) {
      dataJsContent += ',';
    }
    dataJsContent += '\n';
  });

  dataJsContent += `];
`;

  // Write to data.js
  fs.writeFileSync(dataJsPath, dataJsContent);
  
  if (newFiles.length > 0) {
    console.log(`\n✅ Updated data.js with ${imageFiles.length} total photos`);
    console.log('📝 Remember to update years and captions for new photos!\n');
  }
}

// Initial generation
console.log('👀 Watching photos folder for new files...');
console.log('Press Ctrl+C to stop\n');
generateDataJs();

// Watch for file changes
fs.watch(photosDir, { recursive: false }, (eventType, filename) => {
  if (filename && isImageFile(filename)) {
    // Small delay to ensure file is fully written
    setTimeout(() => {
      console.log(`\n📸 Detected change: ${filename}`);
      generateDataJs();
    }, 500);
  }
});

