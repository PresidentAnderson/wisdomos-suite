# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
```bash
# Start local development server (Python)
npm start
# or manually:
python3 -m http.server 8000

# Start local development server (Node.js alternative)
npm run serve
# or manually:
npx serve .

# Build command (no build process for static site)
npm run build
```

### Local Development
- Server runs on `http://localhost:8000` by default
- No build process required - static HTML/CSS/JS files
- Changes are reflected immediately on page refresh

## Architecture Overview

### Project Structure
This is a **static educational website** - a wisdom course covering philosophy, critical thinking, ethics, and personal development. It's a simple client-side application with no backend dependencies.

```
wisdom-course/
├── index.html              # Main landing page
├── modules/
│   ├── module1.html        # Foundations of Wisdom
│   ├── module2.html        # Self-Knowledge  
│   ├── module3.html        # Practical Philosophy
│   ├── module4.html        # Critical Thinking
│   ├── module5.html        # Ethical Living
│   └── module6.html        # Wisdom in Relationships
├── journal.html            # Daily wisdom journal
├── quiz.html              # 30-question assessment
├── resources.html         # Additional materials
├── personal-integration.html # Personal integration tools
├── css/styles.css         # Main stylesheet
├── js/
│   ├── main.js            # Core functionality
│   └── modules.js         # Module-specific features
└── vercel.json           # Deployment configuration
```

### Key Technologies
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript
- **Storage**: localStorage for progress tracking and journal entries
- **Deployment**: Vercel static hosting
- **No dependencies**: No frameworks, build tools, or external libraries

### Core Features
- **6 Educational Modules**: Complete course curriculum with interactive content
- **Progress Tracking**: localStorage-based completion tracking across modules
- **Daily Journal**: Mood tracking, gratitude practice, reflections, and wisdom insights
- **Assessment Quiz**: 30 comprehensive questions with category-based scoring
- **Resource Library**: Downloadable worksheets, reading lists, and practice exercises
- **Personal Integration**: Tools for applying wisdom in daily life

### Data Storage Architecture
All data is stored client-side using localStorage:
- `wisdomCourseProgress`: Module completion status and progress percentages
- `wisdomJournalEntries`: Daily journal entries with timestamps
- `quizResults`: Assessment results and scoring history
- No server-side database or API required

### JavaScript Architecture
- **main.js**: Core functionality including progress tracking, navigation, localStorage management
- **modules.js**: Module-specific features like completion tracking, navigation between lessons
- Event-driven architecture with DOM manipulation for dynamic content
- No framework dependencies - pure vanilla JavaScript

## Development Workflow

### Making Changes
1. Edit HTML files directly for content changes
2. Update CSS for styling modifications
3. Modify JavaScript for functionality enhancements
4. Test locally using `npm start` or `npm run serve`
5. Deploy to Vercel automatically via git push

### Content Structure
- Each module follows consistent HTML structure with sections and subsections
- Progress tracking implemented via data attributes and JavaScript
- Responsive design using CSS Grid and Flexbox
- Semantic HTML for accessibility

### Local Storage Schema
```javascript
// Course Progress
{
  modules: {
    1: { completed: boolean, progress: number },
    // ... modules 2-6
  },
  lastAccessed: ISO_DATE_STRING
}

// Journal Entries
{
  [DATE_KEY]: {
    morning: { intention: string, gratitude: string[], mood: number },
    evening: { reflection: string, wisdom: string, mood: number }
  }
}
```

## Deployment
- **Production**: [https://wisdom-course.vercel.app](https://wisdom-course.vercel.app)
- **Auto-deployment**: Push to main branch triggers Vercel deployment
- **Configuration**: vercel.json includes security headers and clean URLs
- **No build step**: Static files served directly