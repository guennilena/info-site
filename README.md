# info-site

[![Deploy](https://github.com/guennilena/info-site/actions/workflows/docker-compose.yml/badge.svg)](https://github.com/guennilena/info-site/actions/workflows/docker-compose.yml)

**Version:** 0.2.0

A lightweight personal information platform running on a Linux VPS with automated deployment.

## Features (v0.2.0)
- Linux VPS (Ubuntu)
- Docker & Docker Compose
- Reverse proxy with Caddy (HTTPS)
- Static website
- PrismJS syntax highlighting
- Dark / Light theme toggle
- CI/CD with GitHub Actions
- SSH-based deployment
- first version /apps

## Deployment
Every push to the `main` branch automatically triggers:
1. GitHub Actions workflow
2. SSH connection to the VPS
3. `git pull`
4. `docker compose up -d`

## Project Structure
```text
site/
  index.html
  assets/
    prism.css
    prism.js
    site.css
    site.js
docker-compose.yml
caddy/

## Purpose

This project serves as a personal information platform for:
- CV / resume
- Project overviews
- Technical documentation

The focus is on being clear, reproducible, and not overengineered.