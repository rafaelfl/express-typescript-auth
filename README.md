# Authentication Node.js API

![Licença](https://img.shields.io/badge/license-MIT-brightgreen)
[![Coverage Status](https://coveralls.io/repos/github/rafaelfl/express-typescript-auth/badge.svg?branch=main)](https://coveralls.io/github/rafaelfl/express-typescript-auth?branch=main)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## About

<p align="center">Project that provides an Authentication API that implements a refresh token rotation scheme (based on JWT tokens) and token reuse detection using Node.js, Express and Typescript</p>

## Table of Contents

=================

- [About](#about)
- [Table of Contents](#table-of-contents)
- [Project Description](#-project-description)
  - [Database schema design](#-database-schema-design)
  - [How the refresh token rotation works?](#-how-the-refresh-token-rotation-works)
- [Prerequisites](#prerequisites)
- [Installation](#-installation)
  - [Local installation](#-local-installation)
  - [Docker installation](#-docker-installation)
  - [Testing project online](#-testing-project-online)
- [How to use](#-how-to-use)
- [Technologies](#-technologies)
- [TODO list](#-todo-list)
- [License](#-license)
- [Author](#-author)

---

## 💻 Project Description

The project was developed to provide an authentication API built with Node.js and Express.js, showcasing the following major functionalities:

1. User registration
2. Sign in/Sign out
3. Refresh access token
4. Get and update user profile
5. Admin features (create new account, get complete user list, get user, update user, delete user)
6. Mock protected routes
7. Get sample data with pagination

- The data endpoints return some fake Airbnb data to be consumed by sample applications (original database retrieved from MongoDB Atlas - more info: https://www.mongodb.com/docs/atlas/sample-data/sample-airbnb/)

It was developed with [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/), using [Husky](https://typicode.github.io/husky/#/), [lint-staged](https://github.com/okonet/lint-staged), [eslint](https://eslint.org/), [prettier](https://prettier.io/) and [commitlint](https://commitlint.js.org/#/) with [conventional commits](conventionalcommits.org/).

The API uses a MongoDB server to store the users, their sign in tokens and also to serve dummy data (i.e., Airbnb sample data). A Redis server instance is used to block the access to signed out access tokens (avoiding that a not expired access token can be used to perform an unauthorized access).

You can try this API running it in your local environment, in a Docker container or you can access it directly from the web. The installation instructions vay according to the target environment.

### 💾 Database schema design

![MongoDB database schema design](https://raw.githubusercontent.com/rafaelfl/express-typescript-auth/46e92a2740064a029c35c7d0e4255298077332b9/resources/db-diagram.svg?token=AHN7SWKNO3UDVRCQDSARBZLEWTC54)

### 🔑 How the refresh token rotation works?

The refresh token rotation is a technique used to securely manage the authentication tokens responsible for keeping the user session active. When performing the authentication with user/password credentials, the API returns two different types of tokens: the **refresh token** and the **access token**. Those tokens can be opaque (i.e., a randomly generated string) or they can use an specific generation technology, such as JWT (JSON Web Token).

The **refresh token** should stored as a browser cookie with the flags `Secure` (i.e., it can only be transferred through HTTPS connections) and `HttpOnly` (i.e., it can't be accessed using Javascript code). On the other hand, the **access token** is returned in the response body and should be kept (preferably) in the browser memory (storing the **access token** in the localStorage is not secure!). The **access token** should be short lived (i.e., it should expire in a small amount of time - for security purposes).

All restricted API requests should send (in the Authorization Header) the **access token**, which is validated by the API. In the case a valid **access token** is sent, the endpoint access is granted. On the other hand, in case the token has expired, the client should refresh both **access** and **refresh tokens**. The old tokens (if they are still valid) should be temporarily stored in MongoDB and Redis to avoid new unauthorized accesses.

Finally, if the current **refresh token** was denied (during the tokens refreshing), that means that the user should perform a new authentication. The following image depicts the communication flow between the client and server:

![Refresh token rotation flow](https://raw.githubusercontent.com/rafaelfl/express-typescript-auth/main/resources/session-flow.png?token=GHSAT0AAAAAACDARR7UEA2SUBWLBKKT52PQZFU2PWQ)

(image credits to [Supertokens](https://supertokens.com/blog/the-best-way-to-securely-manage-user-sessions))

<a name="prerequisites"></a>

## ⚙️ Prerequisites

Before starting, you need [Node.js](https://nodejs.org/en/), [Yarn](https://yarnpkg.com/) and [Git](https://git-scm.com/). [Docker](https://docs.docker.com/get-docker/) also needs to be installed and configured, since this application depends on [MongoDB](https://www.mongodb.com/docs/manual/installation/) and [Redis](https://redis.io/download/) servers.

```bash
# Clone this repository
$ git clone https://github.com/rafaelfl/express-typescript-auth

# Enter in the project folder in terminal/cmd
$ cd express-typescript-auth
```

## 🚀 Installation

After installing the tools and the source code, you need to configure the project using a `.env` file. Using that file one can customize the API secrets and configuration. An example file `.env.example` is provided and can be copied and updated. The content and configuration variables available in the `.env` file are:

```
DATABASE_URL="<MONGODB DATABASE URL>"
DATABASE_USER="<MONGODB ACCESS USERNAME>"
DATABASE_PASSWORD="<MONGODB ACCESS PASSWORD>"

PORT=<PORT NUMBER (3000 IS THE DEFAULT)>
SALT=<PASSWORD HASH GENERATION SALT NUMBER (10 IS THE DEFAULT)>

REFRESH_TOKEN_PRIVATE_KEY="<SECRET KEY USED TO ENCRYPT THE JWT REFRESH TOKEN>"
ACCESS_TOKEN_PRIVATE_KEY="<SECRET KEY USED TO ENCRYPT THE JWT ACCESS TOKEN>"

REFRESH_TOKEN_EXPIRATION="<EXPIRATION TIME FOR THE REFRESH TOKEN>"
ACCESS_TOKEN_EXPIRATION="<EXPIRATION TIME FOR THE ACCESS TOKEN>"

COOKIE_DOMAIN="<DOMAIN TO BE USED WHEN CREATING THE REFRESH TOKEN COOKIE>"

REDIS_URL="<REDIS DATABASE URL>"
```

The `REFRESH_TOKEN_EXPIRATION` and `ACCESS_TOKEN_EXPIRATION` can be expressed as a time formatted string with a value and a time unit, such as: "5h", "40m", "320". They accept "h" for hours, "m" for minutes and any other value is considered as seconds (**important:** the "s" for seconds is **NOT** supported - any other numerical value is considered as seconds by default).

After configuring the `.env` file, you can start installing the dependencies, building and running the project.

### 🏡 Local installation

In order to run the project locally, you need to run the MongoDB and Redis servers, according to the urls and credentials provided in the `.env` file. In case you don't have the servers running locally, you can use the servers available in the Docker environment (follow the instructions available in the Section [Running the project in a Docker container](#-docker-installation)) or connecting to remote instances (e.g., [MongoDB Atlas](https://www.mongodb.com/) or [Redis Cloud](https://redis.com/)).

Before running the API service, we need to populate the MongoDB database with some initial data. To do this, you need to install the `MongoDB database tools` in your system (you can follow the instructions available in this [link](https://www.mongodb.com/docs/manual/installation/)). After the installation, the `mongorestore` command should be available:

```bash
# Verifying the mongorestore version
$ mongorestore --version

mongorestore version: 100.7.3
git version: ad89a1c6dbe283012012cf0e5f4cb7fb1fcdf75d
Go version: go1.19.9
   os: darwin
   arch: arm64
   compiler: gc
```

With `mongorestore` available in the current path, you can execute the following command to seed the database:

```bash
# Seeding the database with initial data
$ yarn db:seed
```

**IMPORTANT:** in the case you are running the API service in your local environment, your MongoDB and Redis URLs should point to your `localhost` (127.0.0.1) or other hosts. By default, the `.env.example` file points to `mongo` ("mongodb://mongo:27017") and `redis` ("redis://redis:6379") hostnames, which are only accessible from the Docker runtime environment.

After installing the tools and the source code, you can install the dependencies, build and run the project.

```bash
# Install dependencies
$ yarn install

# Build project
$ yarn build

# Run the project
$ yarn start
```

In case you need to run the code in development mode you can use the following command:

```bash
# Run the API in development mode
$ yarn dev
```

In the development mode, any change in the API source code is automatically reloaded and applied.

If you are using the `PORT=3000` environment variable (the default), the application will be available on `http://localhost:3000`.

Some other interesting commands:

- `yarn clean` - clean the build files
- `yarn dev` - run the service in watch mode (with `nodemon`)
- `yarn build` - build the page for deploying
- `yarn start-ts` - run the application directly transpiling from the Typescript files (with `ts-node`)
- `yarn lint` - run the linter to identify some problems in code
- `yarn lint-fix` - run the linter to identify and fix problems in code
- `yarn prettier` - run the prettier formatter
- `yarn test` - run the integration tests
- `yarn test-coverage` - run the tests coverage

### 🐟 Docker installation

To run the code directly on a Docker container, you can build and run the current image using the `docker-compose` command.

```bash
# Build and run the current Docker image
$ docker-compose up -d
```

Running this command in the project directory begins the installation of all dependencies, builds the image and runs the container. After this process, the service should run using the configuration specified in the `.env` file.

To allow the API service to have access to MongoDB and Redis instances, the `.env` file used when building the containers need to use the `mongo` and `redis` hostnames. In case you need to seed the docker instances from your system, you need to update your local `.env` file to use `localhost` (127.0.0.1) servers.

The applications will be available in the following ports:
  - Authentication API - `http://localhost:3000`
  - MongoDB - `mongodb://localhost:27017/authusers`
  - Redis - `redis://localhost:6379`
  - Mongo Express (to manage MongoDB through a web interface) - `http://localhost:8081/db/authusers/`

**IMPORTANT:** If you want to use the MongoDB and Redis servers from the Docker container, but you want to run the API service locally, you can start the containers and stop only the API service using the following command:

```bash
# Stop the API service container
$ docker stop server
```

### 🕸️ Testing project online

This API was deployed on [Render](https://render.com/) and it is available for testing through the following URL:

[Sample Authentication API](https://express-typescript-auth.onrender.com/)

**IMPORTANT:** Accessing the application using the previous URL can take a while on the first time (due its startup time). Free instances are automatically spun down after 15 minutes of inactivity.

---

## 🎉 How to use

After having the service running, you can access its endpoints using any REST client. The API was documented using [Swagger](https://swagger.io/), and it can be accessed in the following link:

[Authentication API Documentation](https://express-typescript-auth.onrender.com/api-docs/)

The following demo users can be used to login in the API (if you have seed the database or you are using the online API):

> | Email             | Password | Access       |
> | ----------------- | -------- | ------------ |
> | `email@email.com` | `123456` | User Access  |
> | `admin@gmail.com` | `admin`  | Admin Access |

A Postman collection is available online and can be accessed through the following button:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/8682347-f12057bc-b938-4e18-92da-0c9208b29bbb?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D8682347-f12057bc-b938-4e18-92da-0c9208b29bbb%26entityType%3Dcollection%26workspaceId%3Da7728e8e-b3f3-45a3-a665-22c06d95ff3e#?env%5Blogin-api%20-%20prod%5D=W3sia2V5IjoiYWNjZXNzVG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0Iiwic2Vzc2lvblZhbHVlIjoiIiwic2Vzc2lvbkluZGV4IjowfSx7ImtleSI6IlNFUlZFUiIsInZhbHVlIjoiaHR0cHM6Ly9leHByZXNzLXR5cGVzY3JpcHQtYXV0aC5vbnJlbmRlci5jb20iLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiZGVmYXVsdCIsInNlc3Npb25WYWx1ZSI6Imh0dHBzOi8vZXhwcmVzcy10eXBlc2NyaXB0LWF1dGgub25yZW5kZXIuY29tIiwic2Vzc2lvbkluZGV4IjoxfV0=)

Access to restricted API endpoints requires a (short lived) access token. To obtain your access token, make a request along with any `username` and `password` credentials to `/login`. The refresh token is also returned to allow the client to request new short lived access tokens.

**Sample Response:**

```http
POST http://localhost:3000/login
HTTP/1.1
Accept: application/json

{
    "email": "email@email.com",
    "password": "123456"
}

HTTP/1.1 200 OK
Content-Type: application/json

Headers:
Set-Cookie refreshToken=...; Max-Age=86400; Domain=localhost; Path=/; Expires=Tue, 18 Jul 2023 02:16:54 GMT; HttpOnly; Secure; SameSite=None

{
    "success": true,
    "data": {
        "token": "..."
    }
}
```

---

## 🛠 Technologies

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Express Validator](https://express-validator.github.io/)
- [TypeScript](https://www.typescriptlang.org)
- [Yarn](https://yarnpkg.com)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [Mongoose](https://mongoosejs.com)
- [Passport](http://www.passportjs.org)
- [Morgan](https://github.com/expressjs/morgan)
- [Winston](https://github.com/winstonjs/winston)
- [Swagger](https://swagger.io/)
- [Jest](https://jestjs.io/)
- [Supertest](https://github.com/ladjs/supertest)
- [Mockingoose](https://github.com/alonronin/mockingoose)
- [Husky](https://typicode.github.io/husky/#/)
- [eslint](https://eslint.org/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [prettier](https://prettier.io/)
- [commitlint](https://commitlint.js.org/#/)

---

## 🛠 TODO list

- [ ] Forgot password
- [ ] Change password

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

## 👨‍💻 Author

<a href="https://github.com/rafaelfl/">
 <img style="border-radius: 50%;" src="https://avatars.githubusercontent.com/u/31193433?v=4" width="100px;" alt=""/>
 <br />
 <sub><b>Rafael Fernandes Lopes</b></sub></a>

Developed with 💜 by Rafael Fernandes Lopes

[![Linkedin Badge](https://img.shields.io/badge/-Rafael%20Fernandes%20Lopes-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/rafael-fernandes-lopes/)](https://www.linkedin.com/in/rafael-fernandes-lopes/)
