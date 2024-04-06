const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  }),

  // Function for our authenticated routes
  authMiddleware: function ({ req, }, ) {
    // Extract token from the authorization header
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new GraphQLError('You are not authenticated.', null, null, null, ['UNAUTHENTICATED']);
    }
    
    const token = authorization.split(' ')[1];
    
    if (!token) {
      throw new GraphQLError('You are not authenticated.', null, null, null, ['UNAUTHENTICATED']);
    }
    
    try {
      // Verify token and extract user data from it
      const { data } = jwt.verify(token, secret);
      req.user = data;
      next();
    } catch (err) {
      console.error('Invalid token:', err.message);
      throw new GraphQLError('Invalid token.', null, null, null, ['UNAUTHENTICATED']);
    }
  },

  // Function for signing JWT
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
