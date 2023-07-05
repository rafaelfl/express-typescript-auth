# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:16.15.0-alpine

WORKDIR /app
COPY . .

RUN yarn install --ignore-scripts

CMD ["yarn", "execute"]
EXPOSE 3000

