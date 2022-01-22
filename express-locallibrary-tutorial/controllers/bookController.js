const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const async = require("async");

exports.index = function (req, res) {
   async.parallel(
      {
         book_count: function (callback) {
            Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
         },
         book_instance_count: function (callback) {
            BookInstance.countDocuments({}, callback);
         },
         book_instance_available_count: function (callback) {
            BookInstance.countDocuments({ status: "Available" }, callback);
         },
         author_count: function (callback) {
            Author.countDocuments({}, callback);
         },
         genre_count: function (callback) {
            Genre.countDocuments({}, callback);
         }
      },
      function (err, results) {
         res.render("index", {
            title: "Local Library Home",
            error: err,
            data: results
         });
      }
   );
};

// Display list of all books
exports.book_list = (req, res, next) => {
   Book.find({}, "title author")
      .sort({ title: 1 })
      .populate("author")
      .exec((err, data) => {
         if (err) return next(err);
         res.render("book_list", { title: "Book List", book_list: data });
      });
};

// Display detail page for a specific book
exports.book_detail = (req, res, next) => {
   async.parallel(
      {
         book: (cb) => {
            Book.findById(req.params.id)
               .populate("author")
               .populate("genre")
               .exec(cb);
         },
         book_instance: (cb) => {
            BookInstance.find({ book: req.params.id }).exec(cb);
         }
      },
      (err, data) => {
         if (err) return next(err);
         if (data.book == null) {
            const error = new Error("Book not found");
            error.status = 404;
            return next(error);
         }
         res.render("book_detail", {
            title: "Book Results",
            book: data.book,
            book_instances: data.book_instance
         });
      }
   );
};

// Display book create form on GET
exports.book_create_get = (req, res, next) => {
   async.parallel(
      {
         authors: (cb) => Author.find(cb),
         genres: (cb) => Genre.find(cb)
      },
      (err, data) => {
         if (err) return next(err);
         res.render("book_form", {
            title: "Create Book",
            authors: data.authors,
            genres: data.genres
         });
      }
   );
};

// Handle book create on POST
exports.book_create_post = [
   (req, res, next) => {
      if (!(req.body.genre instanceof Array)) {
         if (typeof req.body.genre === "undefined") {
            req.body.genre = [];
         } else {
            req.body.genre = new Array(req.body.genre);
         }        
      } 
      next();
   },
   // Validate and sanitise fields.
   body("title", "Title must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body("author", "Author must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body("summary", "Summary must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
   body("genre.*").escape(),
   // Process request after validation and sanitization.
   (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      const book = new Book({ ...req.body });

      if (!errors.isEmpty()) {
         // There are errors. Render form again with sanitized values/error messages.
         // Get all authors and genres for form.
         async.parallel(
            {
               authors: function (callback) {
                  Author.find(callback);
               },
               genres: function (callback) {
                  Genre.find(callback);
               }
            },
            (err, data) => {
               if (err) return next(err);

               // Mark our selected genres as checked.
               for (let i = 0; i < results.genres.length; i++) {
                  if (book.genre.indexOf(results.genres[i]._id) > -1) {
                     results.genres[i].checked = "true";
                  }
               }
               res.render("book_form", {
                  title: "Create Book",
                  authors: data.authors,
                  genres: data.genres,
                  book: book,
                  errors: errors.array()
               });
            }
         );
         return;
      } else {
         book.save((err) => {
            if (err) return next(err);
            res.redirect(book.url);
         });
      }
   }
];

// Display book delete form on GET
exports.book_delete_get = (req, res) => {
   res.send("NOT IMPLEMENTED: Book delete GET");
};

// Handle book delete on POST
exports.book_delete_post = (req, res) => {
   res.send("NOT IMPLEMENTED: Book delete POST");
};

// Display book update form on GET
exports.book_update_get = (req, res) => {
   res.send("NOT IMPLEMENTED: Book update GET");
};

// Handle book update on POST
exports.book_update_post = (req, res) => {
   res.send("NOT IMPLEMENTED: Book update POST");
};
