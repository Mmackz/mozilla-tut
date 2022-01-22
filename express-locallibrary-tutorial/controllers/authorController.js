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

      const { first_name, family_name, date_of_birth, date_of_death } = req.body

      const author = new Author({
         ...req.body
      })

      console.log(author)
   }
];

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
