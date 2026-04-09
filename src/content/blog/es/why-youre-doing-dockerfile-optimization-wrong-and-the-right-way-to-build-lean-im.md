---
title: 'Por qué estás optimizando mal tu Dockerfile (y cómo crear imágenes ligeras de la forma correcta)'
date: 2026-04-09
tags: ['docker', 'devops', 'contenedores', 'optimización']
summary: 'La mayoría de los Dockerfiles están inflados debido a malas prácticas como capas innecesarias, imágenes base demasiado grandes y dependencias sin usar. Este artículo detalla errores comunes y técnicas avanzadas para crear imágenes más pequeñas, rápidas y seguras.'
language: es
slug: why-youre-doing-dockerfile-optimization-wrong-and-the-right-way-to-build-lean-im
category: devops
draft: false
readingTime: 6
---

## Deja de perder tiempo con imágenes Docker innecesariamente grandes

Seamos brutalmente honestos: la mayoría de los Dockerfiles que he visto por ahí son un desastre. Imágenes infladas, capas innecesarias y malas prácticas están a la orden del día. Y lo entiendo: construir imágenes Docker parece sencillo al principio, pero optimizarlas para que sean ligeras y mantenibles es donde empieza el verdadero desafío.

En este artículo, te guiaré por los errores más comunes que llevan a imágenes Docker infladas, por qué importan y estrategias prácticas para construir imágenes ligeras y eficientes. Ponte cómodo, que esto se pone interesante.

---

## Por qué es importante optimizar tus imágenes Docker

Antes de entrar en los detalles técnicos, aclaremos por qué la optimización del Dockerfile debería ser una prioridad para ti:

1. **Rendimiento**: Las imágenes más pequeñas se descargan más rápido, especialmente en pipelines de CI/CD. Esto puede ahorrarte minutos en construcciones y despliegues frecuentes — minutos que se acumulan si trabajas en un equipo grande o haces releases constantes.
2. **Seguridad**: Las imágenes grandes con dependencias innecesarias aumentan tu superficie de ataque. Cada paquete, librería o herramienta que instales es una posible vulnerabilidad.
3. **Escalabilidad**: Si estás enviando imágenes enormes a producción, estás desperdiciando ancho de banda y almacenamiento en tus servidores y nodos en un sistema distribuido.
4. **Facilidad de depuración**: Las imágenes infladas son más difíciles de depurar. Suelen incluir basura innecesaria que complica encontrar el problema real.

En resumen: arreglar tu Dockerfile es un ganar-ganar para la velocidad, los costos y tu tranquilidad.

---

## Errores comunes al crear Dockerfiles que generan imágenes infladas

Empecemos con los errores más frecuentes que suelo encontrar en los Dockerfiles. Si cometes uno o más de ellos, no te preocupes: aquí te explico cómo solucionarlos.

### 1. Usar la imagen base incorrecta

He perdido la cuenta de cuántas veces he visto a gente usar `ubuntu:latest` o `node:latest` sin pensarlo dos veces. Estas imágenes son enormes y, en muchos casos, contienen mucho más de lo que realmente necesitas.

**¿La solución?**

Usa imágenes base minimalistas adaptadas a tu aplicación. Por ejemplo:

- Para aplicaciones en Node.js: usa `node:alpine` en lugar de `node:latest`. Alpine es una distribución Linux ligera.
- Para aplicaciones en Python: utiliza `python:slim` en lugar de la versión completa.
- Para aplicaciones en Go: considera usar `scratch`, que es una imagen base vacía, o incluso `distroless`.

### 2. Instalar dependencias de forma incorrecta

Un error clásico de principiante es instalar dependencias sin limpiar después. Por ejemplo:

```dockerfile
RUN apt-get update && apt-get install -y curl
```

Esto deja cachés de paquetes y otros archivos innecesarios en tu imagen.

**¿La solución?**

Siempre limpia después de instalar dependencias:

```dockerfile
RUN apt-get update && apt-get install -y curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

Esto elimina archivos residuales del gestor de paquetes y mantiene tu imagen limpia.

### 3. No combinar capas

Cada comando `RUN`, `COPY` o `ADD` en tu Dockerfile crea una nueva capa en la imagen. Si dispersas estos comandos en múltiples líneas sin necesidad, terminas con una imagen inflada.

Por ejemplo, esto es lo que _no deberías hacer_:

```dockerfile
RUN apt-get update
RUN apt-get install -y curl
```

**¿La solución?**

Combina comandos relacionados en una sola capa:

```dockerfile
RUN apt-get update && apt-get install -y curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

