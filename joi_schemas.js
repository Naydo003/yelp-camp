const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error('string.escapeHTML', { value })
        return clean
      }
    }
  }
});


const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
}).required(),
deleteImages: Joi.array()      // This is to allow the edit form to include information. Not required.
});


module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required(),
    body: Joi.string().required().escapeHTML()
  }).required()
})

// The last required() says the review is required. An empty review will be possibly without this.


// Joi has no inbuilt HTML escape validation. Perhaps use express-validator npm in future as this has HTML sanitize validation.
// express-validator has shitty syntax, we can create manual extention for joi
