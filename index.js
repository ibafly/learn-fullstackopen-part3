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
) // api request logger

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

app.get("/api/persons/:id", (req, res, next) => {
  //   const id = req.params.id // id is assigned with a string typed number, not number typed
  //   const id = Number(req.params.id)
  //   const personWithId = persons.find(person => person.id === id)
  //   personWithId ? res.json(personWithId) : res.status(404).end()

  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    //    .catch(err => {

    //      console.log(err)
    //      res.status(400).send({ error: "malformatted id" })
    //    })
    .catch(err => next(err)) // goes to error handling middleware
})

app.delete("/api/persons/:id", (req, res, next) => {
  //  const id = Number(req.params.id) // req.params get all params in link's tail as an object
  const id = req.params.id // mongoDB requires string of a string of 12 bytes or a string of 24 hex characters

  //  persons = persons.filter(person => person.id !== id)
  Person.findByIdAndDelete(id)
    .then(person => {
      if (person) {
        console.log(person)
        res.status(204).end() // 204 no content means item existed and success deleted. no consencus here, choosed from 204 or 404
      } else {
        res.status(404).end()
      }
    })
    //    .catch(err => {
    //      console.log(err)
    //      res.status(400).send({ error: "malformatted id & no deletion" })
    //    })
    .catch(err => next(err))
})

app.use(express.json()) // put this line in the right place to avoid undefined req.body
app.put("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndUpdate(
    // req.params are in url while req.body is the request payload!
    req.params.id,
    { number: req.body.number },
    { new: true }
  )
    .then(updatedPerson => {
      //    if (updatedPerson) {
      console.log(updatedPerson)
      res.json(updatedPerson)
      //   } else {
      // do we need a POST in PUT?
      //      res
      //        .status(400)
      //        .send({
      //          error:
      //            "update(put) failed, entry not found in remote sever, auto create a new entry",
      //        })
      //    }
    })
    .catch(err => {
      console.log(err)
      res.status(500).end()
    })
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

app.post("/api/persons", (req, res) => {
  const body = req.body
  console.log(req.body)
  /* const person = {
    // make person ignore other irrelevant req.body properties
    name: body.name,
    // number: body.number || false,
    number: body.number,
    // id: generateRandId(), // _id generated by MongoDB, transformed to id in /models/person.js
    // date: new Date(), // generate timestamps here on server side
  } // request body comes in as string, auto parsed by function returned by express.json() to js object
  */

  const person = new Person({ name: body.name, number: body.number || null })

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
      console.log(savedPerson)
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

const errorHandler = (err, req, res, next) => {
  console.error(err.message)
  if (err.name === "CastError") {
    res.status(400).send({ error: "malfomatted id" })
  }
  next(err)
}
app.use(errorHandler) // error handling middleware should be the last loaded middleware

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`)
})
