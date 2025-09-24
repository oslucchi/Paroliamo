const fs = require('fs');
const path = require('path');

// Check what icon files actually exist in Android folders
const findAndroidIcons = () => {
  const iconFiles = [];
  const drawableFolders = ['drwable', 'mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmapadd-xxxhdpi'];
  
  for (const folder of drawableFolders) {
    const folderPath = path.join(androidResPath, folder);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      const iconFile = files.find(f => f.includes('launcher') || f.includes('icon'));
      if (iconFile) {
        iconFiles.push({ folder, filename: iconFile });
        console.log(`Found icon: ${folder}/${iconFile}`);
      }
    }
  }
  return iconFiles;
};

// Android to iOS icon mapping - using the largest available icons
const iconMapping = [
  { size: '20x20', ios: 'AppIcon-20.png' },
  { size: '29x29', ios: 'AppIcon-29.png' },
  { size: '40x40', ios: 'AppIcon-40.png' },
  { size: '58x58', ios: 'AppIcon-58.png' },
  { size: '60x60', ios: 'AppIcon-60.png' },
  { size: '76x76', ios: 'AppIcon-76.png' },
  { size: '80x80', ios: 'AppIcon-80.png' },
  { size: '87x87', ios: 'AppIcon-87.png' },
  { size: '120x120', ios: 'AppIcon-120.png' },
  { size: '152x152', ios: 'AppIcon-152.png' },
  { size: '167x167', ios: 'AppIcon-167.png' },
  { size: '180x180', ios: 'AppIcon-180.png' },
  { size: '1024x1024', ios: 'AppIcon-1024.png' }
];

const androidResPath = path.join(__dirname, '../android/app/src/main/res');
const iosIconPath = path.join(__dirname, '../ios/Paroliamo/Images.xcassets/AppIcon.appiconset');

// Ensure iOS directory exists
if (!fs.existsSync(iosIconPath)) {
  fs.mkdirSync(iosIconPath, { recursive: true });
}

console.log('Scanning Android drawable folders...');
const availableIcons = findAndroidIcons();

if (availableIcons.length === 0) {
  console.error('❌ No Android icons found! Please check android/app/src/main/res/drawable-* folders');
  process.exit(1);
}

console.log('Copying Android icons to iOS...');

let copiedIcons = [];
let errors = [];

// Use the best available Android icon (prefer largest)
const bestIcon = availableIcons.find(icon => icon.folder === 'drawable-xxxhdpi') || 
                 availableIcons.find(icon => icon.folder === 'drawable-xxhdpi') ||
                 availableIcons.find(icon => icon.folder === 'drawable-xhdpi') ||
                 availableIcons[0];

console.log(`Using source icon: ${bestIcon.folder}/${bestIcon.filename}`);

for (const mapping of iconMapping) {
  const sourcePath = path.join(androidResPath, bestIcon.folder, bestIcon.filename);
  const destPath = path.join(iosIconPath, mapping.ios);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      copiedIcons.push(`${mapping.size} -> ${mapping.ios}`);
      console.log(`✓ Copied ${mapping.size} icon`);
    } else {
      errors.push(`✗ Source not found: ${sourcePath}`);
    }
  } catch (error) {
    errors.push(`✗ Error copying ${mapping.size}: ${error.message}`);
  }
}

// Create Contents.json for iOS
const contentsJson = {
  "images": [
    { "size": "20x20", "idiom": "iphone", "filename": "AppIcon-40.png", "scale": "2x" },
    { "size": "20x20", "idiom": "iphone", "filename": "AppIcon-60.png", "scale": "3x" },
    { "size": "29x29", "idiom": "iphone", "filename": "AppIcon-58.png", "scale": "2x" },
    { "size": "29x29", "idiom": "iphone", "filename": "AppIcon-87.png", "scale": "3x" },
    { "size": "40x40", "idiom": "iphone", "filename": "AppIcon-80.png", "scale": "2x" },
    { "size": "40x40", "idiom": "iphone", "filename": "AppIcon-120.png", "scale": "3x" },
    { "size": "60x60", "idiom": "iphone", "filename": "AppIcon-120.png", "scale": "2x" },
    { "size": "60x60", "idiom": "iphone", "filename": "AppIcon-180.png", "scale": "3x" },
    { "size": "20x20", "idiom": "ipad", "filename": "AppIcon-20.png", "scale": "1x" },
    { "size": "20x20", "idiom": "ipad", "filename": "AppIcon-40.png", "scale": "2x" },
    { "size": "29x29", "idiom": "ipad", "filename": "AppIcon-29.png", "scale": "1x" },
    { "size": "29x29", "idiom": "ipad", "filename": "AppIcon-58.png", "scale": "2x" },
    { "size": "40x40", "idiom": "ipad", "filename": "AppIcon-40.png", "scale": "1x" },
    { "size": "40x40", "idiom": "ipad", "filename": "AppIcon-80.png", "scale": "2x" },
    { "size": "76x76", "idiom": "ipad", "filename": "AppIcon-76.png", "scale": "1x" },
    { "size": "76x76", "idiom": "ipad", "filename": "AppIcon-152.png", "scale": "2x" },
    { "size": "83.5x83.5", "idiom": "ipad", "filename": "AppIcon-167.png", "scale": "2x" },
    { "size": "1024x1024", "idiom": "ios-marketing", "filename": "AppIcon-1024.png", "scale": "1x" }
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
};

try {
  fs.writeFileSync(
    path.join(iosIconPath, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  console.log('✓ Created Contents.json');
} catch (error) {
  errors.push(`✗ Error creating Contents.json: ${error.message}`);
}

console.log(`\nSummary:`);
console.log(`✓ Successfully copied ${copiedIcons.length} icons`);
if (errors.length > 0) {
  console.log(`✗ ${errors.length} errors:`);
  errors.forEach(error => console.log(`  ${error}`));
}

console.log('\nNext steps:');
console.log('1. Open ios/Paroliamo.xcworkspace in Xcode');
console.log('2. Clean build folder (Product → Clean Build Folder)');
console.log('3. Build and run to see the new app icon');
console.log('\nNote: You may need to resize some icons to exact iOS requirements using an image editor.');