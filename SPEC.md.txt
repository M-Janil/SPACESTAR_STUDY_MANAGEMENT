# Pikko: Build Spec

You are building a hackathon project in 12 hours using only FREE tools. My AI usage quota is limited, so work efficiently: write each phase in one go, avoid rewriting files that already work, don't refactor or "improve" things I didn't ask for, and don't run long test loops. Build in PHASES. After each phase, give a 3-line summary and how to test it, then STOP and wait for me to say "next". Start with Phase 0 only.

## PROJECT
Pikko is a mobile-first web app (PWA), "Instagram for places". People post live photos under a place's page so everyone sees what a place is like RIGHT NOW. App name: Pikko.

## TECH STACK (all free)
- Next.js (App Router) + Tailwind CSS
- Supabase (free): Auth, Postgres, Storage, RLS
- Leaflet + OpenStreetMap for all maps (NO Google Maps). Use Nominatim only for the optional place search, with a small delay between requests.
- Browser Geolocation API for GPS
- exifr to read EXIF dates from gallery photos
- HTML canvas to stamp text onto photos
- Gemini API (Flash model only, free tier) for the optional AI guide, called from a server route. Key in .env.
- Deploy on Vercel (camera and GPS need HTTPS)

## FREE-TIER LIMITS TO RESPECT
- Supabase file storage is only 1 GB: before uploading, resize every photo client-side to max 1280px wide and compress to JPEG quality ~0.7.
- Supabase free emails are rate-limited: use Supabase's built-in email for the password reset code (no extra email service).
- Never call the Gemini API on every page load: cache results in the database.

## DESIGN SYSTEM
Very minimal, calm, pleasing. Lots of white space, rounded corners (16-24px), soft shadows, large photos, one clean sans-serif font (Inter), subtle animation only.
Palette (only these plus lighter/darker tints):
#111844 deep navy | #4B5694 indigo | #7288AE soft blue | #EAE0CF cream
LIGHT MODE: background cream, cards slightly lighter cream, text #111844, primary buttons #4B5694 with cream text, accents #7288AE.
DARK MODE: background #111844, cards a slightly lighter navy tint, text #EAE0CF, primary buttons #7288AE with navy text, accents #4B5694.
Use CSS variables. Light/dark toggle (sun/moon) on the welcome page and in Profile; remember it in localStorage and default to the system preference. Add skeleton loaders and friendly empty states.

## NAVIGATION
After login, a fixed bottom tab bar: Home | Explore | [+] (larger, circular, raised, centre) | Saved | Profile.
Tapping [+] opens a bottom sheet: "New Post" and "New Destination".

## DATA MODEL
- profiles: id (= auth user id), username (UNIQUE, stored lowercase), name, email, dob, interests (text[]), avatar_url, bio, created_at
- places: id, name, bio, category, vibes (text[]), city, state, country, continent, lat, lng, cover_image_url, images (text[]), guide_text, guide_updated_at, status ('pending'|'verified', default 'verified'), created_by, created_at
- posts: id, place_id, user_id, image_url, caption, vibe, extra_info (jsonb), source ('live'|'gallery'), captured_at, lat, lng, created_at
- likes: id, user_id, place_id (nullable), post_id (nullable), UNIQUE per user+target
- saved_places: user_id, place_id, created_at
- login_attempts: username (PK), failed_count, locked_until
- follows: follower_id, following_id
- place_confirmations: id, place_id, user_id, UNIQUE(place_id, user_id)
Write one SQL file with the schema, indexes (username, lat/lng, created_at), RLS (users edit only their own rows; everyone reads verified places and posts), and three storage buckets: post-images, place-images, avatars.

## PHASES

### PHASE 0: Setup
Tailwind theme and palette with light/dark variables, theme toggle, Supabase client, SQL schema, bottom tab bar shell with empty pages.

### PHASE 1: Auth
- The first page is the welcome/login page. On load, check for an existing Supabase session; if logged in, go straight to Home. The session persists and never expires on its own. Logout happens ONLY from Profile, with a confirmation popup ("Are you sure you want to log out?" Cancel / Log out).
- Welcome page: Pikko logo/name, tagline "See what a place is like, right now.", buttons "Log in" and "Create new account", theme toggle.
- Create account, 2 steps with a progress indicator. Step 1: name, interests (multi-select chips), date of birth, email. Step 2: username and password (with confirm and show/hide). Username must be UNIQUE: live availability check (debounced), re-check on submit, and a database unique constraint. Allowed: lowercase letters, numbers, underscore, period, 3-20 chars. Show "Username already taken" if it exists. Password min 8 chars.
- Log in with username + password. Look up the email by username in a server route (never expose emails to the client), then sign in with Supabase. Track wrong attempts in login_attempts: show "X attempts left" after each failure; after 5 wrong attempts, lock login for that username and show only "Reset password". Reset the counter on success.

