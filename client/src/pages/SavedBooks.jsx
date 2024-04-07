import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Container,
  Card,
  Button,
  Row,
  Col
} from 'react-bootstrap';

import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage'; 

const SavedBooks = () => {
  // Use useQuery hook to execute the GET_ME query
  const { loading, data } = useQuery(GET_ME,{
    fetchPolicy: 'network-only',
  });

  // Use useMutation hook to execute the REMOVE_BOOK mutation
  const [removeBook] = useMutation(REMOVE_BOOK);

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  const userData = data?.me || {};

  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // Execute the REMOVE_BOOK mutation
      await removeBook({
        variables: { bookId: bookId }
      });

      // Remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div fluid className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks && userData.savedBooks.length > 0 ? (
            `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
          ) : (
            'You have no saved books!'
          )}
        </h2>
        <Row>
          {userData.savedBooks && userData.savedBooks.length > 0 ? (
            userData.savedBooks.map((book) => {
              return (
                <Col md="4" key={book.bookId}>
                  <Card border='dark'>
                    {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />}
                    <Card.Body>
                      <Card.Title>{book.title}</Card.Title>
                      <p className='small'>Authors: {book.authors}</p>
                      <Card.Text>{book.description}</Card.Text>
                      <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                        Delete this Book!
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          ) : (
            <p>No saved books found</p>
          )}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
