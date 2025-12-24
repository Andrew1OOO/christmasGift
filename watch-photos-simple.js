#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, 'photos');
const dataJsPath = path.join(__dirname, 'data.js');

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.MP.jpg'];

function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.some(imgExt => filename.toLowerCase().endsWith(imgExt.toLowerCase()));
}

function extractYear(filename) {
  const yearMatch = filename.match(/(20\d{2})/);
  return yearMatch ? parseInt(yearMatch[1]) : 2020;
}

function getExistingPhotoFiles() {
  try {
    const content = fs.readFileSync(dataJsPath, 'utf8');
    const matches = content.matchAll(/src:\s*"photos\/([^"]+)"/g);
    return Array.from(matches, m => m[1]);
  } catch (err) {
    return [];
  }
}

function addNewPhotoToDataJs(filename) {
  const existingFiles = getExistingPhotoFiles();
  
  if (existingFiles.includes(filename)) {
    console.log(`   ℹ️  ${filename} already exists in data.js`);
    return;
  }

  const year = extractYear(filename);
  const newEntry = `    { src: "photos/${filename}", year: ${year}, caption: "Your caption here." },\n`;

  try {
    let content = fs.readFileSync(dataJsPath, 'utf8');
    
    // Find the closing ]; bracket - match with any whitespace/newlines before it
    // This handles cases like: \n    ]; or \n\n];
    const closingMatch = content.match(/(\s+)(\];\s*$)/m);
    
    if (closingMatch) {
      // Add new entry before the closing bracket, preserving indentation
      const indent = closingMatch[1];
      const newContent = content.replace(
        /(\s+\];\s*$)/m,
        `${indent}${newEntry}${indent}];`
      );
      fs.writeFileSync(dataJsPath, newContent);
      console.log(`   ✅ Added ${filename} to data.js (year: ${year})`);
      console.log(`   📝 Don't forget to update the caption!`);
    } else {
      // Fallback: try to find ]; anywhere and add before it
      if (content.includes('];')) {
        const newContent = content.replace(
          /(\];)/,
          `    ${newEntry}    ];`
        );
        fs.writeFileSync(dataJsPath, newContent);
        console.log(`   ✅ Added ${filename} to data.js (year: ${year})`);
        console.log(`   📝 Don't forget to update the caption!`);
      } else {
        console.log(`   ⚠️  Could not find closing bracket in data.js`);
        console.log(`   💡 Try running: node generate-data.js`);
      }
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }
}

// Initial check
console.log('👀 Watching photos folder for new files...');
console.log('Press Ctrl+C to stop\n');

// Check for any new files right now
const allFiles = fs.readdirSync(photosDir).filter(isImageFile);
const existingFiles = getExistingPhotoFiles();
const newFiles = allFiles.filter(f => !existingFiles.includes(f));

if (newFiles.length > 0) {
  console.log(`Found ${newFiles.length} new photo(s):`);
  newFiles.forEach(file => addNewPhotoToDataJs(file));
  console.log('');
}

// Watch for new files
fs.watch(photosDir, { recursive: false }, (eventType, filename) => {
  if (filename && isImageFile(filename)) {
    setTimeout(() => {
      if (eventType === 'rename' && fs.existsSync(path.join(photosDir, filename))) {
        console.log(`\n📸 New file detected: ${filename}`);
        addNewPhotoToDataJs(filename);
        console.log('');
      }
    }, 500);
  }
});

