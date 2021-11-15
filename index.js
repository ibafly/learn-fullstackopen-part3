// const http = require("http")
require("dotenv").config() // to use process.env.XXX
const express = require("express")
const cors = require("cors")
var morgan = require("morgan")
const Person = require("./models/person")
// const mongoose = require("mongoose") // extract all mongoose code into its own module, under ./models dir

// console.log(process.env.MONGODB_URI)

// const uri = process.env.MONGODB_URI

// mongoose.connect(uri).catch(err => {
//   console.log("connect failed", err.message)
// })

// const personSchema = new mongoose.Schema({
//   name: String,
//   number: String,
// })

// const Person = new mongoose.model("Person", personSchema)

const app = express()

app.use(express.static("build")) // express will find a resource corresponding to a request under build dir, and return it

app.use(cors()) // allows requests from all origins

morgan.token("body", req => JSON.stringify(req.body))
// app.use(morgan("tiny"))
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
)

// let persons = [
//   {
//     name: "Arto Hellas",
//     number: "040-123456",
//     id: 1,
//   },
//   {
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//     id: 2,
//   },
//   {
//     name: "Dan Abramov",
//     number: "12-43-234345",
//     id: 3,
//   },
//   {
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//     id: 4,
//   },
// ]

// const app = http.createServer((req, res) => {
//   res.writeHead(200, { "Content-Type": "application/json" })
//   res.end(JSON.stringify(persons))
// })

app.get("/", (req, res) => {
  res.send("<h1>HEY HEY helloooo</h1>") // express automatically sets Content-Type to html, but here in / i can't see Content-Type under firefox, only X-Powered-By: Express, and the status code is 304 Not Modified!
})

app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>
    ${new Date()}</p>`)
})

app.get("/api/persons", (req, res) => {
  Person.find({})
    .then(result => {
      res.json(result) // express automatically sets Content-Type to application/json, status code defaults to 200.

      mongoose.connection.close()
    })
    .catch(err => {
      res.status(500).end()
    })
})

app.get("/api/persons/:id", (req, res) => {
  //   const id = req.params.id // id is assigned with a string typed number, not number typed
  //   const id = Number(req.params.id)
  //   const personWithId = persons.find(person => person.id === id)
  //   personWithId ? res.json(personWithId) : res.status(404).end()

  Person.findById(req.params.id)
    .then(person => {
      res.json(person)
    })
    .catch(err => {
      console.log(err)
      res.status(400).send({ error: "malformatted id" })
    })
})

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id) // req.params get all params in link's tail as an object

  persons = persons.filter(person => person.id !== id)
  res.status(204).end() // 204 no content means item existed and success deleted. no consencus here, choose from 204 or 404
})

const generateMaxId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map(person => person.id)) : 0
  console.log(maxId)
  return maxId + 1
}

const generateRandId = () => {
  return Math.random() * Math.pow(10, 17)
}

app.use(express.json())
app.post("/api/persons", (req, res) => {
  const body = req.body
  const person = {
    // make person ignore other irrelevant req.body properties
    name: body.name,
    // number: body.number || false,
    number: body.number,
    id: generateRandId(),
    // date: new Date(), // generate timestamps here on server side
  } // request body comes in as string, auto parsed by function returned by express.json() to js object

  //   if (
  //     persons.find(
  //       anyPerson =>
  //         anyPerson.name.toLocaleLowerCase() === person.name.toLocaleLowerCase()
  //     )
  //   ) {
  //     return res.status(400).json({ error: "name already exists in the server" })
  //   } else
  if (!person.name || !person.number) {
    return res.status(400).json({ error: "name or number is missing" }) // send 400 bad request if name is not filled, use RETURN to finish here, no going through code below
  }

  person
    .save()
    .then(savedPerson => {
      res.json(savedPerson) // stringify js object to json string
      mongoose.connection.close()
    })
    .catch(err => {
      res.status(500).end()
    })

  //   persons = persons.concat(person)
  //   res.json(person) // stringify js object to json string
})

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: "unknown url endpoint" })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`)
})