### PHASE 2: Seed data + Home page
- Seed script: 10 verified sample places (varied cities, vibes, real coordinates, cover images from the seed-images folder if it exists, otherwise placeholder images) and 20 sample posts with varied timestamps, so the app is never empty.
- Home: header "✨ Discover your local areas ✨" with a rounded search bar (search places by name as you type). Ask for GPS with a friendly explanation first; if denied, let the user type a city. Section "Nearby discoveries": horizontal cards sorted by distance (haversine) with vibe filter chips above it (All, Peaceful, Adventurous, Romantic, Foodie, Artsy, Lively, Nature, Cultural, Family). Below: "Places near you", a vertical list of cards with cover photo, name, distance, vibe tags, and "last updated X min ago".

### PHASE 3: Place page (like an Instagram profile)
- Header: cover photo, name, verified badge, location text, vibe chips, like count, Save button (toggles saved_places), short bio.
- Tabs: Community (grid of posts, newest first, relative times like "12 min ago", tap a post to open it with caption, vibe and like button), Map (Leaflet map with a pin, plus an "Open in Google Maps" link using a maps URL with lat/lng), Guide (placeholder text "Guide coming soon" for now).

### PHASE 4: New Post
- Pick a place (search or nearby). Then:
  A) "Take photo": explain, then request camera permission, open the live camera (rear by default), capture, and use canvas to burn the CURRENT date and time into the BOTTOM-LEFT corner (readable, soft shadow, e.g. "10 Oct 2026, 4:32 PM"). Record GPS at capture. source='live'.
  B) "Upload from gallery": read DateTimeOriginal with exifr and burn it into the BOTTOM-RIGHT corner; if missing, stamp "Time unknown". source='gallery', captured_at = EXIF date.
- Then ask: vibe (single select), one or two quick details (crowd level: Quiet/Moderate/Crowded; weather or entry fee), and a short statement about the place. Resize/compress, upload, save the post. Live posts get a "Live" badge and rank above gallery posts of similar age.

### PHASE 5: Explore, Saved, Profile
- Explore: tabs "Places" and "Community"; scope chips City | State | Country | Continent | International (based on the user's detected location and the places' city/state/country/continent fields); sort Latest | Most liked; like buttons.
- Saved: grid of saved places with unsave and an empty state.
- Profile: avatar, name, @username, bio, counts for Posts / Followers / Following, grid of the user's posts, Edit profile (name, bio, interests, avatar, dob, email; username cannot change), settings menu with theme toggle, Change password, and Logout (with the confirmation popup). Add a simple follow/unfollow button on other users' profiles.

### PHASE 6: Forgot password
- Ask for username and email. If the email does not match the username, show: "This email does not match the username." If it matches, send a 6-digit code using Supabase's built-in email OTP, show a code input in the app, verify it, let the user set a new password, reset failed_count, and log in. Also use this flow when login is locked after 5 failed attempts.

## OPTIONAL PHASES (only if I ask)

### PHASE 7: New Destination
- Form: place name, short bio, category, vibes, best time to visit, entry fee, how to reach, at least 5 pictures (enforce the minimum, preview, remove), and location chosen by dragging a pin on a Leaflet map (fill city/state/country/continent with a Nominatim reverse lookup).
- Saved as status='pending' and hidden from public lists. A "Help verify" card on Home shows pending destinations near the user with photos and a map and two buttons: "Yes, this place exists" and "Not sure". A user can't confirm their own. When 3 different users confirm, set status='verified'. Show the creator "2 of 3 confirmations".

### PHASE 8: AI Guide tab
- Server route calls the Gemini Flash model with the place data and its 10 latest posts to write a short guide (best time to visit, how to reach, what to see, tips, nearby food, etiquette). Cache in places.guide_text and refresh only if older than 24 hours. Handle rate-limit errors (429) gracefully with a "Guide unavailable right now" message.

## RULES
- Phase 0 first. Wait for "next" after every phase.
- Never expose service keys, emails or API keys on the client. Use env variables and server routes.
- Mobile-first: design for 390px width.
- Keep the file structure simple and reusable components small.
- If something fails, fix it before moving on.