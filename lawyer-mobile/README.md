# NyayaOne — Lawyer Mobile App (Expo Development Build)

## ⚠️ IMPORTANT — Read Before Starting

This app uses **Expo Development Build**, NOT Expo Go. Expo Go won't work because
this project uses native modules (`expo-secure-store`, `expo-notifications`) that
require a custom native build. You'll build a development client APK once, then
develop against it.

## Prerequisites

- Node.js (already installed)
- An Expo account (already have one)
- A physical Android phone with USB debugging enabled (already set up)
- EAS CLI (installed in step 1 below)

## Step 1: Install Dependencies

First, clean out the broken install from before:

```bash
rm -rf node_modules package-lock.json
```

Install the JS-only packages (these versions are fixed and safe):

```bash
npm install
```

Now install Expo + all native modules using `expo install` — this automatically
picks the exact versions compatible with your current Expo SDK (avoids the
version-conflict error you hit earlier):

```bash
npx expo install expo-router expo-secure-store expo-notifications expo-device \
  expo-constants expo-linking expo-splash-screen expo-font expo-status-bar \
  react-native-safe-area-context react-native-screens react-native-gesture-handler \
  react-native-reanimated @react-navigation/native @expo/vector-icons expo-dev-client
```

This step takes a minute — let it finish completely before moving on.

Install EAS CLI globally:
```bash
npm install -g eas-cli
```

## Step 2: Find Your Computer's LAN IP Address

Your phone can't reach `localhost` — it needs your PC's actual network IP.

```bash
hostname -I
```

Copy the first IP shown (looks like `192.168.1.XX`).

## Step 3: Update the API URL

Open `app.json` and change:
```json
"apiBaseUrl": "http://localhost:5000/api/v1"
```
to:
```json
"apiBaseUrl": "http://192.168.1.XX:5000/api/v1"
```
(using the IP from Step 2).

⚠️ Your phone and PC must be on the **same WiFi network**.

⚠️ Your backend's CORS_ORIGIN in `~/nyayaone/backend/.env` may also need this IP added later if you hit CORS issues — but since mobile apps don't send an Origin header the way browsers do, this is usually not needed for native apps (only affects the two web dashboards).

## Step 4: Build the Development Client (one-time, ~10-15 min)

```bash
eas login
eas build:configure
eas build --profile development --platform android
```

This builds in the cloud (free tier). When done, you'll get a link/QR code —
download the APK to your phone and install it (allow "install from unknown
sources" if prompted).

## Step 5: Start the Dev Server

```bash
npx expo start --dev-client
```

Scan the QR code with your phone's camera, or open the NyayaOne Lawyer app you
just installed — it will connect to this dev server automatically (same WiFi).

## Login

```
Email: sita@kla.com.np
Password: LawyerPass123!
```

(This is the lawyer account we created earlier via the backend test script.)

## Folder Structure

```
app/                    → Expo Router screens (file-based routing)
  (auth)/login.tsx       → Login screen
  (tabs)/                → Bottom tab screens (Dashboard, Cases, Hearings, Clients, Profile)
  case/[id].tsx           → Case detail screen (dynamic route)
  _layout.tsx             → Root layout — auth redirect logic lives here

src/
  api/                   → axios calls, grouped by domain
  hooks/                 → React Query hooks
  store/                 → Zustand auth store (persisted to encrypted SecureStore)
  types/                 → Shared TypeScript types
  components/            → Reusable UI (Card, StatusBadge)
  theme/                 → Colors, spacing constants
```

## What's Built (Phase 1 MVP)

- ✅ Login (Lawyer accounts only, SecureStore token persistence)
- ✅ Dashboard — stats, today's + upcoming hearings
- ✅ Cases list + search
- ✅ Case detail (info + hearing history)
- ✅ Hearings — grouped by date (calendar-style list)
- ✅ Clients list + search
- ✅ Profile + Logout

## Next to Build
- Push notifications wiring (expo-notifications is installed — needs a device
  token registration endpoint on the backend + permission request flow)
- Document upload/viewing from the case detail screen
- Create Case / Schedule Hearing forms (currently view-only on mobile —
  lawyers can do this from the web dashboard for now)
- Calendar month/week grid view (currently a grouped list)
- Offline support
