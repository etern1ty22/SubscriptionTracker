FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/api/package*.json apps/api/
COPY apps/web/package*.json apps/web/
COPY packages/shared/package*.json packages/shared/

RUN npm ci --ignore-scripts --no-audit --no-fund

COPY packages/shared packages/shared
COPY apps/web apps/web

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace", "@subscription-tracker/web"]
