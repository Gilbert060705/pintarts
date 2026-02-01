# PINTUPS - AI-Powered Art Recommendation System

**PINTUPS** is an innovative art recommendation platform that combines vector-based similarity search with social features to help users discover artwork tailored to their unique tastes. Built for the PINUS Hackathon, the system leverages AI embeddings and collaborative filtering to create personalized art experiences.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
  - [Backend Architecture](#backend-architecture)
  - [Frontend Architecture](#frontend-architecture)
- [Data Model](#data-model)
- [Core Features Explained](#core-features-explained)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)

---

## 🎨 Overview

PINTUPS is a cross-platform mobile application that revolutionizes how users discover and collect artwork. By analyzing user preferences through AI-powered embeddings (CLIP model), the platform provides intelligent recommendations that evolve with user taste. The system supports social discovery through "taste blending" - allowing users to explore artwork that combines preferences from multiple users.

### Project Goals
- **Personalized Discovery**: Use AI to understand and match user art preferences
- **Social Exploration**: Enable collaborative taste discovery through user blending
- **Seamless Experience**: Provide intuitive mobile-first interface built with React Native
- **Scalable Architecture**: Leverage vector databases for efficient similarity search

---

## ✨ Key Features

### 1. **AI-Powered Recommendations**
- Uses OpenAI's CLIP model to generate 512-dimensional embeddings
- Vector similarity search using pgvector for efficient matching
- Text-to-image semantic search capabilities
- Dynamic taste profile that evolves with user interactions

### 2. **Taste Blending**
- Combine taste profiles from two users to discover hybrid recommendations
- Explore artwork that appeals to multiple aesthetic preferences
- Social discovery mechanism for finding like-minded art enthusiasts

### 3. **Wishlist & Collections**
- Save favorite artworks to personal wishlist
- Track artwork preferences across sessions
- Toggle wishlist status with real-time updates

### 4. **Semantic Search**
- Natural language search for artwork descriptions
- "Find paintings with vibrant colors and abstract patterns"
- Text queries converted to embeddings for similarity matching

### 5. **User Similarity Scoring**
- Calculate taste similarity between users using cosine similarity
- Discover users with similar art preferences
- Social features based on taste compatibility

---

## 🛠 Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with pgvector extension
- **AI/ML**: 
  - OpenAI CLIP (clip-vit-base-patch32)
  - PyTorch for model inference
  - Transformers library
- **ORM**: SQLAlchemy with raw SQL for vector operations
- **Authentication**: Password hashing with bcrypt
- **Container**: Docker & Docker Compose

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Language**: TypeScript
- **UI Components**: Custom components with gesture handling
- **State Management**: React hooks
- **API Client**: Axios for HTTP requests

### Infrastructure
- **Vector Database**: PostgreSQL with pgvector (HNSW indexing)
- **Containerization**: Docker
- **API Documentation**: Swagger/OpenAPI (FastAPI auto-generated)

---

## 🏗 Architecture

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Users      │  │  Recommender │  │    Blend     │      │
│  │   Router     │  │    Router    │  │    Router    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Wishlist    │  │    CRUD      │                         │
│  │   Router     │  │   Layer      │                         │
│  └──────┬───────┘  └──────┬───────┘                         │
│         │                  │                                 │
│         └──────────────────┴─────────────────┐              │
│                                                │              │
│                      ┌─────────────────────────▼──────┐     │
│                      │   Database Layer (SQLAlchemy)  │     │
│                      └─────────────────────────────────┘     │
└──────────────────────────────────┬───────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   PostgreSQL + pgvector     │
                    │                              │
                    │  • Users (taste_vector)      │
                    │  • Paintings (embedding)     │
                    │  • Wishlists                 │
                    │  • HNSW Index for vectors    │
                    └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AI/ML Pipeline                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Preferences ──► CLIP Text Encoder ──► 512D Vector     │
│                                                               │
│  Painting Images ──► CLIP Vision Encoder ──► 512D Vector    │
│                                                               │
│  Search Query ──► CLIP Text Encoder ──► Vector Search       │
│                                                               │
│  Blend = (Vector1 + Vector2) / 2 ──► Recommendations        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Backend Components

**1. API Layer (FastAPI Routers)**
- **Users Router** (`/users`): User registration, login, profile management, taste profile updates
- **Recommenders Router** (`/recommend`): Personalized recommendations, semantic search
- **Blend Router** (`/blend`): Taste blending between users, collaborative discovery
- **Wishlist Router** (`/wishlist`): Add/remove artworks, view saved items

**2. Business Logic Layer (CRUD)**
- User management with password hashing
- Vector operations for similarity search
- Wishlist toggle operations
- Taste profile calculations

**3. AI/ML Layer (recsys/utils.py)**
- **CLIP Model Integration**: Text and image embedding generation
- **Vector Operations**: Cosine similarity for matching
- **Embedding Pipeline**: 
  - Text preferences → 512D taste vector
  - Image URLs → 512D painting embeddings
  - Search queries → vector search

**4. Data Layer**
- PostgreSQL with pgvector extension
- Vector similarity using `<=>` operator (cosine distance)
- HNSW indexing for efficient nearest neighbor search

---

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Native App                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  App.tsx (Root)                                          │
│    │                                                      │
│    └── NavigationContainer                               │
│          │                                                │
│          └── RootNavigator (Stack)                       │
│                │                                          │
│                ├── SplashScreen                          │
│                ├── LoginScreen                           │
│                ├── OnboardingScreen                      │
│                │                                          │
│                ├── MainApp (Tab Navigator)               │
│                │    │                                     │
│                │    ├── DiscoverScreen (Feed)            │
│                │    ├── WishlistScreen (Saved)           │
│                │    ├── BlendScreen (Social)             │
│                │    └── ProfileScreen (Settings)         │
│                │                                          │
│                ├── ArtDetailScreen (Modal)               │
│                └── ARPreviewScreen (Full)                │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Component Layer                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  • LiquidGlassTabBar: Custom animated tab bar            │
│  • SearchBottomSheet: Modal search interface             │
│  • BlendResultsSheet: Show blended recommendations       │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      API Layer                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  src/api/                                                │
│    ├── config.ts      (Base URL, Axios setup)           │
│    ├── auth.ts        (Login, Register)                 │
│    ├── users.ts       (Profile, User list)              │
│    ├── recommend.ts   (Get recommendations, Search)      │
│    └── wishlist.ts    (Toggle, Get wishlist)            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Core Features Explained

### 1. Taste Vector Generation

When a user signs up and selects preferences (e.g., "impressionist", "vibrant", "modern"):
1. Preferences are combined into a text prompt
2. CLIP text encoder generates a 512D embedding
3. Vector is normalized and stored in PostgreSQL
4. Used for all future recommendations

### 2. Recommendation Algorithm

```python
1. Retrieve user's taste_vector from database
2. Query paintings table with vector similarity:
   ORDER BY embedding <=> user_taste_vector
3. Join with wishlists to show saved status
4. Return top N paintings
```

### 3. Blend Feature

Combining two users' tastes:
```python
blend_vector = (user1_vector + user2_vector) / 2
recommendations = query_paintings_by_vector(blend_vector)
```

### 4. Semantic Search

Text query to artwork:
```python
1. User enters: "peaceful landscapes with water"
2. Generate embedding from query using CLIP
3. Search paintings by vector similarity
4. Return visually matching artworks
```

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Backend Setup

1. **Create virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
cd backend/app
pip install -r requirements.txt
```

3. **Start PostgreSQL with pgvector**
```bash
docker compose up -d
```

4. **Populate database with paintings**
```bash
python populate_paintings.py
```

5. **Run the API server**
```bash
cd ..
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

6. **Access Swagger documentation**
```
http://127.0.0.1:8000/docs
```

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start Expo development server**
```bash
npx expo start
```

3. **Run on device**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

### Environment Configuration

**Backend** (`backend/app/database.py`):
```python
DATABASE_URL = "postgresql://admin:password123@localhost:5432/art_recommender"
```

**Frontend** (`frontend/src/api/config.ts`):
```typescript
export const API_BASE_URL = "http://YOUR_IP:8000"
```

---

## 📚 API Documentation

### Authentication

**POST** `/users` - Register new user
```json
{
  "username": "artlover",
  "email": "art@example.com",
  "password": "secure123",
  "preferences": ["impressionist", "vibrant", "landscape"]
}
```

**POST** `/users/login` - User login
```json
{
  "username": "artlover",
  "password": "secure123"
}
```

### Recommendations

**GET** `/recommend/{user_id}` - Get personalized recommendations
- Returns top 10 paintings based on taste vector

**GET** `/recommend/search?query=peaceful landscapes` - Semantic search
- Natural language search for artworks

### Social Features

**GET** `/users?user_id={id}` - Get all users with similarity scores
- Returns users sorted by taste compatibility

**POST** `/blend?user_1_id={id1}&user_2_id={id2}` - Blend two users
- Returns recommendations combining both taste profiles

### Wishlist

**POST** `/wishlist` - Toggle painting in wishlist
```json
{
  "user_id": "uuid",
  "painting_id": "uuid"
}
```

**GET** `/wishlist?user_id={id}` - Get user's wishlist
- Returns all saved paintings

---

## 🎯 Future Enhancements

- **AR Preview**: View artwork in real space using device camera
- **Social Feed**: Share discoveries and collections
- **Purchase Integration**: Connect with art marketplaces
- **Style Transfer**: Apply artwork styles to user photos
- **Collaborative Collections**: Shared wishlists and galleries

---

## 👥 Team

Built for PINUS Hackathon 2026

---

## 📄 License

This project is part of the PINUS Hackathon submission.