const async = require("async");
const Author = require("../models/author");
const Book = require("../models/book");

// Display list of all Authors
exports.author_list = (req, res) => {
   Author.find()
      .sort([["family_name", "asc"]])
      .exec((err, data) => {
         if (err) return next(err);
         res.render("author_list", { title: "Author List", author_list: data });
      });
};

// Display detail page for a specific Author
exports.author_detail = (req, res, next) => {
   async.parallel(
      {
         author: (cb) => {
            Author.findById(req.params.id).exec(cb);
         },
         authors_books: (cb) => {
            Book.find({ author: req.params.id }, "title summary").exec(cb);
         }
      },
      (err, data) => {
         if (err) return next(err);
         if (data.author == null) {
            const error = new Error("Author not found");
            error.status = 404;
            return next(err);
         }
         res.render("author_details", {
            title: "Author Details",
            author: data.author,
            author_books: data.authors_books
         });
      }
   );
};

// Display Author create form on GET
exports.author_create_get = (req, res) => {
   res.send("NOT IMPLEMENTED: Author create GET");
};

// Handle Author create on POST
exports.author_create_post = (req, res) => {
   res.send("NOT IMPLEMENTED: Author create POST");
};

// Display Author delete form on GET
exports.author_delete_get = (req, res) => {
   res.send("NOT IMPLEMENTED: Author delete GET");
};

// Display Author delete form on POST
exports.author_delete_post = (req, res) => {
   res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET
exports.author_update_get = (req, res) => {
   res.send("NOT IMPLEMENTED: Author update GET");
};

// Display Author update form on POST
exports.author_update_post = (req, res) => {
   res.send("NOT IMPLEMENTED: Author update POST");
};