Además, combinar capas hace que tu imagen sea más eficiente al aprovechar mejor el caché durante las construcciones.

### 4. Incluir herramientas de compilación en la imagen final

Un error grave que veo con frecuencia es dejar herramientas como `gcc` o `make` en la imagen de producción. Estas son útiles para construir tu aplicación, pero no deberían estar en la imagen final.

**¿La solución?**

Usa construcciones multi-etapa. Aquí tienes un ejemplo para una aplicación en Node.js:

```dockerfile
# Etapa 1: Construcción
FROM node:alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

En este caso, la etapa de `build` incluye todas las herramientas necesarias para construir la aplicación, pero la imagen de producción se reduce para incluir solo los archivos esenciales en tiempo de ejecución.

### 5. Olvidar usar `.dockerignore`

El contexto de construcción de Docker incluye todo lo que hay en el directorio donde ejecutas `docker build`. Si incluyes archivos innecesarios (por ejemplo, `.git`, `node_modules` de desarrollo local), estos se enviarán al demonio de Docker, lo que infla tu imagen.

**¿La solución?**

Crea un archivo `.dockerignore` para excluir archivos innecesarios:

```
.git
node_modules
*.log
dist
.DS_Store
```

Esto garantiza que solo se envíen los archivos realmente necesarios para tu construcción.

---

## Técnicas avanzadas para imágenes Docker ligeras

Una vez que hayas corregido lo básico, aquí tienes algunas técnicas adicionales para optimizar aún más tus imágenes Docker.

### Usa versiones específicas en lugar de `latest`

Las imágenes etiquetadas como `latest` pueden parecer convenientes, pero son una bomba de tiempo. Si la imagen base cambia, tu construcción podría fallar inesperadamente.

**¿La solución?**

Fija tus dependencias a versiones específicas. Por ejemplo:

```dockerfile
FROM node:16-alpine
```

Esto asegura que tus construcciones sean predecibles y repetibles.

### Minimiza capas combinando comandos `COPY`

Cada comando `COPY` o `ADD` crea una nueva capa. En lugar de copiar archivos uno por uno:

```dockerfile
COPY package.json ./
COPY src/ ./src
COPY config/ ./config
```

**¿La solución?**

Fusiona tus comandos `COPY` siempre que sea posible:

```dockerfile
COPY . ./
```

Esto minimiza el número de capas, especialmente si estás copiando archivos no confidenciales.

### Usa imágenes Distroless para producción

Las imágenes Distroless eliminan todo excepto lo esencial para ejecutar tu aplicación. No hay shell, gestor de paquetes ni otros archivos innecesarios; solo tu aplicación y su entorno de ejecución.

Aquí tienes un ejemplo para una aplicación en Go:

```dockerfile
FROM golang:1.20 AS build
WORKDIR /app
COPY . .
RUN go build -o main .

FROM gcr.io/distroless/static:latest
COPY --from=build /app/main /
CMD ["/main"]
```

Las imágenes Distroless son más pequeñas, seguras y difíciles de comprometer, lo que las convierte en una excelente opción para entornos de producción.

### Usa herramientas para analizar y optimizar imágenes

Revisar manualmente tu Dockerfile es útil, pero herramientas como [Dive](https://github.com/wagoodman/dive) pueden ayudarte a visualizar y analizar las capas de tu imagen.

Para instalar Dive:

```bash
brew install dive  # macOS
sudo apt-get install dive  # Debian/Ubuntu
```

Ejecuta Dive en tu imagen:

```bash
$ dive my-app:latest
```

Te mostrará el tamaño de las capas, archivos no utilizados y oportunidades para optimizar aún más.

---

## Reflexión final: El retorno de inversión de optimizar Dockerfiles

Entiendo: es tentador armar un Dockerfile rápido y darlo por terminado. Pero una imagen inflada te costará tiempo, dinero y dolores de cabeza en el futuro. Con un pequeño esfuerzo adicional al principio para construir imágenes ligeras, te ahorrarás (a ti y a tu equipo) mucho sufrimiento.

Recuerda: el objetivo no es solo hacer algo que funcione; es hacerlo bien. Mantén tus imágenes pequeñas, seguras y fáciles de mantener, y Docker trabajará _a tu favor_ en lugar de en tu contra.

Si tienes tus propios consejos para optimizar Dockerfiles, ¡compártelos en los comentarios! Me encantaría saber qué te ha funcionado.
