const { body, validationResult } = require("express-validator");
const async = require("async");
const mongoose = require("mongoose");
const Genre = require("../models/genre");
const Book = require("../models/book");

// Display list of all Genre
exports.genre_list = (req, res) => {
   Genre.find()
      .sort([["name", "asc"]])
      .exec((err, data) => {
         if (err) return next(err);
         res.render("genre_list", { title: "Genre List", genre_list: data });
      });
};

// Display detail page for a specific Genre
exports.genre_detail = (req, res, next) => {
   const id = mongoose.Types.ObjectId(req.params.id);
   async.parallel(
      {
         genre: (cb) => {
            Genre.findById(id).exec(cb);
         },
         genre_books: (cb) => {
            Book.find({ genre: id }).exec(cb);
         }
      },
      (err, data) => {
         if (err) return next(err);
         if (data.genre == null) {
            const error = new Error("Genre not found");
            error.status = 404;
            return next(error);
         }
         res.render("genre_detail", {
            title: "Genre Detail",
            genre: data.genre,
            genre_books: data.genre_books
         });
      }
   );
};

// Display Genre create form on GET
exports.genre_create_get = (req, res, next) => {
   res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST
exports.genre_create_post = [
   // Validate and sanitize the name field.
   body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),
   (req, res, next) => {
      const errors = validationResult(req);
      const genre = new Genre({
         name: req.body.name
      });

      if (!errors.isEmpty()) {
         // There are errors. Render the form again with sanitized values/error messages.
         res.render("genre_form", {
            title: "Create Genre",
            genre: genre,
            errors: errors.array()
         });
         return;
      }

      Genre.findOne({ name: req.body.name }, (err, data) => {
         if (err) return next(err);
         if (data) {
            res.redirect(data.url);
         } else {
            genre.save((err) => {
               if (err) return next(err);
               res.redirect(genre.url);
            });
         }
      });
   }
];

// Display Genre delete form on GET
exports.genre_delete_get = (req, res, next) => {
   async.parallel(
      {
         genre: (cb) => Genre.findById(req.params.id).exec(cb),
         authors_books: (cb) => Book.find({ genre: req.params.id }).exec(cb)
      },
      (err, data) => {
         if (err) return next(err);
         if (data.genre == null) {
            res.redirect("/catalog/genres");
         }
         res.render("genre_delete", {
            title: "Delete Genre",
            genre: data.genre,
            author_books: data.authors_books
         });
      }
   );
};

// Handle Genre delete on POST
exports.genre_delete_post = (req, res, next) => {
   async.parallel(
      {
         genre: (cb) => Genre.findById(req.body.genre_id).exec(cb),
         authors_books: (cb) => Book.find({ genre: req.body.genre_id }).exec(cb)
      },
      (err, data) => {
         if (err) return next(err);
         if (data.authors_books.length > 0) {
            res.render("genre_delete", {
               title: "Delete Genre",
               genre: data.genre,
               author_books: data.authors_books
            });
            return;
         } else {
            Genre.findByIdAndRemove(
               req.body.genre_id,
               function deleteGenre(err) {
                  if (err) return next(err);
                  res.redirect("/catalog/genres");
               }
            );
         }
      }
   );
};

// Display Genre update form on GET
exports.genre_update_get = (req, res, next) => {
   Genre.findById(req.params.id, (err, data) => {
      if (err) return next(err);
      res.render("genre_form", { title: "Update Genre", genre: data });
   });
};

// Handle Genre update on POST
exports.genre_update_post = [
   // Validate and sanitize the genre name field.
   body("name", "Genre name required")
      .trim()
      .isLength({ min: 1 })
      .custom((name) => {
         return new Promise((resolve, reject) => {
            Genre.findOne({ name }, (err, data) => {
               if (err) {
                  reject(err);
               }
               data == null
                  ? resolve()
                  : reject("Genre already exists in library");
            });
         });
      })
      .escape(),
   (req, res, next) => {
      const errors = validationResult(req);
      const genre = new Genre({
         name: req.body.name,
         _id: req.params.id
      });

      if (!errors.isEmpty()) {
         // There are errors. Render the form again with sanitized values/error messages.
         res.render("genre_form", {
            title: "Update Genre",
            genre: genre,
            errors: errors.array()
         });
         return;
      }
      Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, data) => {
         if (err) return next(err);
         res.redirect(genre.url);
      });
   }
];
