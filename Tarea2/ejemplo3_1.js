// ejemplo3_1.js
const fs = require('fs')
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const pkg_def = loader.loadSync(__dirname + '/' + 'grpc-book.proto');
const book = grpc.loadPackageDefinition(pkg_def).book;
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4000;
const server = new grpc.Server();

let books = []

const loadBooks = () => {
  fs.readFile(__dirname + '/' + 'books.json', 'utf8', (err, data) => {
    books = JSON.parse(data)
  });
}
loadBooks()

const saveBooks = () => {
  fs.writeFile(__dirname + '/' + 'books.json', JSON.stringify(books, null, 2), (err) => {
    if (err) console.error('Error guardando books.json:', err);
  });
}

server.addService(book.BookService.service, {

  getBook: (call, cb) => {
    let book = books.find(book => book.id == call.request.id);
    if (book == undefined)
      return cb(new Error(`unknown book ${call.request.id}`));
    else
      cb(null, book);
  },

  createBook: (call, cb) => {
    const req = call.request;
    const nextId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
    const newBook = { id: nextId, ...req, id: nextId };
    books.push(newBook);
    saveBooks();
    cb(null, newBook);
  },

  updateBook: (call, cb) => {
    const req = call.request;
    const index = books.findIndex(b => b.id == req.id);
    if (index === -1)
      return cb(new Error(`unknown book ${req.id}`));
    books[index] = { ...books[index], ...req };
    saveBooks();
    cb(null, books[index]);
  },

  deleteBook: (call, cb) => {
    const index = books.findIndex(b => b.id == call.request.id);
    if (index === -1)
      return cb({ code: grpc.status.NOT_FOUND, message: `unknown book ${call.request.id}` });
    books.splice(index, 1);
    saveBooks();
    cb(null, { id: call.request.id, deleted: true, message: `book ${call.request.id} deleted successfully` });
  }

});

server.bindAsync(`${HOST}:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) throw err;
    server.start();
    console.log(`Producer running at http://${HOST}:${port}/`);
});