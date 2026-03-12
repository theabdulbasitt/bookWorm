# BookWorm: AI-Powered Book Discovery App

BookWorm is a full-stack mobile application that allows users to discover, search, and track their favorite books. It leverages a modern tech stack to provide a seamless cross-platform experience.

## 🚀 Key Features
- **Book Discovery**: Dynamic home feed with trending and recommended books.
- **Search Logic**: Search through a comprehensive database of titles and authors.
- **User Authentication**: Secure JWT-based login and signup flow.
- **Profile Management**: Personalize your reading profile and track your activity.
- **Cloud-Synced Backend**: Real-time data persistence with MongoDB and Railway.

## 🛠️ Technology Stack

### Frontend (Mobile)
- **Framework**: React Native with Expo
- **Routing**: Expo Router (File-based routing)
- **State Management**: Context API
- **Networking**: Axios for API interaction
- **Build System**: EAS (Expo Application Services)

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary (Image management)
- **Deployment**: Railway

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Expo Go app on your physical device or an Android/iOS emulator

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/theabdulbasitt/bookWorm.git
   cd Book-Recommender-ReactNative
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm start
   ```

3. **Setup the Mobile App:**
   ```bash
   cd mobile
   npm install
   # Create a .env file with your EXPO_PUBLIC_API_URL
   npx expo start
   ```

## 🏗️ Production Build

The Android APK is built using EAS. To generate your own build:
```bash
eas build --platform android --profile production
```

---

*This project was developed as a showcase of Full-Stack Mobile Development capabilities using the React Native ecosystem.*


<img width="1024" height="1024" alt="Gemini_Generated_Image_mq0fsomq0fsomq0f" src="https://github.com/user-attachments/assets/3a0f39ea-b3a7-48db-8dea-fd4426c74e49" />

