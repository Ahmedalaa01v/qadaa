# قليل دائم - Little but Continuous

<div align="center">

**"قليل دائم خير من كثير منقطع"**

*A small but continuous effort is better than a large but intermittent one.*

**Built for the sake of Allah SWT • بُني لله سبحانه وتعالى**

---

*"وَقُل رَّبِّ زِدْنِي عِلْماً"* - **"And say: My Lord, increase me in knowledge"** (Quran 20:114)

</div>

## 🎯 Purpose & Vision

**Qaleel Daim** is more than just a time tracker—it's a spiritual and practical tool designed to help you build consistency in your daily actions for the sake of Allah. Based on the profound Islamic wisdom that **"small but consistent actions are better than large but intermittent ones,"** this application encourages daily dedication to personal growth, worship, learning, and meaningful work.

### The Philosophy Behind قليل دائم

In Islam, consistency in good deeds is highly valued. The Prophet Muhammad ﷺ said:

> *"أحب الأعمال إلى الله أدومها وإن قل"*
>
> **"The most beloved of deeds to Allah are those that are most consistent, even if they are few."** - Sahih Bukhari

This application embodies this teaching by:
- **Encouraging daily consistency** over sporadic bursts of activity
- **Visualizing progress** through a beautiful heatmap like GitHub's contribution graph
- **Making accountability easy** with simple timer-based tracking
- **Building lasting habits** that benefit both this life and the hereafter

## ✨ Features

### 🕐 **Minimal Timer Interface**
- Clean, distraction-free 25-minute Pomodoro timer
- Large, easy-to-read display using IBM Plex Mono font
- Simple start/pause/reset controls
- Automatic session tracking and storage

### 📊 **GitHub-Style Heatmap**
- Visual representation of your daily consistency
- Hover over any day to see exact work duration
- Beautiful gradient showing intensity levels (0-5)
- Full year overview to track long-term progress

### 👤 **Seamless Google Authentication**
- One-click sign-in with Google
- Persistent sessions (maintained for a full year)
- Secure user data isolation
- Beautiful Arabic-first interface

### 🌙 **Beautiful Dark Theme**
- Supabase-inspired color palette
- Easy on the eyes for extended use
- Thoughtfully designed Arabic typography
- Responsive design for all devices

### 🏛️ **Arabic-First Design**
- Primary font: IBM Plex Sans Arabic
- Header font: Aref Ruqaa (Google Fonts)
- Timer font: IBM Plex Mono
- RTL (Right-to-Left) layout support
- Culturally appropriate UI elements

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account and project
- Google OAuth credentials (for authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/qaleel-daim.git
cd qaleel-daim
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the content from `supabase-setup.sql`
4. Run the SQL script to create tables and policies

### 4. Configure Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### 5. Configure Supabase Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Enable Google as a provider
3. Add your Google OAuth credentials
4. Set the Site URL to your domain

### 6. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase project URL and anon key.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom Arabic fonts
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **UI Components**: Radix UI primitives
- **Date Handling**: date-fns with Arabic locale support

### Project Structure

```
qaleel-daim/
├── app/
│   ├── layout.js          # Root layout with Arabic fonts
│   ├── page.js            # Main application page
│   └── globals.css        # Global styles and theme
├── components/
│   ├── ui/
│   │   ├── button.jsx     # Reusable button component
│   │   └── dialog.jsx     # Modal dialog component
│   ├── Timer.jsx          # Pomodoro timer component
│   ├── Heatmap.jsx        # GitHub-style progress heatmap
│   └── AccountDialog.jsx  # Authentication modal
├── lib/
│   ├── utils.js           # Utility functions
│   └── supabase.js        # Supabase client and helpers
└── supabase-setup.sql     # Database schema and policies
```

### Database Schema

The application uses a single main table:

**`work_sessions`**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `date` (DATE, Unique per user)
- `duration_minutes` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🎨 Design Philosophy

### Arabic Typography Hierarchy

1. **Header**: Aref Ruqaa - Traditional Arabic calligraphy style
2. **Body Text**: IBM Plex Sans Arabic - Modern, readable Arabic font
3. **Timer**: IBM Plex Mono - Monospace for consistent digit alignment

### Color Palette (Supabase-Inspired)

- **Background**: `#0a0a0a` - Deep black for minimal distraction
- **Primary**: `#3ecf8e` - Calming green representing growth
- **Text**: `#ededed` - Soft white for comfortable reading
- **Muted**: `#a3a3a3` - Subtle gray for secondary information

### UI/UX Principles

- **Minimalism**: Remove all distractions to focus on the task
- **Clarity**: Large, clear typography and generous whitespace
- **Accessibility**: High contrast and keyboard navigation support
- **Cultural Sensitivity**: RTL layout and Arabic-first design

## 🤲 Spiritual Significance

### Daily Consistency (الاستمرارية اليومية)

The act of showing up every day, even for a short time, builds discipline (`تهذيب النفس`) and helps develop beneficial habits. In Islam, small consistent actions are preferred over large inconsistent ones.

### Seeking Knowledge (طلب العلم)

Whether you're using this timer for:
- Reading Quran and Islamic texts
- Learning new skills
- Working on beneficial projects
- Personal development

Remember that seeking beneficial knowledge is an act of worship in Islam.

### Accountability (المحاسبة)

The heatmap serves as a visual reminder of your commitment and helps with self-accountability, which is encouraged in Islamic teachings.

### Intention (النية)

Before starting each session, make your intention clear. Are you:
- Seeking Allah's pleasure?
- Benefiting yourself and others?
- Contributing positively to society?

The Prophet ﷺ said: *"Actions are but by intention."*

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
- Progressive Web App (PWA) support coming soon إن شاء الله

## 🔐 Privacy & Security

- **Row Level Security (RLS)**: Users can only access their own data
- **OAuth Integration**: Secure Google authentication
- **Data Isolation**: Complete user data separation
- **HTTPS Only**: All connections encrypted in production
- **Minimal Data Collection**: Only essential information is stored

## 🌟 Contributing

This project is built with love for the sake of Allah. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper Islamic etiquette
4. Test thoroughly
5. Submit a pull request

Please ensure your contributions align with Islamic values and the project's spiritual purpose.

## 🤲 Du'a (Prayer)

Before you start your session, consider this du'a:

**Arabic:**
```
اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا، وَقِنَا عَذَابَ النَّارِ
رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي
```

**Translation:**
```
"O Allah, bless us in what You have provided for us, and protect us from the punishment of the Fire.
My Lord, expand my chest and ease my task for me."
```

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

**Built with ❤️ for the sake of Allah • بُني بحب لله سبحانه وتعالى**

*"And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth."* - Quran 6:73

</div>
