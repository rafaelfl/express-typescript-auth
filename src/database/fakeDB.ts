import { v4 as uuidv4 } from "uuid";

import { User, UserToken } from "../types";
import { IDatabase } from "./IDatabase";

// A simple in-memory object to simulate a database
// TODO: replace by a relational or NoSQL database
const fakeDB = {
  users: [
    {
      id: "0c466602-0b35-4b80-bde2-e814d0493f39",
      email: "rafael.fernandes@gmail.com",
      name: "Rafael Fernandes Lopes",
      password: "$2b$10$OGLSteDbwlgmQl.qPoKykuepfLPixmfRs4u46JNglwPbB2WozkuGK",
      role: "user",
    },
    {
      id: "2dfdccae-f9e7-498b-b7d0-44fb30b38b67",
      email: "admin@gmail.com",
      name: "Admin",
      password: "$2b$10$xyzmgmbuZ5jQK0v8pKI6duqhFN64.RqsuJqRfmxJ/yJrpKiLrkEBO",
      role: "admin",
    },
  ] as Array<User>,
  tokens: [] as Array<UserToken>,
};

const database: IDatabase = {
  findOne: (model, { id, email, token }) => {
    if (model === "user") {
      if (id) {
        const userById = fakeDB.users.find(u => u.id === id);

        if (userById) {
          return Promise.resolve(userById);
        }
      }

      if (email) {
        const userByEmail = fakeDB.users.find(u => u.email === email);

        if (userByEmail) {
          return Promise.resolve(userByEmail);
        }
      }

      return Promise.resolve(null);
    }

    if (model === "token") {
      if (id) {
        const tokenObjByToken = fakeDB.tokens.find(u => u.userId === id);

        if (tokenObjByToken) {
          return Promise.resolve(tokenObjByToken);
        }
      }

      if (token) {
        const tokenObjByToken = fakeDB.tokens.find(u => u.token === token);

        if (tokenObjByToken) {
          return Promise.resolve(tokenObjByToken);
        }
      }

      return Promise.resolve(null);
    }

    throw Promise.reject(new Error("Informed model does not exist"));
  },

  create: (model, { name, email, password, role, id, token }) => {
    if (model === "user" && name && email && password && role) {
      const user = { id: uuidv4(), name, email, password, role } as User;

      fakeDB.users.push(user);

      return Promise.resolve(user);
    }

    if (model === "token" && id && token) {
      const userToken = { userId: id, token, createdAt: new Date() } as UserToken;

      fakeDB.tokens.push(userToken);

      return Promise.resolve(userToken);
    }

    return Promise.resolve(null);
  },

  remove: (model, { id, email, token }) => {
    if (model === "user") {
      if (id) {
        const pos = fakeDB.users.findIndex(u => u.id === id);

        if (pos >= 0) {
          const user = fakeDB.users[pos];
          fakeDB.users.splice(pos, 1);

          return Promise.resolve(user);
        }
      }

      if (email) {
        const pos = fakeDB.users.findIndex(u => u.email === email);

        if (pos >= 0) {
          const user = fakeDB.users[pos];
          fakeDB.users.splice(pos, 1);

          return Promise.resolve(user);
        }
      }

      return Promise.resolve(null);
    }

    if (model === "token") {
      if (id) {
        const pos = fakeDB.tokens.findIndex(u => u.userId === id);

        if (pos >= 0) {
          const userToken = fakeDB.tokens[pos];
          fakeDB.tokens.splice(pos, 1);

          return Promise.resolve(userToken);
        }
      }

      if (token) {
        const pos = fakeDB.tokens.findIndex(u => u.token === token);

        if (pos >= 0) {
          const userToken = fakeDB.tokens[pos];
          fakeDB.tokens.splice(pos, 1);

          return Promise.resolve(userToken);
        }
      }

      return Promise.resolve(null);
    }

    throw Promise.reject(new Error("Informed model does not exist"));
  },

  debug: model => {
    if (model === "user") {
      console.log(fakeDB.users);
      return;
    }

    if (model === "token") {
      console.log(fakeDB.tokens);
      return;
    }

    console.log(fakeDB);
  },
};

export default database;
