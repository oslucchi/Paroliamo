#!/bin/bash

# Script to generate temporary app icons of correct sizes
# This creates a simple colored square for each required size

ICON_DIR="/Users/osvaldo/Dev/Personali/Paroliamo/ios/Paroliamo/Images.xcassets/AppIcon.appiconset"

# Create a simple colored square using ImageMagick (if available) or copy existing
# First, let's try to use the existing icon as base and resize it

if command -v convert &> /dev/null; then
    echo "Using ImageMagick to resize icons..."
    
    # Use the existing 48x48 as source and resize to all required sizes
    SOURCE_ICON="$ICON_DIR/AppIcon-120.png"
    
    convert "$SOURCE_ICON" -resize 20x20 "$ICON_DIR/AppIcon-20.png"
    convert "$SOURCE_ICON" -resize 29x29 "$ICON_DIR/AppIcon-29.png"
    convert "$SOURCE_ICON" -resize 40x40 "$ICON_DIR/AppIcon-40.png"
    convert "$SOURCE_ICON" -resize 58x58 "$ICON_DIR/AppIcon-58.png"
    convert "$SOURCE_ICON" -resize 60x60 "$ICON_DIR/AppIcon-60.png"
    convert "$SOURCE_ICON" -resize 76x76 "$ICON_DIR/AppIcon-76.png"
    convert "$SOURCE_ICON" -resize 80x80 "$ICON_DIR/AppIcon-80.png"
    convert "$SOURCE_ICON" -resize 87x87 "$ICON_DIR/AppIcon-87.png"
    convert "$SOURCE_ICON" -resize 120x120 "$ICON_DIR/AppIcon-120.png"
    convert "$SOURCE_ICON" -resize 152x152 "$ICON_DIR/AppIcon-152.png"
    convert "$SOURCE_ICON" -resize 167x167 "$ICON_DIR/AppIcon-167.png"
    convert "$SOURCE_ICON" -resize 180x180 "$ICON_DIR/AppIcon-180.png"
    convert "$SOURCE_ICON" -resize 1024x1024 "$ICON_DIR/AppIcon-1024.png"
    
    echo "Icons generated successfully!"
else
    echo "ImageMagick not found. Please install it with: brew install imagemagick"
    echo "Or manually create icons with the correct sizes."
fi