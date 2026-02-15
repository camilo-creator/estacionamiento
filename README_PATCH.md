# Patch Firebase (Estacionamiento KW)

## 1) Pegar config
Edita `firebaseConfig.ts` y pega tu config de Firebase Web App.

Firebase Console → ⚙️ Project settings → Your apps → Web → Config.

## 2) Copiar archivos al repo
Copia estos archivos a la RAÍZ donde hoy tienes tus .tsx (según tu repo):
- firebaseConfig.ts
- firebase.ts
- utils.ts
- useAuth.ts
- useProfile.ts
- useVehicles.ts
- useCheckins.ts
- useBlocks.ts
- LoginForm.tsx
- Dashboard.tsx
- App.tsx
- index.ts (solo si tu proyecto usa index.ts como entry; si ya existe y difiere, adapta el import de App)

## 3) Colecciones Firestore esperadas
- users/{uid}  (con plates[])
- vehicles/{PATENTE}
- checkins/{uid_YYYY-MM-DD}
- bloqueos/{uid_PATENTE_YYYY-MM-DD}

## 4) Reglas mínimas (solo para test)
En Firestore Rules:
allow read, write: if request.auth != null;
Luego endurecemos.
