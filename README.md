# Smart Bookmark App

A simple bookmark manager built with **Next.js**, **Supabase**, and **Tailwind CSS**.  

Users can log in with **Google**, add, delete, and view their bookmarks. Bookmarks are private per user and updates happen in real time.

## 🔗 Live Demo

[https://smart-bookmark-app-nmit.vercel.app/](https://smart-bookmark-app-nmit.vercel.app/)

## 📂 Features

- Google OAuth authentication only
- Add bookmarks with **Title** and **URL**
- Delete bookmarks
- Private bookmarks per user
- Realtime updates across multiple tabs
- Styled with Tailwind CSS

## 🛠 Tech Stack

- **Next.js (App Router)** for frontend
- **Supabase** for Authentication, Database, and Realtime
- **Tailwind CSS** for styling
- **Vercel** for deployment

## ⚙️ Setup & Run Locally

1. Clone the repo:

```bash
git clone https://github.com/11vaish/smart-bookmark-app.git
cd smart-bookmark-app


Challenges & Solutions

Supabase environment variables not found during Vercel build

Problem: Build failed with supabaseUrl is required or supabaseKey is required

Solution: Added NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Environment Variables (Production)

Bookmarks not private per user

Problem: Initially all bookmarks were visible to everyone

Solution: Added user_id: session?.user.id when inserting bookmarks and filtered by user_id when fetching

UI looked plain

Solution: Added Tailwind CSS for clean inputs, buttons, and cards



Deployment

Deployed on Vercel: https://smart-bookmark-app-nmit.vercel.app/