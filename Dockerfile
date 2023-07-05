# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:16.15.0-alpine

WORKDIR /app
COPY . .

RUN yarn install --ignore-scripts
RUN yarn build

CMD ["yarn", "start"]
EXPOSE 3000

