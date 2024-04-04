const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // Obtener un usuario por su ID o nombre de usuario
    async me(_, args, context) {
      if (context.user) {
        const foundUser = await User.findOne({ _id: context.user._id }).populate('savedBooks');
        return foundUser;
      }
      throw new Error('You are not authenticated!');
    },
  },
  Mutation: {
    // Crear un nuevo usuario
    async addUser(_, { username, email, password }) {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    // Iniciar sesión de usuario
    async login(_, { usernameOrEmail, password }) {
      const user = await User.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });

      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new Error('Wrong password!');
      }

      const token = signToken(user);
      return { token, user };
    },
    // Guardar un libro en los libros guardados del usuario
    async saveBook(_, { bookData }, context) {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        ).populate('savedBooks');

        return updatedUser;
      }
      throw new Error('You are not authenticated!');
    },
    // Eliminar un libro de los libros guardados del usuario
    async removeBook(_, { bookId }, context) {
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
      throw new Error('You are not authenticated!');
    },
  },
};

module.exports = resolvers;
