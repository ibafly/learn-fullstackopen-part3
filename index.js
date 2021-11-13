const http = require("http")

const persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
  {
    name: "qw",
    number: "29836492649",
    id: 5,
  },
  {
    name: "jsdhkjag",
    number: "9184612649",
    id: 6,
  },
  {
    name: "asdhl",
    number: "2938463",
    id: 8,
  },
  {
    name: "asfdlfk",
    number: "1270186489",
    id: 10,
  },
  {
    name: "aksdg",
    number: "192639174",
    id: 11,
  },
  {
    name: "agdk",
    number: "98460834",
    id: 12,
  },
  {
    name: "eifh",
    number: "984601846018",
    id: 13,
  },
  {
    name: "RRR",
    number: "9168496",
    id: 14,
  },
  {
    name: "ajdhla",
    number: "0348063482",
    id: 15,
  },
]

const app = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify(persons))
})

const PORT = 3002
app.listen(PORT)
console.log("server running on PORT 3002")
