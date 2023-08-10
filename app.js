const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: (origin, cb) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:3000',
        'https://movies.com'
      ]
      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        return cb(null, true)
      }
      return cb(new Error('Not allowed by CORS'))
    }
  })
)
app.disable('x-powered-by')

// const ACCEPTED_ORIGINS = [
//   'http://localhost:8080',
//   'http://localhost:3000',
//   'https://movies.com'
// ]

// todos los recursos que sean MOVIES se identifican con /movies
app.get('/movies', (req, res) => {
  // res.header('Access-Control-Allow-Origin', '*')
  // res.header('Access-Control-Allow-Origin', 'http://localhost:3000/movies')
  // const origin = req.header('origin')
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some(
        (g) => g.toLocaleLowerCase() === genre.toLocaleLowerCase()
      )
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id)
  if (movie) {
    res.json(movie)
  } else {
    res.status(404).json({ message: 'Movie not found' })
  }
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (!result.success) {
    return res.status(400).json({ errors: JSON.parse(result.error.message) })
  }
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (!result.success) {
    return res.status(400).json({ errors: JSON.parse(result.error.message) })
  }
  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }
  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  res.json(updatedMovie)
})

app.delete('/movies/:id', (req, res) => {
  // const origin = req.header('origin')
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }
  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }
  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie deleted' })
})

// app.options('/movies/:id', (req, res) => {
//   const origin = req.header('origin')
//   if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//     res.header('Access-Control-Allow-Origin', origin)
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
//   }
//   res.sendStatus(200)
// })

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})