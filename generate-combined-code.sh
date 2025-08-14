#!/bin/bash

# Generate Combined PowerPoint Code for AI Review
# This script creates a comprehensive code review document

echo "🚀 Generating combined PowerPoint generation code..."

# Create output directory if it doesn't exist
mkdir -p ./code-review

# Run the combiner script and save output
node combine-ppt-code.js > ./code-review/combined-ppt-code.txt

# Check if the file was created successfully
if [ -f "./code-review/combined-ppt-code.txt" ]; then
    echo "✅ Combined code generated successfully!"
    echo "📁 Output file: ./code-review/combined-ppt-code.txt"
    echo "📊 File size: $(wc -c < ./code-review/combined-ppt-code.txt) bytes"
    echo "📄 Line count: $(wc -l < ./code-review/combined-ppt-code.txt) lines"
    echo ""
    echo "🤖 Ready for AI review! Copy the contents of combined-ppt-code.txt"
    echo "   and paste into your AI tool for comprehensive code analysis."
    echo ""
    echo "💡 The file contains:"
    echo "   • Complete PowerPoint generation flow"
    echo "   • API endpoints and request handling"
    echo "   • AI processing and prompt engineering"
    echo "   • Theme system and styling logic"
    echo "   • Slide generation and layout code"
    echo "   • PptxGenJS integration"
    echo "   • Analysis questions for AI review"
else
    echo "❌ Failed to generate combined code file"
    exit 1
fi
