// ejemplo3_2.js
const util = require('util');
const express = require('express');
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const pkg_def = loader.loadSync(__dirname + '/' + 'grpc-book.proto');
const book = grpc.loadPackageDefinition(pkg_def).book;
const app = express()
app.use(express.json())
const port = process.env.PORT || 1337
const target = process.env.TARGET || 'localhost:4000';
const client = new book.BookService(
  target,
  grpc.credentials.createInsecure()
);

const getBook = util.promisify(client.getBook.bind(client));
const createBook = util.promisify(client.createBook.bind(client));
const updateBook = util.promisify(client.updateBook.bind(client));
const deleteBook = util.promisify(client.deleteBook.bind(client));

app.get('/', (req, res) => {
  Promise.resolve(getBook({ id: 1 })).then(book => {
    res.json(book)
  }).catch(reason => {
    console.log(reason)
    res.status(500).json({ error: reason.details || reason.message })
  });
})

app.post('/books', (req, res) => {
  Promise.resolve(createBook(req.body)).then(book => {
    res.status(201).json(book)
  }).catch(reason => {
    res.status(400).json({ error: reason.details || reason.message })
  });
})

app.put('/books/:id', (req, res) => {
  const payload = { ...req.body, id: parseInt(req.params.id) };
  Promise.resolve(updateBook(payload)).then(book => {
    res.json(book)
  }).catch(reason => {
    res.status(404).json({ error: reason.details || reason.message })
  });
})

app.delete('/books/:id', (req, res) => {
  Promise.resolve(deleteBook({ id: parseInt(req.params.id) })).then(result => {
    res.json(result)
  }).catch(reason => {
    res.status(404).json({ error: reason.details || reason.message })
  });
})

app.listen(port, () => console.log(`Server listening on port ${port}`))