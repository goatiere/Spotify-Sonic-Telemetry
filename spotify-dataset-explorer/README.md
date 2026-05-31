# Spotify Sonic Telemetry

A data-driven interactive dashboard that visualizes Spotify's analytical insights. This application leverages the power of real-time data plotting to showcase all-time greatest hits, top artists, and streaming metrics from the 2025 Wrapped campaign.

## Overview

**Spotify Sonic Telemetry** is designed to transform complex streaming statistics into a beautiful, glowing, and interactive user experience. It provides a clean interface for users to explore their musical consumption patterns and top-performing tracks through visual telemetry.

## Key Features

*   **Interactive Dashboard**: Explore Spotify's streaming data via a sleek, responsive UI.
*   **Data Art Visualization**: Dynamic glow telemetry plots powered by Recharts.
*   **2025 Wrapped Analysis**: Dedicated section for analyzing 2025 streaming trends.
*   **Gemini AI Integration**: Server-side capabilities powered by the Google Gemini API for advanced data processing and insights[cite: 4, 5].

## Technical Stack

*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS[cite: 5].
*   **Visualization**: Recharts for telemetry plotting[cite: 5].
*   **Backend**: Express.js server[cite: 5].
*   **AI/LLM**: Google Gemini API integration (`@google/genai`)[cite: 5].
*   **Animation**: Motion for smooth UI transitions[cite: 5].

## Getting Started

### Prerequisites

*   Node.js (>= 20.0.0)[cite: 5, 6].
*   A valid Gemini API Key[cite: 1].

### Installation

1.  Clone the repository and install dependencies:
```bash
    npm install
    ```

2.  Configure your environment variables. Create a `.env` file based on `.env.example`:
```bash
    GEMINI_API_KEY="your_api_key_here"
    APP_URL="your_app_url_here"
    ```

3.  Run the development server:
```bash
    npm run dev
    ```

## Project Configuration

This project is configured for deployment with AI Studio and handles runtime injection of secrets via the environment[cite: 1]. The `app.json` configuration defines the core capabilities, including server-side Gemini API support[cite: 4].
