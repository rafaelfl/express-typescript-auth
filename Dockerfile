# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:16.15.0-alpine

WORKDIR /app
COPY . .

RUN yarn install
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
