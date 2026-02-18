#!/bin/bash

echo "=== Script para solucionar problemas en el servidor ==="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar versión de Node
echo -e "${YELLOW}1. Verificando versión de Node.js...${NC}"
NODE_VERSION=$(node --version)
echo "Versión actual: $NODE_VERSION"

MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$MAJOR_VERSION" -lt 18 ]; then
    echo -e "${RED}⚠️  Node.js $NODE_VERSION es muy antiguo. Vite requiere Node.js 18+${NC}"
    echo "Por favor actualiza Node.js con:"
    echo "  nvm install 18"
    echo "  nvm use 18"
else
    echo -e "${GREEN}✅ Versión de Node.js es compatible${NC}"
fi
echo ""

# 2. Resolver conflicto de .env
echo -e "${YELLOW}2. Resolviendo conflicto de .env...${NC}"
if [ -f .env ]; then
    echo "Haciendo backup de .env local..."
    cp .env .env.local.backup
    echo -e "${GREEN}✅ Backup creado: .env.local.backup${NC}"
    
    echo "Descartando cambios de .env en Git..."
    git checkout .env 2>/dev/null || echo "No hay cambios que descartar"
fi
echo ""

# 3. Pull de los cambios
echo -e "${YELLOW}3. Obteniendo últimos cambios...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Pull exitoso${NC}"
else
    echo -e "${RED}❌ Error en pull${NC}"
    exit 1
fi
echo ""

# 4. Restaurar .env local
echo -e "${YELLOW}4. Restaurando .env local...${NC}"
if [ -f .env.local.backup ]; then
    cp .env.local.backup .env
    echo -e "${GREEN}✅ .env restaurado${NC}"
    echo "Archivo de backup guardado en: .env.local.backup"
fi
echo ""

# 5. Instalar dependencias
echo -e "${YELLOW}5. Instalando/actualizando dependencias...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi
echo ""

# 6. Build de producción
echo -e "${YELLOW}6. Construyendo aplicación...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
else
    echo -e "${RED}❌ Error en build${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}=== ✅ Proceso completado ===${NC}"
echo ""
echo "Siguientes pasos:"
echo "1. Verifica que tu .env tiene las variables correctas"
echo "2. Reinicia el servidor web si es necesario"
echo "3. Verifica que la aplicación funcione correctamente"
