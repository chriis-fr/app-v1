#!/usr/bin/env python3
"""
Startup script for AI Chatbot Service
"""

import os
import sys
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Main startup function"""
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    
    # Check for required environment variables
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        print("⚠️  Warning: GROQ_API_KEY not found in environment variables")
        print("   The AI service will not function without a valid Groq API key")
        print("   Get your API key from: https://console.groq.com/")
        print()
    
    # Print startup information
    print("🚀 Starting AI Chatbot Service...")
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"   Reload: {reload}")
    print()
    
    if groq_api_key:
        print("✅ Groq API key configured")
    else:
        print("❌ Groq API key not configured")
    
    print()
    print("📚 API Documentation available at:")
    print(f"   Swagger UI: http://{host}:{port}/docs")
    print(f"   ReDoc: http://{host}:{port}/redoc")
    print()
    
    # Start the server
    try:
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down AI Chatbot Service...")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 