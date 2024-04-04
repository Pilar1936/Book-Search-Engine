const { gql } = require('apollo-server');

// Define los tipos de datos y las operaciones admitidas por el esquema GraphQL
const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    # Otros campos del usuario según tus necesidades
    savedBooks: [Book]
  }

  type Book {
    bookId: ID!
    title: String!
    author: String!
    # Otros campos del libro según tus necesidades
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    # Otras consultas que puedas necesitar, como obtener libros, etc.
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): AuthPayload
    login(usernameOrEmail: String!, password: String!): AuthPayload
    saveBook(bookData: BookInput!): User
    removeBook(bookId: ID!): User
    # Otras mutaciones que puedas necesitar
  }

  input BookInput {
    bookId: ID!
    title: String!
    author: String!
    # Otros campos del libro según tus necesidades
  }
`;

module.exports = typeDefs;
