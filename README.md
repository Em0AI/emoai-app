<div align="center">
  <!-- Replace with your logo -->
  <img src="assets/logo.svg" alt="Logo" width="150"/>
</div>

# EmoAI - Your Companion for Emotional Healing and Growth

**Production URL**: [https://app.emoai.co.uk/](https://app.emoai.co.uk/)

## Application Preview

| Main Page | Chat Interface | Emotion Diary |
| :---: | :---: | :---: |
| ![main.png](assets/home.png) | ![chat.png](assets/chat.png) | ![diary.png](assets/emotion_diary.png) |

## Project Overview

**EmoAI** is an AI Agent web application designed to provide emotional support, foster personal growth, and offer meaningful companionship. It utilizes advanced language models to embody different roles, engaging users in thoughtful conversations to help them explore their inner world, track emotional patterns, and find a safe, warm space for communication.

This project is organized into a frontend, a backend, and documentation, aiming to build a complete and scalable AI application.

## Key Features

*   **Dynamic Agent Selection**: Automatically chooses the most suitable AI personality (e.g., Counselor, Empath) based on the conversational context.
*   **Real-time Emotion & Intent Analysis**: Accurately identifies the user's emotions and intentions during the conversation to guide the AI's response.
*   **Streaming Text Responses**: Displays AI messages with a "typewriter" effect for a more natural and engaging interaction.
*   **RAG-Enhanced Knowledge**: Provides deeper, more accurate answers by integrating knowledge from external documents using Retrieval-Augmented Generation.
*   **Automated Emotion Diary**: Logs conversational emotion data and generates insightful daily and weekly reports for user self-reflection.
*   **Character Selection Gallery**: A visually rich interface for users to browse and choose their preferred AI companion.
*   **Adaptive AI Persona**: The AI's tone and style evolve in response to the user's emotional state throughout the dialogue.
*   **Modern & Responsive Interface**: A clean, intuitive, and fast user interface built with the latest web technologies for a seamless experience.

## Tech Stack

| Category      | Technology                                                                                                                                |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **Frontend**  | [Nuxt.js](https://nuxt.com/) (Vue.js), [TypeScript](https://www.typescriptlang.org/), [Bun](https://bun.sh/), [Tailwind CSS](https://tailwindcss.com/) |
| **Backend**   | [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org/), [Uvicorn](https://www.uvicorn.org/)                               |
| **AI/ML**     | `nvidia/llama-3.1-nemotron-nano-8b-v1`, `transformers`, `torch`, `faiss-cpu` (for RAG)                                                       |
| **Assets**    | All static assets are managed within the `/frontend/public/` directory.                                                                   |

## Project Structure

```
emoai-app/
├── backend/         # Backend FastAPI Application
│   ├── src/
│   │   ├── app.py   # FastAPI server entry point
│   │   └── main.py  # Core conversation logic
│   └── requirements.txt
├── frontend/        # Frontend Nuxt.js Application
│   ├── src/
│   │   ├── app.vue
│   │   ├── pages/   # Page components
│   │   └── components/ # Reusable components
│   ├── nuxt.config.ts
│   └── package.json
├── docs/            # Project documentation
└── README.md        # The file you are currently reading
```

## Getting Started

### 1. Prerequisites

*   Ensure you have [Node.js](https://nodejs.org/) (v18+), [Bun](https://bun.sh/), and [Conda](https://docs.conda.io/en/latest/miniconda.html) installed.
*   Obtain an NVIDIA API key and configure it for the backend.

### 2. Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Conda environment
conda create --name emoai python=3.9 -y
conda activate emoai

# 3. Install dependencies
pip install -r requirements.txt

# 4. Navigate to the src directory
cd src

# 5. Start the development server (with hot-reloading)
# The server will run on http://127.0.0.1:8010
uvicorn app:app --reload --host 0.0.0.0 --port 8010
```

### 3. Frontend Setup

```bash
# 1. (In a separate terminal) Navigate to the frontend directory
cd frontend

# 2. Install dependencies
bun install

# 3. Start the development server
# The application will be available at http://localhost:3000
bun run dev
```

Now, you can open `http://localhost:3000` in your browser to access the EmoAI application.

## Contributing

Contributions to this project are welcome! If you have ideas, suggestions, or have found a bug, please feel free to open an Issue or submit a Pull Request.

## License

This project is open-source and licensed under the [MIT License](LICENSE).
