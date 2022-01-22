const mongoose = require("mongoose");

const Genre = require("../models/genre");
const Book = require("../models/book");

const async = require("async");

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
exports.genre_create_get = (req, res) => {
   res.send("NOT IMPLEMENTED: Genre create GET");
};

// Handle Genre create on POST
exports.genre_create_post = (req, res) => {
   res.send("NOT IMPLEMENTED: Genre create POST");
};

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
