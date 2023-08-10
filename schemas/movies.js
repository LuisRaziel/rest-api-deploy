const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Title must be a string',
    required_error: 'Title is required'
  }),
  year: z.number().int().min(1888).max(2023),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(0),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z
    .array(
      z.enum(['Action', 'Comedy', 'Drama', 'Horror', 'Thriller', 'Sci-Fi', 'Crime', 'Fantasy']),
      {
        required_error: 'Genre is required',
        invalid_type_error: 'Genre must be an array of strings'
      }
    )
})

function validateMovie (movie) {
  return movieSchema.safeParse(movie)
}

function validatePartialMovie (movie) {
  return movieSchema.partial().safeParse(movie)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
