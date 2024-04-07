const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

// Set token secret and expiration date
const secret = 'mysecretsshhhhh';

module.exports = {
  AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED',
    }, 
  }),

  // Function for our authenticated routes
  authMiddleware: function ({ req, context }, next) { // Agrega el parámetro 'next'
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
      context.user = data; // Set user data in the context object
      return next(); // Return next() to proceed with GraphQL execution
    } catch (err) {
      console.error('Invalid token:', err.message);
      throw new GraphQLError('Invalid token.', null, null, null, ['UNAUTHENTICATED']);
    }
  },
