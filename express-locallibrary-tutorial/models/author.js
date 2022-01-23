const { DateTime } = require("luxon");
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

AuthorSchema.virtual("bday_formatted").get(function () {
   return DateTime.fromJSDate(this.date_of_birth)
      .toUTC()
      .toFormat("yyyy-MM-dd");
});

AuthorSchema.virtual("death_formatted").get(function () {
   return DateTime.fromJSDate(this.date_of_death)
      .toUTC()
      .toFormat("yyyy-MM-dd");
});

AuthorSchema.virtual("lifespan").get(function () {
   return this.date_of_birth
      ? `${DateTime.fromJSDate(this.date_of_birth).toLocaleString(
           DateTime.DATE_MED
        )}${
           this.date_of_death
              ? ` : ${DateTime.fromJSDate(this.date_of_death).toLocaleString(
                   DateTime.DATE_MED
                )}`
              : ""
        }`
      : "";
});

AuthorSchema.virtual("url").get(function () {
   return `/catalog/author/${this._id}`;
});

module.exports = mongoose.model("Author", AuthorSchema);
