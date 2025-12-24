#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get all files in photos folder
const photosDir = path.join(__dirname, 'photos');
const files = fs.readdirSync(photosDir);

// Image file extensions
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP', '.MP.jpg'];

// Filter image files and sort
const imageFiles = files
  .filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.some(imgExt => file.toLowerCase().endsWith(imgExt.toLowerCase()));
  })
  .sort();

// Function to try extracting year from filename
function extractYear(filename) {
  // Try to find 4-digit year (2000-2099)
  const yearMatch = filename.match(/(20\d{2})/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  return null;
}

// Generate data.js content
let dataJsContent = `// Photo metadata
// Add your photos to the /photos/ folder and update this array
const photos = [
`;

imageFiles.forEach((file, index) => {
  const year = extractYear(file);
  // Use detected year or 2020 as placeholder (you'll need to update these)
  const yearValue = year ? year : 2020;
  
  dataJsContent += `    { src: "photos/${file}", year: ${yearValue}, caption: "Your caption here." }`;
  
  if (index < imageFiles.length - 1) {
    dataJsContent += ',';
  }
  dataJsContent += '\n';
});

dataJsContent += `];
`;

// Write to data.js
fs.writeFileSync(path.join(__dirname, 'data.js'), dataJsContent);

console.log(`✅ Generated data.js with ${imageFiles.length} photos:`);
imageFiles.forEach((file, index) => {
  const year = extractYear(file);
  const yearInfo = year ? ` (detected year: ${year})` : '';
  console.log(`   ${index + 1}. ${file}${yearInfo}`);
});
console.log('\n📝 Next steps:');
console.log('   1. Review data.js');
console.log('   2. Fill in the correct years for photos without detected years');
console.log('   3. Add meaningful captions for each photo');

