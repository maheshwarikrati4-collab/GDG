# Overview

MENTORA is a gamified career development platform that helps users "level up" their professional skills through interactive experiences. The application combines AI-powered career guidance with a gaming-inspired interface, featuring internship matching, communication practice scenarios, and personalized career coaching. Users progress through levels by completing tasks and earning XP, making professional development engaging and motivational.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a traditional server-rendered architecture with Flask templates enhanced by client-side JavaScript. The frontend features a dark, neon-accented gaming theme with two main interfaces:
- **Landing Page**: Welcome screen with login/registration functionality and feature overview
- **Dashboard**: Main application interface with sidebar navigation and multiple content sections

The UI is built with semantic HTML templates, custom CSS using CSS variables for theming, and vanilla JavaScript for interactivity. The design emphasizes a "retro gaming" aesthetic with pixel fonts, neon colors, and level-up animations.

## Backend Architecture
The Flask application follows a modular structure with separate service classes for different functionalities:
- **Main Flask App** (`app.py`): Handles routing, session management, and serves templates
- **AI Growth Companion** (`career_advisor.py`): Provides personalized career guidance using Google's Gemini AI
- **Communication Coach** (`communication_coach.py`): Manages practice scenarios and provides feedback

The application uses session-based state management and hardcoded sample data for internships. User profiles and progress are managed in-memory rather than persistent storage.

## Data Architecture
Currently implements in-memory data storage with:
- Hardcoded internship listings with structured metadata (skills, degrees, experience levels)
- Session-based user profile management
- Predefined communication practice scenarios with difficulty levels and XP rewards

The data structure is designed to support gamification features like user levels, XP progression, and achievement tracking.

## AI Integration
Uses Google's Gemini AI (gemini-2.5-flash model) for:
- Personalized career guidance based on user profiles
- Interview feedback and coaching
- Communication scenario responses

The AI services are implemented as separate classes that build context from user profiles and provide structured prompts to the Gemini API.

# External Dependencies

## AI Services
- **Google Gemini AI**: Primary AI service for career guidance and feedback (accessed via `google.genai` client)
- Requires `GEMINI_API_KEY` environment variable

## Web Framework
- **Flask**: Python web framework for server-side rendering and API endpoints
- **Jinja2**: Template engine (included with Flask) for dynamic HTML generation

## Frontend Libraries
- **Google Fonts**: Press Start 2P (pixel font) and Inter (modern typography)
- **Custom CSS**: No external CSS frameworks, uses modern CSS features like CSS Grid and custom properties

## Environment Configuration
- **Flask Secret Key**: Session management (configurable via `FLASK_SECRET_KEY` environment variable)
- **Development Mode**: Uses fallback configurations for local development

## Browser APIs
- **Local Storage**: For client-side data persistence
- **Fetch API**: For AJAX requests to backend endpoints
- **DOM APIs**: For dynamic UI updates and animations

The application is designed to be lightweight with minimal external dependencies, focusing on core web technologies enhanced by AI integration.