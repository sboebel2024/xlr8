FROM ubuntu:22.04

# Install Node.js (since we removed the default Node.js image)
RUN apt update && apt install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Install Ubuntu 22.04 versions of Chromium and other dependencies
RUN apt update && apt install -y \
    xvfb \
    fluxbox \
    xdotool \
    ffmpeg

RUN snap install chromium

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9090

CMD ["node", "ws-server.js"]