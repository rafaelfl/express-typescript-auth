# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:16.15.0-alpine

WORKDIR /app
COPY . .

# installing dependencies and building
RUN yarn install
RUN yarn build

# seeding mongoDB data
RUN yarn db:seed

EXPOSE 3000

CMD ["yarn", "start"]
