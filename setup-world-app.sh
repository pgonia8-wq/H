#!/bin/bash
# ==============================
# Script Termux: Actualizar repo + MiniKit + Build + Debug Panel
# ==============================
PROJECT_DIR="$PWD"
cd "$PROJECT_DIR" || { echo "❌ No se encuentra la carpeta del proyecto"; exit 1; }

# 1️⃣ Traer últimos cambios del repo remoto
echo "🔹 Actualizando archivos desde el repositorio remoto..."
git fetch --all
git reset --hard origin/main
git pull

# 2️⃣ Limpiar node_modules y actualizar MiniKit
echo "🔹 Limpiando dependencias y actualizando MiniKit..."
rm -rf node_modules package-lock.json
npm install
npm install @worldcoin/minikit-js@latest

# 3️⃣ Mostrar versión de MiniKit instalada
echo "🔹 Versión de MiniKit instalada:"
node -e "console.log(require('./package.json').dependencies['@worldcoin/minikit-js'])"

# 4️⃣ Inyectar debug panel en App.tsx (solo si no existe)
APP_FILE="./src/App.tsx"
DEBUG_SNIPPET="
{/* DEBUG PANEL */}
<div className='fixed bottom-0 w-full bg-black text-white p-2 text-xs z-50'>
  Status: {status}, Wallet: {walletAddress}, Verificando Orb: {isVerifying?.toString()}, Verificado: {verified?.toString()}, Retry: {retryCount}
</div>
"
if ! grep -q "DEBUG PANEL" "$APP_FILE"; then
    echo "🔹 Inyectando debug panel en App.tsx..."
    sed -i "/<\/div>\s*$/i $DEBUG_SNIPPET" "$APP_FILE"
else
    echo "🔹 Debug panel ya existe en App.tsx, no se inyecta de nuevo."
fi

# 5️⃣ Construir el build para World App
echo "🔹 Construyendo build de Vite..."
npm run build

echo "✅ Script completado. Carpeta 'dist/' lista para subir a World App Mini Apps."
echo "Recuerda abrir la app desde la sección Mini Apps de World App, no por enlace externo."
