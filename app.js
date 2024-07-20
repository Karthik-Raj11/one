const express = require('express')
const path = require('path')
const dbpath = path.join(__dirname, 'moviesData.db')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const bcrypt = require('bcrypt')
const app = express()
let db = null
app.use(express.json())
const crud = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is Running properly at port 3000')
    })
  } catch (err) {
    console.log(err.message)
  }
}
crud()

function convertingObject(item) {
  return {
    movieId: item.movie_id,
    directorId: item.director_id,
    movieName: item.movie_name,
    leadActor: item.lead_actor,
  }
}
// API 1 "GET ALL MOVIES"

app.get('/movies/', async (request, response) => {
  const get_q = `SELECT movie_name FROM movie`
  const res_q = await db.all(get_q)
  response.send(res_q.map(eachItem => ({movieName: eachItem.movie_name})))
})

// API 2 "CREATE TABLE"

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const add_table = `
            INSERT INTO movie (director_id, movie_name, lead_actor)
            values (
              ${directorId},
              "${movieName}",
              "${leadActor}"
            )`
  const res = await db.run(add_table)
  const lastId = res.lastId
  // response.send({lastId: lastId})
  response.send(`Movie Successfully Added`)
})

// API 3 "Returns a movie based on the movie ID"

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const query = `SELECT * FROM movie WHERE movie_id = ${movieId}`
  const movie = await db.get(query)
  response.send(convertingObject(movie))
})

// API 4 "Updates the details of a movie in the movie table based on the movie ID"

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body

  const update_query = `UPDATE movie 
                        SET director_id = ${directorId},
                        movie_name = "${movieName}",
                        lead_actor = "${leadActor}"
                        WHERE movie_id = ${movieId}`
  const update_movie = await db.run(update_query)
  response.send(`Movie Details Updated`)
})

// API 5 "Deletes a movie from the movie table based on the movie ID"

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const delete_movie = `DELETE FROM movie WHERE movie_id = ${movieId}`
  await db.run(delete_movie)
  response.send(`Movie Removed`)
})

const convertDirectorObject = director => {
  return {
    directorId: director.director_id,
    directorName: director.director_name,
  }
}
// API 6 "Returns a list of all directors in the director table"

app.get('/directors/', async (request, response) => {
  const get_query = `SELECT * FROM director`
  const get_director = await db.all(get_query)
  response.send(
    get_director.map(eachDirector => convertDirectorObject(eachDirector)),
  )
})

// API 7 "Returns a list of all movie names directed by a specific director"
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const query = `SELECT movie_name 
                FROM movie  WHERE director_id  = ${directorId}`
  const list_movies = await db.all(query)
  response.send(
    list_movies.map(eachDirector => convertDirectorObject(eachDirector)),
  )
})

module.exports = app
