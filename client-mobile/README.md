# NyayaOne — Client Mobile App (Expo Development Build)

Mobile app for **clients** to track their own cases, hearings, and documents.
Read-only — clients cannot edit legal information (matches roadmap requirement).

## ⚠️ Same setup pattern as Lawyer App — Expo Dev Client, not Expo Go

## Step 1: Install Dependencies

```bash
npm install
npx expo install expo-router expo-secure-store expo-notifications expo-device \
  expo-constants expo-linking expo-splash-screen expo-font expo-status-bar \
  react-native-safe-area-context react-native-screens react-native-gesture-handler \
  react-native-reanimated @react-navigation/native @expo/vector-icons expo-dev-client \
  expo-file-system expo-sharing
```

Note the two extra packages vs the Lawyer app: `expo-file-system` and
`expo-sharing` — used for downloading/opening documents on the client's device.

## Step 2: Find Your PC's LAN IP

```bash
hostname -I
```

## Step 3: Update `app.json`

Change `"apiBaseUrl": "http://localhost:5000/api/v1"` to your PC's IP, e.g.
`"http://192.168.1.102:5000/api/v1"`.

## Step 4: Build Dev Client

```bash
eas login
eas build:configure
eas build --profile development --platform android
```

Install the resulting APK on the phone.

## Step 5: Run

```bash
npx expo start --dev-client
```

## Getting a Client Login

Clients don't self-register. A law firm grants access from the **Law Firm Web
Dashboard** → Clients → "App Access" button (requires the client to have an
email on file). This creates their login credentials.

Example (already set up if you tested this earlier):
```
Email: <client's email>
Password: <password set when granting access>
```

## What's Built

- ✅ Login (Client accounts only)
- ✅ Dashboard — case count, upcoming hearings
- ✅ My Cases (read-only list + detail)
- ✅ Case detail — info, lawyer contact (call/email), hearing history
- ✅ Hearings — full timeline, grouped by date
- ✅ Documents — list + native download/share (uses device's share sheet to
  open/save the file, since documents are served from an authenticated,
  tenant-scoped endpoint — not a public URL)
- ✅ Profile + Change Password

## Not Included (by design, per roadmap: "Clients cannot edit legal information")

- No case/hearing creation or editing
- No client list (a client only ever sees their own data — enforced on the
  backend via their linked Client record, not just hidden in the UI)

## Next Steps (Phase 3 per roadmap)
- Push notifications (new hearing / document alerts)
- Payment history (needs a Payments/Billing backend module — not yet built)
