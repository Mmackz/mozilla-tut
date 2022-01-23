const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const BookInstance = require("../models/bookinstance");

// Display list of all BookInstances
exports.bookinstance_list = (req, res, next) => {
   BookInstance.find()
      .populate("book")
      .exec((err, data) => {
         if (err) console.error(err);
         res.render("bookinstance_list", {
            title: "Book Instance List",
            bookinstance_list: data
         });
      });
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = (req, res, next) => {
   BookInstance.findById(req.params.id)
      .populate("book")
      .exec((err, data) => {
         if (err) return next(err);
         if (data == null) {
            const error = new Error("Book copy not found");
            error.status = 404;
            return next(error);
         }
         res.render("book_instance_detail", {
            title: "Book Instance Detail",
            bookinstance: data
         });
      });
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = (req, res, next) => {
   Book.find({}, "title").exec((err, data) => {
      if (err) return next(err);
      res.render("bookinstance_form", {
         title: "Create BookInstance",
         book_list: data
      });
   });
};

// Handle BookInstance create on POST
exports.bookinstance_create_post = [
   // Validate and sanitise fields.
   body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
   body("imprint", "Imprint must be specified")
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body("status").escape(),
   body("due_back", "Invalid date")
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),
   // Process request after validation and sanitization.
   (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a BookInstance object with escaped and trimmed data.
      const bookinstance = new BookInstance({
         book: req.body.book,
         imprint: req.body.imprint,
         status: req.body.status,
         due_back: req.body.due_back
      });

      if (!errors.isEmpty()) {
         // There are errors. Render form again with sanitized values and error messages.
         Book.find({}, "title").exec((err, data) => {
            if (err) return next(err);
            // Successful, so render.
            res.render("bookinstance_form", {
               title: "Create BookInstance",
               book_list: data,
               selected_book: bookinstance.book._id,
               errors: errors.array(),
               bookinstance: bookinstance
            });
         });
         return;
      } else {
         // Data from form is valid.
         bookinstance.save(function (err) {
            if (err) {
               return next(err);
            }
            // Successful - redirect to new record.
            res.redirect(bookinstance.url);
         });
      }
   }
];

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = (req, res) => {
   res.render("bookinstance_delete", { title: "Delete Book Instance", id: req.params.id });
};

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = (req, res, next) => {
   BookInstance.findByIdAndRemove(req.body.bookinstance_id, err => {
      if (err) return next(err);
      res.redirect("/catalog/bookinstances")
   })
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = (req, res) => {
   res.send("NOT IMPLEMENTED: BookInstance update GET");
};

// Handle bookinstance update on POST
exports.bookinstance_update_post = (req, res) => {
   res.send("NOT IMPLEMENTED: BookInstance update POST");
};
