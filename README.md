# Know-Your-Car-React
“Know Your Car” is a web application that helps users explore and understand different cars in one place. It allows users to browse cars, search by name, and filter by brand to view key details like price, specifications,and features. The platform also includes an admin side where new cars and brands can be added or managed,making the data dynamic.

## Tech Stack
- React 18
- Vite 5
- React Router v6
- Custom `useFetch` hook
- CSS Variables (no UI library)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend URL

# 3. Start development server
npm run dev
```

The dev server starts at `http://localhost:3000`.
Make sure the Express backend is running on `http://localhost:8000`.

## Project Structure

```
├── index.html              ← root HTML (Vite convention)
├── vite.config.js
├── src/
│   ├── main.jsx            ← entry point
│   ├── App.jsx             ← router setup
│   ├── index.css           ← global variables & reset
│   ├── components/
│   │   ├── Navbar.jsx / .css
│   │   └── CarCard.jsx / .css
│   ├── pages/
│   │   ├── Home.jsx / .css
│   │   └── CarDetail.jsx / .css
│   ├── hooks/
│   │   └── useFetch.js
│   └── utils/
│       └── api.js          ← all backend API calls (uses VITE_API_URL)
```



## Available Routes

| Route         | Page                              |
|---------------|-----------------------------------|
| `/`           | Home — car listing + brand filter |
| `/car/:name`  | Car detail page                   |

More pages coming soon.
