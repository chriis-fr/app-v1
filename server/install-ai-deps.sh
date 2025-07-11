#!/bin/bash

echo "🚀 Installing AI dependencies for the server..."

# Install axios for HTTP requests to Groq API
npm install axios

echo "✅ Dependencies installed successfully!"

echo ""
echo "📝 Next steps:"
echo "1. Add your GROQ_API_KEY to your .env file:"
echo "   GROQ_API_KEY=gsk_your_api_key_here"
echo ""
echo "2. Get your Groq API key from: https://console.groq.com/"
echo ""
echo "3. Run 'npm run dev' to start the server with AI features"
echo ""
echo "🎉 AI chatbot is now integrated into your existing server!" 