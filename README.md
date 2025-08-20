# قضاء الصلوات - Qada Prayer Tracker

Qada Prayer Tracker helps you plan and complete missed daily prayers in an organized, trackable way. The app provides an Arabic-first interface, clear progress tracking, and a concise guidance page summarizing widely accepted fiqh positions without quoting primary texts.

## 📘 Ruling Overview (from `app/ruling/page.js`)

The `/ruling` page provides a concise summary based on mainstream fiqh:

- The majority view across the four Sunni schools is that missed obligatory prayers must be made up.
- If many prayers are missed, plan a steady routine and continue until completion.
- Recommended sequencing: follow chronological order when feasible; if current prayer time risks ending, perform the current prayer first, then continue Qada.
- The page uses neutral language and avoids quoting primary texts directly. It aims to guide planning and consistency, not replace scholarly study.

## 🎯 Purpose & Vision

**Qada Tracker** is a specialized Islamic application designed to help Muslims systematically track and make up their missed prayers (Qada). Based on the Islamic principles this application provides a structured approach to fulfilling this religious obligation.

This application supports users with:
- **Systematic tracking** of missed prayers by day and type
- **Progress visualization** to maintain motivation
- **Guidance summary** on methods and common rulings
- **Structured approach** to complete large numbers of missed prayers

## ✨ Features

### 🕌 **Prayer Tracking System**
- Track missed prayers by day: Fajr, Dhuhr, Asr, Maghrib, Isha
- Mark individual prayers as completed
- Support for both date range and number of days methods
- Automatic progress calculation and statistics

### 📊 **Progress Visualization**
- Daily progress tracking with completion percentages
- Visual indicators for completed vs remaining prayers
- Statistical overview of total progress
- Motivation through visual achievement

### 🔐 **Secure Authentication**
- Email-based authentication via Supabase
- Password reset functionality
- Secure user data isolation with Row Level Security (RLS)
- Session management and persistence

### 🌙 **Beautiful Islamic Interface**
- Dark theme optimized for comfortable use
- Arabic-first design with RTL support
- Islamic color palette (green accents)
- Responsive design for all devices

### 📚 **Guidance Overview**
- Ruling page (`/ruling`) summarizing mainstream views on making up missed prayers
- High-level overview reflecting the position of the four major Sunni schools that making up missed obligatory prayers is required
- Practical guidance for planning and sequencing Qada
- Neutral, concise explanations (no direct quotations from primary texts)

### 🏛️ **Arabic-First Design**
- Primary font: IBM Plex Sans Arabic
- Header font: Aref Ruqaa (traditional Arabic calligraphy)
- RTL (Right-to-Left) layout support
- Culturally appropriate Islamic UI elements

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account and project
- Google OAuth credentials (for authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/qada-tracker.git
cd qada-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the content from `schema.sql`
4. Run the SQL script to create tables, policies, and functions

### 4. Configure Supabase Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure email authentication settings
3. Set up redirect URLs for password reset:
   - `http://localhost:3000/reset-password` (development)
   - `https://yourdomain.com/reset-password` (production)
4. Enable "Confirm email" if desired for additional security

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Replace the values with your actual Supabase project URL and anon key. You can find these in your Supabase project settings → API.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and start tracking your Qada prayers!

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with Arabic-first typography
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email-based)
- **UI Components**: Radix UI primitives
- **Date Handling**: date-fns

### Project Structure

```
qadaa/
├── app/
│   ├── layout.js            # Root layout with Arabic fonts
│   ├── page.js              # Main application page
│   ├── reset-password/      # Password reset page
│   ├── ruling/              # Islamic ruling page
│   ├── robots.js            # SEO robots configuration
│   ├── sitemap.js           # SEO sitemap generation
│   └── globals.css          # Global styles and theme
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.jsx       # Button component
│   │   ├── dialog.jsx       # Modal dialog component
│   │   ├── progress.jsx     # Progress bar component
│   │   └── ...              # Other UI components
│   ├── QadaTracker.jsx      # Main prayer tracking component
│   ├── AccountDialog.jsx    # Authentication modal
│   ├── Navbar.jsx           # Navigation component
│   ├── Footer.jsx           # Footer component
│   └── Settings.jsx         # Settings configuration
├── lib/
│   ├── utils.js             # Utility functions
│   └── supabase.js          # Supabase client and helpers
├── schema.sql               # Database schema and policies
└── DEPLOYMENT.md            # Comprehensive deployment guide
```

