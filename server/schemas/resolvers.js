const { AuthenticationError } = require("apollo-server-express");
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User
          .findById(context.user._id)
          .select("-__v -password")
          .populate("books");

        return userData;
      }
      throw new AuthenticationError("You must be logged in!");
    }
  }, 

  Mutation: {
    // Crear un nuevo usuario
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    // Iniciar sesión de usuario
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Incorrect login credentials!");
      }

      const correctPW = await user.isCorrectPassword(password);
      if (!correctPW) {
        throw new AuthenticationError("Incorrect login credentials!");
      }

      const token = signToken(user);
      return { token, user };
    },
      
    // Guardar un libro en los libros guardados del usuario
    saveBook: async (_, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        ).populate('savedBooks');

        return updatedUser;
      }
      throw new AuthenticationError('You are not authenticated!');
    },

    // Eliminar un libro de los libros guardados del usuario
    removeBook: async (_, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        ).populate('savedBooks');

        if (!updatedUser) {
          throw new Error("Couldn't find user with this id!");
        }
        return updatedUser;
      }
      throw new AuthenticationError('You are not authenticated!');
    }
  }
};

module.exports = resolvers;
