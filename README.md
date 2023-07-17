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
- [Prerequisites](#%EF%B8%8F-prerequisites)
- [Installation](#-installation)
  - [Local installation](#-local-installation)
  - [Docker installation](#-docker-installation)
  - [Testing the project online](#%EF%B8%8F-testing-the-project-online)
- [How to use](#-how-to-use)
- [Technologies](#-technologies)
- [TODO list](#-todo-list)
- [License](#-license)
- [Author](#-author)

---

## 💻 Project Description

This project showcases an authentication API built with Node.js and Express.js, featuring the following major functionalities:

1. User registration
2. Sign in/Sign out
3. Refresh access tokens
4. Retrieve and update user profiles
5. Admin features (create new accounts, retrieve complete user lists, retrieve and update individual users, delete users)
6. Mock protected routes
7. Retrieve sample data with pagination

- The data endpoints provide fake Airbnb data for consumption by sample applications. The original database was retrieved from MongoDB Atlas (for more information, visit: https://www.mongodb.com/docs/atlas/sample-data/sample-airbnb/).

The project was developed using the following technologies and tools: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [Husky](https://typicode.github.io/husky/#/), [lint-staged](https://github.com/okonet/lint-staged), [eslint](https://eslint.org/), [prettier](https://prettier.io/) and [commitlint](https://commitlint.js.org/#/) with [conventional commits](conventionalcommits.org/).

To store user data, sign-in tokens, and serve dummy data (i.e., the Airbnb sample data), the API utilizes a [MongoDB](https://www.mongodb.com/) server. Additionally, a [Redis](https://redis.io/) server instance is employed to block access to signed-out access tokens, thereby preventing unauthorized access by unexpired access tokens.

You can try out this API by running it in your local environment, within a Docker container, or by accessing it directly from the web. The installation instructions vary depending on the target environment.

### 💾 Database schema design

![MongoDB database schema design](https://raw.githubusercontent.com/rafaelfl/express-typescript-auth/46e92a2740064a029c35c7d0e4255298077332b9/resources/db-diagram.svg?token=AHN7SWKNO3UDVRCQDSARBZLEWTC54)

### 🔑 How Refresh Token Rotation Works

Refresh token rotation is a secure technique used to manage authentication tokens that keep user sessions active. When authenticating with user/password credentials, the API generates two types of tokens: the **refresh token** and the **access token**. These tokens can be opaque strings or use a specific technology like JWT (JSON Web Token).

The **refresh token** should be stored as a browser cookie with the following flags: (a) `Secure` - it can only be transferred over HTTPS connections; and (b) `HttpOnly` - it cannot be accessed using JavaScript code. On the other hand, the **access token** is returned in the API response body and should be stored in the browser memory (preferably avoiding the use of the localStorage due to security concerns). The **access token** should have a short lifespan for increased security, meaning it should expire within a short period.

To access restricted API endpoints, all requests need to include the **access token** in the Authorization Header. The API validates the access token, granting access if it's valid. If the access token has expired, the client needs to refresh both the **access token** and the **refresh token**. If the old tokens are still valid, they should be temporarily stored in MongoDB and Redis to prevent unauthorized access attempts.

If the current **refresh token** is not valid during the token refresh process, it indicates that the user needs to perform a new authentication. The following image illustrates the communication flow between the client and server:

![Refresh token rotation flow](https://raw.githubusercontent.com/rafaelfl/express-typescript-auth/main/resources/session-flow.png?token=GHSAT0AAAAAACDARR7UEA2SUBWLBKKT52PQZFU2PWQ)

(image credits to [Supertokens](https://supertokens.com/blog/the-best-way-to-securely-manage-user-sessions))

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

To run the project locally, you need to make sure you have MongoDB and Redis servers running locally. The necessary URLs and credentials should be configured in the `.env` file. If you don't have the servers running locally, you can utilize the servers available in the Docker environment (follow the instructions available in the Section [Running the project in a Docker container](#-docker-installation)), or you can connect to remote instances of MongoDB and Redis servers (such as, [MongoDB Atlas](https://www.mongodb.com/) and [Redis Cloud](https://redis.com/)).

Before running the API service, the MongoDB database needs to be populated with initial data. To accomplish this, you must install the `MongoDB database tools` on your system (you can follow the installation instructions available in this [link](https://www.mongodb.com/docs/manual/installation/)). After the installation, the `mongorestore` command should be available for use in the current path.

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

**IMPORTANT:** If you are running the API service in your local environment, ensure that your MongoDB and Redis URLs are configured to point to your `localhost` (127.0.0.1) or other appropriate hosts. The default settings in the `.env.example` file specify the hostnames `mongo` ("mongodb://mongo:27017") and `redis` ("redis://redis:6379"), which are accessible only within the Docker runtime environment.

Once you have installed the necessary tools and obtained the source code, the next step is to install the required dependencies, to build and run the project.

```bash
# Install dependencies
$ yarn install

# Build project
$ yarn build

# Run the project
$ yarn start
```

In case you need to run the code in development mode, you can use the following command:

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

To run the project directly in a Docker container, you can build and run the image using the `docker-compose` command.

```bash
# Build and run the current Docker image
$ docker-compose up -d
```

Running the command in the project directory initiates the installation of dependencies, builds the image, and runs the container. Following this process, the service should be operational, utilizing the configuration specified in the `.env` file.

For the API service to have access to MongoDB and Redis instances, the `.env `file used during container construction should use the hostnames `mongo` and `redis` (since they are used to provide access to other containers). If you wish to seed the MongoDB instance running in the Docker container, directly from your system, update your local `.env` file to utilize `localhost` (127.0.0.1) servers before running `yarn db:seed`.

The applications will be available in the following ports:
  - Authentication API - `http://localhost:3000`
  - MongoDB - `mongodb://localhost:27017/authusers`
  - Redis - `redis://localhost:6379`
  - Mongo Express (used to manage MongoDB through a web interface) - `http://localhost:8081/db/authusers/`

**IMPORTANT:** To utilize the Dockerized MongoDB and Redis servers, while running the API service locally, follow these steps:

1. Start the containers containing the MongoDB and Redis servers using the appropriate command for your Docker setup (i.e., `docker-compose up -d`);
2. Stop the API service, executing the following command:

```bash
# Stop the API service container
$ docker stop server
```

By following these instructions, you can have the MongoDB and Redis servers running in Docker and available to be used by the local API service instance.

### 🕸️ Testing the project online

This API was deployed on [Render](https://render.com/) and it is available for testing through the following URL:

[Authentication API](https://express-typescript-auth.onrender.com/)

**IMPORTANT:** When accessing the application for the first time using the previous URL, it may take a while due to its startup time. Free Render instances are automatically shut down after 15 minutes of inactivity.

---

## 🎉 How to use

Once the service is up and running, you have the flexibility to access its endpoints using any REST client of your choice. The API documentation has been prepared using [Swagger](https://swagger.io/), and you can access it through the following link:

[Authentication API Documentation](https://express-typescript-auth.onrender.com/api-docs/)

If you have seeded the database or are utilizing the online API, the following demo users can be used to log in to the API:

> | Email             | Password | Access       |
> | ----------------- | -------- | ------------ |
> | `email@email.com` | `123456` | User Access  |
> | `admin@gmail.com` | `admin`  | Admin Access |

A Postman collection is available and can be accessed through the following button:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/8682347-f12057bc-b938-4e18-92da-0c9208b29bbb?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D8682347-f12057bc-b938-4e18-92da-0c9208b29bbb%26entityType%3Dcollection%26workspaceId%3Da7728e8e-b3f3-45a3-a665-22c06d95ff3e#?env%5Blogin-api%20-%20prod%5D=W3sia2V5IjoiYWNjZXNzVG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0Iiwic2Vzc2lvblZhbHVlIjoiIiwic2Vzc2lvbkluZGV4IjowfSx7ImtleSI6IlNFUlZFUiIsInZhbHVlIjoiaHR0cHM6Ly9leHByZXNzLXR5cGVzY3JpcHQtYXV0aC5vbnJlbmRlci5jb20iLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiZGVmYXVsdCIsInNlc3Npb25WYWx1ZSI6Imh0dHBzOi8vZXhwcmVzcy10eXBlc2NyaXB0LWF1dGgub25yZW5kZXIuY29tIiwic2Vzc2lvbkluZGV4IjoxfV0=)

To access restricted API endpoints, you will need a (short-lived) access token. To obtain your access token, send a request to `/login` along with your `username` and `password` credentials. The API will return both the access token and a refresh token, which can be used by the client to request new short-lived access tokens when needed.

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
