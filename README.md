# CapyBot - Your AI Therapist

A modern AI-powered mental wellness application with emotion detection, personalized therapy, and voice interaction capabilities.

## ✨ Features

- **Real-time Emotion Detection**: Analyzes 27 different emotions from user messages
- **Multiple Therapy Modes**: Professional, supportive, and cheerful therapy styles
- **Voice Interaction**: Complete speech-to-text and text-to-speech capabilities
- **Session Management**: Persistent conversations with Firebase
- **Analytics Dashboard**: Emotion trends and user insights
- **Responsive Design**: Optimized for all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Firebase account
- Groq API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sakthisudarsh1206/CapyBot--Your-AI-therapist.git
cd CapyBot--Your-AI-therapist
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your API keys and Firebase configuration in `.env.local`.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Deployment on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **AI/ML**: Groq LLaMA 3 70B
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Voice**: Google Cloud Speech APIs
- **Deployment**: Vercel

## 📁 Project Structure

```
capybot-therapy-app/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   ├── chat/              # Chat page
│   ├── analytics/         # Analytics dashboard
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
└── package.json          # Dependencies
```

## 🔑 Environment Variables

Create a `.env.local` file with:

```env
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For support, please open an issue on GitHub or contact the development team.

---

Made with ❤️ for mental wellness
