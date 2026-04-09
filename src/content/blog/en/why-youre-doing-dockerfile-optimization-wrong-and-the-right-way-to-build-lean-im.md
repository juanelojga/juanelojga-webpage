---
title: 'Why You’re Doing Dockerfile Optimization Wrong (And the Right Way to Build Lean Images)'
date: 2026-04-09
tags: ['docker', 'devops', 'containerization', 'optimization']
summary: 'Most Dockerfiles are bloated due to bad practices like unnecessary layers, oversized base images, and unused dependencies. This post walks through common mistakes and advanced techniques to build smaller, faster, and more secure images.'
language: en
slug: why-youre-doing-dockerfile-optimization-wrong-and-the-right-way-to-build-lean-im
category: devops
draft: false
readingTime: 6
---

## Stop Wasting Time With Bloated Docker Images

Let’s be brutally honest: most Dockerfiles I’ve seen in the wild are a mess. Bloated images, unnecessary layers, and bad practices are rampant. And I get it — building Docker images seems straightforward at first, but optimizing them to be lean and maintainable? That’s where the real work begins.

In this post, I’ll walk you through common mistakes that lead to bloated Docker images, why they matter, and actionable strategies for how to build lean, efficient images. Buckle up.

---

## Why Optimizing Docker Images Matters

Before we dive into the technical bits, let's get clear on why Dockerfile optimization needs to be a priority:

1. **Performance**: Smaller images pull faster, especially in CI/CD pipelines. This can shave minutes off your builds and deployments — minutes that compound in large teams or frequent releases.
2. **Security**: Larger images with unnecessary dependencies increase your attack surface. Every package, library, or tool you install is a potential vulnerability.
3. **Scalability**: If you’re shipping huge images to production, you’re wasting bandwidth and storage across your servers and nodes in a distributed system.
4. **Debuggability**: Bloated images are harder to debug. They often include unnecessary cruft that distracts you from finding the real issue.

Put simply: fixing your Dockerfile is a win-win for speed, cost, and sanity.

---

## Common Dockerfile Mistakes That Lead to Bloated Images

Let’s start with the mistakes I see most often in Dockerfiles. If you’re guilty of one or more of these, don’t worry — we’ll fix them together.

### 1. Using the Wrong Base Image

I can't count how many times I’ve seen people default to `ubuntu:latest` or `node:latest` without even thinking about it. These images are huge and often contain far more than you need.

**What’s the fix?**

Use minimal base images tailored to your application. For example:

- For Node.js apps: Use `node:alpine` instead of `node:latest`. Alpine is a lightweight Linux distribution.
- For Python apps: Use `python:slim` instead of the full-fat version.
- For Go apps: Consider using `scratch`, which is an empty base image, or even `distroless`.

### 2. Installing Dependencies the Wrong Way

A classic rookie mistake is installing dependencies without cleaning up afterward. For example:

```dockerfile
RUN apt-get update && apt-get install -y curl
```

This will leave behind a bunch of cached package lists and unnecessary bloat.

**What’s the fix?**

Always clean up after installing dependencies:

```dockerfile
RUN apt-get update && apt-get install -y curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

This removes leftover files from the package manager and keeps your image lean.

### 3. Not Combining Layers

Every `RUN`, `COPY`, or `ADD` command in your Dockerfile creates a new layer in the image. If you scatter these commands across multiple lines unnecessarily, you end up with a bloated image.

Here’s an example of what _not_ to do:

```dockerfile
RUN apt-get update
RUN apt-get install -y curl
```

**What’s the fix?**

Combine related commands into a single layer:

```dockerfile
RUN apt-get update && apt-get install -y curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

Keep in mind that combining layers this way also makes your image more cache-friendly during builds.

### 4. Including Build Tools in the Final Image

A huge mistake I see is leaving tools like `gcc` or `make` in the production image. These are useful for building your app, but they shouldn’t be part of the final image.

**What’s the fix?**

Use multi-stage builds. Here’s an example for a Node.js app:

```dockerfile
# Stage 1: Build
FROM node:alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

In this example, the `build` stage includes all the tools needed for building the app, but the production image is slimmed down to include only the necessary runtime files.

### 5. Forgetting to Use `.dockerignore`

Your Docker build context is everything in the directory where you run `docker build`. If you include unnecessary files (e.g., `.git`, `node_modules` from local development), those files get sent to the Docker daemon. This bloats your image.

**What’s the fix?**

Create a `.dockerignore` file to exclude unnecessary files:

```
.git
node_modules
*.log
dist
.DS_Store
```

This ensures you’re only sending the files actually needed for your build.

---

## Advanced Techniques for Lean Docker Images

Once you’ve fixed the basics, here are some extra techniques to squeeze every last byte out of your Docker images.

### Use Specific Versions Instead of `latest`

Images tagged with `latest` might seem convenient, but they’re a lurking problem. If the base image changes, your build might break unexpectedly.

**What’s the fix?**

Pin your dependencies to specific versions. For example:

```dockerfile
FROM node:16-alpine
```

This ensures your builds are predictable and repeatable.

### Minimize Layers by Merging `COPY` Commands

Every `COPY` or `ADD` command creates a new layer. Instead of copying files piecemeal:

```dockerfile
COPY package.json ./
COPY src/ ./src
COPY config/ ./config
```

**What’s the fix?**

Merge your `COPY` commands when possible:

```dockerfile
COPY . ./
```

This minimizes the number of layers, especially if you’re copying non-sensitive files.

### Use Distroless Images for Production

Distroless images strip away everything but the bare essentials for running your app. There’s no shell, package manager, or other cruft — just your app and its runtime.

Here’s an example for a Go app:

```dockerfile
FROM golang:1.20 AS build
WORKDIR /app
COPY . .
RUN go build -o main .

FROM gcr.io/distroless/static:latest
COPY --from=build /app/main /
CMD ["/main"]
```

Distroless images are smaller, more secure, and harder to break into — a solid choice for production workloads.

### Use Tools to Analyze and Optimize Images

A manual review is good, but tools like [Dive](https://github.com/wagoodman/dive) can help you visualize and analyze your image layers.

To install Dive:

```bash
brew install dive  # macOS
sudo apt-get install dive  # Debian/Ubuntu
```

Run it on your image:

```bash
$ dive my-app:latest
```

It will show you layer sizes, unused files, and opportunities to optimize further.

---

## Final Thoughts: The ROI of Optimized Dockerfiles

Look, I get it — it’s tempting to slap together a quick Dockerfile and call it a day. But a bloated image will cost you time, money, and headaches down the road. By spending a little extra effort upfront to build lean images, you’ll save yourself (and your team) a ton of pain.

Remember: the goal isn’t just to make something that works; it’s to make something that works well. Keep your images small, secure, and maintainable, and Docker will work _for_ you instead of against you.

If you’ve got your own tips and tricks for Dockerfile optimization, drop them in the comments — I’d love to hear what’s worked for you!
