FROM oven/bun

WORKDIR /app

COPY . .

RUN bun install --filter '!mongodb-memory-server'

CMD ["bun", "start"]