const { nanoid } = require('nanoid');
const books = require('./books');

const sendResponse = (h, status, message, data = null, code = 200) => {
  const responseBody = { status, message };
  if (status === 'success' && data !== null) {
    responseBody.data = data;
  }
  return h.response(responseBody).code(code);
};

const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  if (!name) return sendResponse(h, 'fail', 'Gagal menambahkan buku. Mohon isi nama buku', null, 400);
  if (pageCount < readPage) return sendResponse(h, 'fail', 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount', null, 400);

  const id = nanoid(16);
  const timeStamp = new Date().toISOString();
  const finished = pageCount === readPage;

  const newBook = { id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt: timeStamp, updatedAt: timeStamp };
  books.push(newBook);

  return sendResponse(h, 'success', 'Buku berhasil ditambahkan', { bookId: id }, 201);
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  const filteredBooks = books.filter(book => 
    (!name || book.name.toLowerCase().includes(name.toLowerCase())) &&
    (reading === undefined || book.reading === !!Number(reading)) &&
    (finished === undefined || book.finished === !!Number(finished))
  );

  return sendResponse(h, 'success', 'Books retrieved', { books: filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher })) });
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const book = books.find(b => b.id === id);

  if (book) return sendResponse(h, 'success', 'Buku ditemukan', { book });

  return sendResponse(h, 'fail', 'Buku tidak ditemukan', null, 404);
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
  const updatedAt = new Date().toISOString();
  
  const index = books.findIndex(book => book.id === id);

  if (index === -1) return sendResponse(h, 'fail', 'Gagal memperbarui buku. Id tidak ditemukan', null, 404);
  if (!name) return sendResponse(h, 'fail', 'Gagal memperbarui buku. Mohon isi nama buku', null, 400);
  if (pageCount < readPage) return sendResponse(h, 'fail', 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount', null, 400);

  const finished = pageCount === readPage;
  books[index] = { ...books[index], name, year, author, summary, publisher, pageCount, readPage, finished, reading, updatedAt };

  return sendResponse(h, 'success', 'Buku berhasil diperbarui');
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const index = books.findIndex(book => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    return sendResponse(h, 'success', 'Buku berhasil dihapus');
  }

  return sendResponse(h, 'fail', 'Buku gagal dihapus. Id tidak ditemukan', null, 404);
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};