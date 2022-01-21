const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
   first_name: {
      type: String,
      required: true,
      maxLength: 100
   },
   family_name: {
      type: String,
      required: true,
      maxLength: 100
   },
   date_of_birth: Date,
   date_of_death: Date
});

AuthorSchema.virtual("name").get(function () {
   let fullname = "";
   if (this.first_name && this.family_name) {
      fullname = `${this.first_name}, ${this.family_name}`;
   }
   if (!this.first_name || !this.family_name) {
      fullname = "";
   }
   return fullname;
});

AuthorSchema.virtual("lifespan").get(function () {
   let lifetime_string = "";
   if (this.date_of_birth) {
      lifetime_string = this.date_of_birth.getYear().toString();
   }
   lifetime_string += " - ";
   if (this.date_of_death) {
      lifetime_string += this.date_of_death.getYear();
   }
   return lifetime_string;
});

AuthorSchema.virtual("url").get(function () {
   return `/catalog/author/${this._id}`;
});

module.exports = mongoose.model("Author", AuthorSchema);
