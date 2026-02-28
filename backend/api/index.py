"""
Vercel Serverless Function Entry Point
This file wraps the FastAPI app for Vercel's serverless deployment
"""
import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Import the FastAPI app from server.py
from server import app

# Vercel expects the app to be named 'app' or 'handler'
# FastAPI works directly with Vercel's Python runtime
