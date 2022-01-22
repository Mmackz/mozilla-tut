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
exports.genre_delete_get = (req, res) => {
   res.send("NOT IMPLEMENTED: Genre delete GET");
};

// Handle Genre delete on POST
exports.genre_delete_post = (req, res) => {
   res.send("NOT IMPLEMENTED: Genre delete POST");
};

// Display Genre update form on GET
exports.genre_update_get = (req, res) => {
   res.send("NOT IMPLEMENTED: Genre update GET");
};

// Handle Genre update on POST
exports.genre_update_post = (req, res) => {
   res.send("NOT IMPLEMENTED: Genre update POST");
};
