const { body, validationResult } = require("express-validator");
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
   res.render("author_form", { title: "Create Author" });
};

// Handle Author create on POST
exports.author_create_post = [
   body("first_name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("First name must be specified.")
      .isAlphanumeric()
      .withMessage("First name has non-alphanumeric characters."),
   body("family_name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Family name must be specified.")
      .isAlphanumeric()
      .withMessage("Family name has non-alphanumeric characters."),
   body("date_of_birth", "Invalid date of birth")
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),
   body("date_of_death", "Invalid date of death")
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),

   (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
         res.render("author_form", {
            title: "Create Author",
            author: req.body,
            errors: errors.array()
         });
      }

      const author = new Author({ ...req.body });
      author.save((err) => {
         if (err) return next(err);
         res.redirect(author.url);
      });
   }
];

// Display Author delete form on GET
exports.author_delete_get = (req, res, next) => {
   async.parallel(
      {
         author: (cb) => Author.findById(req.params.id).exec(cb),
         authors_books: (cb) => Book.find({ author: req.params.id }).exec(cb)
      },
      (err, data) => {
         if (err) return next(err);
         if (data.author == null) {
            res.redirect("/catalog/authors");
         }
         res.render("author_delete", {
            title: "Delete Author",
            author: data.author,
            author_books: data.authors_books
         });
      }
   );
};

// Display Author delete form on POST
exports.author_delete_post = (req, res, next) => {
   async.parallel(
      {
         author: (cb) => {
            Author.findById(req.body.authorid).exec(cb);
         },
         authors_books: (cb) => {
            Book.find({ author: req.body.authorid }).exec(cb);
         }
      },
      (err, data) => {
         if (err) {
            return next(err);
         }
         // Success
         if (data.authors_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render("author_delete", {
               title: "Delete Author",
               author: data.author,
               author_books: data.authors_books
            });
            return;
         } else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(
               req.body.authorid,
               function deleteAuthor(err) {
                  if (err) {
                     return next(err);
                  }
                  // Success - go to author list
                  res.redirect("/catalog/authors");
               }
            );
         }
      }
   );
};

// Display Author update form on GET
exports.author_update_get = (req, res, next) => {
   Author.findById(req.params.id, (err, data) => {
      if (err) return next(err);
      res.render("author_form", { title: "Update Author", author: data });
   });
};

// Display Author update form on POST
exports.author_update_post = [
   body("first_name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("First name must be specified.")
      .isAlphanumeric()
      .withMessage("First name has non-alphanumeric characters."),
   body("family_name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Family name must be specified.")
      .isAlphanumeric()
      .withMessage("Family name has non-alphanumeric characters."),
   body("date_of_birth", "Invalid date of birth")
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),
   body("date_of_death", "Invalid date of death")
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),
   (req, res, next) => {
      const errors = validationResult(req);
      const author = new Author({ ...req.body, _id: req.params.id });
      if (!errors.isEmpty()) {
         // There are errors. Render the form again with sanitized values/error messages.
         res.render("author_form", {
            title: "Update Author",
            author: req.body,
            errors: errors.array()
         });
         return;
      }
      Author.findByIdAndUpdate(req.params.id, author, {}, (err, data) => {
         if (err) return next(err);
         res.redirect(author.url);
      })
   }
];
