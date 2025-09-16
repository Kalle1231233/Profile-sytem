# Expo Standortkarte

Eine Expo-App (TypeScript) mit React Native Maps, die beim Start nach der Standortfreigabe fragt, die aktuelle Nutzerposition auf einer interaktiven Karte anzeigt und klare Hinweise für alle Berechtigungs- und GPS-Fehlerfälle liefert.

## Hauptfunktionen

- Einmaliger Foreground-Permission-Request beim ersten Start.
- Vollbildkarte mit `react-native-maps`, Nutzerposition & sanfter Zentrierung.
- Floating-Action-Button „Meine Position zentrieren“.
- Ausgereiftes Fehlerhandling für verweigerte/gesperrte Berechtigungen, deaktivierte Standortdienste und Timeouts.
- Barrierearme Hinweise und Handlungsoptionen (erneut anfragen, zu den Systemeinstellungen wechseln).

## Voraussetzungen

- [Node.js](https://nodejs.org/) **>= 18** (empfohlen: aktuelle LTS-Version)
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) (`npm install -g expo-cli`) oder Verwendung von `npx expo`
- Ein aktives Expo-Konto für EAS-Builds (optional)

## Installation

1. Repository klonen und Abhängigkeiten installieren:

   ```bash
   git clone <repo-url>
   cd Profile-sytem
   npm install
   ```

2. Optional: Eine `.env`-Datei anlegen, um Secrets wie den Google-Maps-API-Key zentral zu pflegen. Expo liest die Variablen zur Build-Zeit ein.

   ```bash
   echo "GOOGLE_MAPS_API_KEY=dein-key" >> .env
   ```

3. Stelle sicher, dass die benötigten Plattform-Tools vorhanden sind (Xcode-Simulator, Android Studio & Emulator, Expo Go App auf realen Geräten).

## Plattformkonfiguration

### iOS

- Die InfoPlist-Message für die Foreground-Location wird in `app.config.js` gesetzt (`NSLocationWhenInUseUsageDescription`).
- Passe den Text bei Bedarf an eure Kommunikationsrichtlinien an.

### Android

- Angeforderte Berechtigungen: `ACCESS_FINE_LOCATION` (Foreground). Optional kann `ACCESS_COARSE_LOCATION` ergänzt werden, wenn geringere Genauigkeit genügt.
- Der Google-Maps-API-Key wird über `app.config.js` aus `process.env.GOOGLE_MAPS_API_KEY` gelesen. Lege den Wert für Builds/CI als Secret an (z. B. in EAS Secrets, GitHub Actions oder lokal in `.env`).
- Ohne gesetzten Key zeigt Google Maps auf Android keine Tiles an.

### Google Maps API-Key setzen

- **Lokal**: `.env` mit `GOOGLE_MAPS_API_KEY=...` anlegen und `expo start` via `npx expo start --clear` neu starten.
- **CI / EAS**: Den Key als Secret konfigurieren und bei Builds per Environment-Variable bereitstellen (`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` ist nicht nötig; die Config liest direkt `GOOGLE_MAPS_API_KEY`).
- Der Key darf nicht im Repository liegen – nutze ausschließlich Environment-Variablen oder Secret Stores.

## Entwicklung starten

```bash
npm start
```

Der Befehl startet Metro. Von dort aus:

- **Android**: `a` drücken oder `npm run android`, um den Emulator zu öffnen. Stelle im Emulator sicher, dass „Google Play Services“ installiert sind.
- **iOS**: `i` drücken oder `npm run ios`, um den iOS-Simulator zu starten (benötigt Xcode).
- **Web**: `npm run web` öffnet eine Browser-Vorschau (limitiert bei Maps/Geolocation, primär für Layoutchecks gedacht).

## Standort im Emulator simulieren

### Android Studio

1. Emulator starten.
2. In den **Extended Controls** → **Location** wechseln.
3. Einen Ort (Lat/Lng) auswählen oder eine GPX/KML-Datei laden.
4. „Send“ drücken – Expo Go erhält nun den simulierten Standort.

### Xcode Simulator

1. Simulator öffnen und App ausführen.
2. Menü **Features** → **Location** → Ort auswählen (z. B. „Freeway Drive“ oder „Custom Location…“).
3. Für individuelle Koordinaten „Custom Location…“ wählen und Längen-/Breitengrade eingeben.

## npm-Skripte

| Befehl              | Zweck                                                   |
| ------------------- | -------------------------------------------------------- |
| `npm start`         | Metro Bundler mit QR-Code starten                        |
| `npm run android`   | Projekt im Android-Emulator/auf einem angeschlossenen Gerät starten |
| `npm run ios`       | Projekt im iOS-Simulator/auf einem angeschlossenen Gerät starten |
| `npm run web`       | Web-Vorschau (keine produktive Plattform)                |
| `npm test`          | Jest-Tests (Hooks-Smoketests) ausführen                  |
| `npm run lint`      | ESLint prüfen (TypeScript-Regeln über `eslint-config-expo`) |
| `npm run typecheck` | TypeScript-Typprüfung ohne Build                         |

## Fehlerbehebung & Tipps

- **Graue Karte / keine Tiles**: Prüfe den Google-Maps-API-Key, Internetverbindung oder Google Play Services (Android-Emulator). Auf iOS kann das Problem auftreten, wenn der Key nicht freigeschaltet ist.
- **Position bleibt bei (0,0)**: Im Emulator ist kein Standort gesetzt. Folge der Anleitung oben, um einen simulierten Standort zu senden.
- **Berechtigung dauerhaft „denied“**: In den Systemeinstellungen (iOS: Einstellungen → App, Android: Einstellungen → Apps → App → Berechtigungen) die Standortfreigabe zurücksetzen bzw. erneut erlauben.
- **GPS deaktiviert**: Die App zeigt einen deutlichen Hinweis an. Aktiviere die Standortdienste (Android: Schnellzugriffe oder Einstellungen → Standort, iOS: Einstellungen → Datenschutz & Sicherheit → Ortungsdienste).
- **Timeout bei Standortsuche**: Stelle sicher, dass das Gerät einen freien Himmel bzw. eine valide Positionsquelle hat. Ein Tippen auf „Erneut versuchen“ startet eine neue Anfrage.

## Tests

- Minimale Hook-Smoketests (`useLocationPermission`, `useCurrentPosition`) mit Jest & Testing Library (`npm test`).
- TypeScript & ESLint prüfen (`npm run typecheck`, `npm run lint`). Alle Checks müssen ohne Fehler durchlaufen.

## EAS Build (optional)

1. Bei Expo anmelden: `npx expo login`.
2. Projekt konfigurieren: `npx expo prebuild` ist **nicht** nötig; das Projekt nutzt Managed Workflow.
3. Secrets setzen (z. B. `eas secret:create --name GOOGLE_MAPS_API_KEY --value <key>`).
4. Builds starten:
   - Android: `npx eas build -p android`
   - iOS: `npx eas build -p ios`
5. Für OTA-Updates: `npx eas update --branch production` (den API-Key vorher ebenfalls als Secret verfügbar machen).

Weitere Hinweise: [Expo Location-Dokumentation](https://docs.expo.dev/versions/latest/sdk/location/) und [react-native-maps Setup](https://github.com/react-native-maps/react-native-maps#installation-and-configuration).