### Database Schema

The application uses two main tables:

**`qada_settings`**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `start_date` / `end_date` (DATE, for date range method)
- `number_of_days` (INTEGER, for days count method)
- `created_at` / `updated_at` (TIMESTAMP)

**`qada_progress`**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `day_number` (INTEGER, day sequence)
- `fajr_completed` / `dhuhr_completed` / `asr_completed` / `maghrib_completed` / `isha_completed` (BOOLEAN)
- `created_at` / `updated_at` (TIMESTAMP)

**`user_qada_stats`** (View)
- Automatically calculates completion statistics per user

## 🎨 Design Philosophy

### Arabic Typography Hierarchy

1. **Header**: Aref Ruqaa - Traditional Arabic calligraphy style for Islamic elegance
2. **Body Text**: IBM Plex Sans Arabic - Modern, readable Arabic font
3. **UI Elements**: Clean, minimalist design respecting Islamic aesthetics

### Islamic Color Palette

- **Background**: `#0a0a0a` - Deep black for minimal distraction
- **Primary**: `#3ecf8e` - Calming green representing growth
- **Text**: `#ededed` - Soft white for comfortable reading
- **Muted**: `#a3a3a3` - Subtle gray for secondary information

### UI/UX Principles

- **Simplicity**: Clean interface to focus on the spiritual act of Qada
- **Accessibility**: High contrast and keyboard navigation support
- **Cultural Sensitivity**: RTL layout and Arabic-first design
- **Islamic Aesthetics**: Respectful design appropriate for religious use

## 📘 Ruling Overview (from `app/ruling/page.js`)

The `/ruling` page provides a concise summary based on mainstream fiqh:

- The majority view across the four Sunni schools is that missed obligatory prayers must be made up.
- If many prayers are missed, plan a steady routine and continue until completion.
- Recommended sequencing: follow chronological order when feasible; if current prayer time risks ending, perform the current prayer first, then continue Qada.
- The page uses neutral language and avoids quoting primary texts directly. It aims to guide planning and consistency, not replace scholarly study.

## 🛠️ Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📱 Mobile Responsiveness

The application is fully responsive and works beautifully on:
- Desktop computers
- Tablets (iPad, Android tablets)  
- Mobile phones (iPhone, Android)
- PWA (Progressive Web App) support with manifest.json
- Offline-capable for uninterrupted worship tracking

## 🔐 Privacy & Security

- **Row Level Security (RLS)**: Users can only access their own data
- **OAuth Integration**: Secure Google authentication
- **Data Isolation**: Complete user data separation
- **HTTPS Only**: All connections encrypted in production
- **Minimal Data Collection**: Only essential information is stored

## 🌟 Contributing

This project is built for the sake of Allah to help the Muslim Ummah. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper Islamic etiquette
4. Test thoroughly
5. Submit a pull request

Please ensure your contributions:
- Align with Islamic values and jurisprudence
- Respect the spiritual purpose of the application
- Maintain accuracy in Islamic rulings and terminology
- Follow the code of conduct in CONTRIBUTING.md

See CONTRIBUTING.md for detailed guidelines.

## ℹ️ Notes and Scope

- This application provides tooling for planning and tracking Qada prayers.
- The `/ruling` page offers a high-level summary to help users plan; it does not provide fatwas or scholarly citations.
- Users with complex circumstances should consult qualified scholars locally.

## 📄 License

This project is dedicated to Allah SWT and is available under the MIT License. Feel free to use, modify, and distribute it for beneficial purposes.

## 🙏 Acknowledgments

- **Allah SWT** - For all guidance and blessings
- **Prophet Muhammad ﷺ** - For teaching us the value of consistency
- **The Supabase Team** - For the beautiful design inspiration
- **The Next.js Team** - For the amazing framework
- **Google Fonts** - For beautiful Arabic typography

---

<div align="center">

**May Allah accept our efforts and make them beneficial • آمين**

**Open Source**: This project is MIT-licensed and welcomes contributions.

---

### 🔗 Useful Links

- **Live Demo**: [qadaa.org](https://qadaa.org)
- **Islamic Rulings**: [qadaa.org/ruling](https://qadaa.org/ruling)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Contributing Guide**: [CONTRIBUTING.md](./CONTRIBUTING.md)

</div>
