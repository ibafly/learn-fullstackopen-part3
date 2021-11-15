const mongoose = require("mongoose")

// if (process.argv.length < 3) {
//   console.log("Please provide mongoDB passwd as an argument")
//   process.exit(1)
// }

const passwd = process.argv[2]

const uri = `mongodb+srv://admin:${passwd}@fullstackopen.zpqnw.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(uri)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = new mongoose.model("Person", personSchema)

// const person = new Person({
//   name: "new-person",
//   number: "new-number",
// })

const getAllPersons = () => {
  let allPersons = []
  Person.find({}).then(result => {
    allPersons = result
    console.log("phonebook entries:")
    allPersons.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
  return allPersons
}

const savePerson = person => {
  person.save().then(result => {
    console.log(`Added ${person.name}, number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}

const argLength = process.argv.length
switch (true) {
  case argLength < 3:
    console.log("Please provide mongoDB passwd as an argument")
    process.exit(1)
    break
  case argLength === 3:
    getAllPersons()
    // process.exit(0) // BIG mistake!! This will terminate all processs going on currently. means that data operations to remote will not be finished.
    break
  default:
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4] || null,
    })
    savePerson(person)
    break
}

// export default { getAllPersons, savePerson }
