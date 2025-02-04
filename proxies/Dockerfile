FROM ubuntu:20.04 

# Install Node.js 18
RUN apt update && apt install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Install dependencies
RUN apt install -y xvfb fluxbox xdotool ffmpeg

RUN apt update && apt install -y software-properties-common && \
    add-apt-repository ppa:saiarcot895/chromium-beta && \
    apt update && apt install -y chromium-browser

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9090

CMD ["node", "ws-server.js"]
