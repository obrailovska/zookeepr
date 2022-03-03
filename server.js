const express = require("express");
const fs = require("fs");
const path = require("path");

const { animals } = require("./data/animals.json");
const PORT = process.env.PORT || 3001;
const app = express();
// lets us use all css and js files in folder public
app.use(express.static("public"));
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());

// old function
// function filterByQuery(query, animalsArray) {
//   let filteredResults = animalsArray;
//   if (query.diet) {
//     filteredResults = filteredResults.filter(
//       (animal) => animal.diet === query.diet
//     );
//   }
//   if (query.species) {
//     filteredResults = filteredResults.filter(
//       (animal) => animal.species === query.species
//     );
//   }
//   if (query.name) {
//     filteredResults = filteredResults.filter(
//       (animal) => animal.name === query.name
//     );
//   }
//   return filteredResults;
// }

function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  // Note that we save the animalsArray as filteredResults here:
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
    // Save personalityTraits as a dedicated array.
    // If personalityTraits is a string, place it into a new array and save.
    if (typeof query.personalityTraits === "string") {
      personalityTraitsArray = [query.personalityTraits];
    } else {
      personalityTraitsArray = query.personalityTraits;
    }
    // Loop through each trait in the personalityTraits array:
    personalityTraitsArray.forEach((trait) => {
      // Check the trait against each animal in the filteredResults array.
      // Remember, it is initially a copy of the animalsArray,
      // but here we're updating it for each trait in the .forEach() loop.
      // For each trait being targeted by the filter, the filteredResults
      // array will then contain only the entries that contain the trait,
      // so at the end we'll have an array of animals that have every one
      // of the traits when the .forEach() loop is finished.
      filteredResults = filteredResults.filter(
        (animal) => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }
  if (query.diet) {
    filteredResults = filteredResults.filter(
      (animal) => animal.diet === query.diet
    );
    filteredResults = filteredResults.filter(
      (animal) => animal.diet === query.diet
    );
  }
  if (query.species) {
    filteredResults = filteredResults.filter(
      (animal) => animal.species === query.species
    );
  }
  if (query.name) {
    filteredResults = filteredResults.filter(
      (animal) => animal.name === query.name
    );
  }
  // return the filtered results:
  return filteredResults;
}
function findById(id, animalsArray) {
  const result = animalsArray.filter((animal) => animal.id === id)[0];
  return result;
}

function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);
  fs.writeFileSync(
    //   __dirname, which represents the directory of the file we execute the code in, with the path to the animals.json file.
    path.join(__dirname, "./data/animals.json"),
    JSON.stringify({ animals: animalsArray }, null, 2)
    // The null argument means we don't want to edit any of our existing data; if we did, we could pass something in there. The 2 indicates we want to create white space between our values to make it more readable. If we were to leave those two arguments out, the entire animals.json file would work, but it would be really hard to read.
  );
  return animal;
}
function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== "string") {
    return false;
  }
  if (!animal.species || typeof animal.species !== "string") {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== "string") {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}

app.get("/api/animals", (req, res) => {
  let results = animals;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});
app.get("/api/animals/:id", (req, res) => {
  const result = findById(req.params.id, animals);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});
app.post("/api/animals", (req, res) => {
  // set id based on what the next index of the array will be
  req.body.id = animals.length.toString();

  // if any data in req.body is incorrect, send 400 error back
  if (!validateAnimal(req.body)) {
    res.status(400).send("The animal is not properly formatted.");
  } else {
    const animal = createNewAnimal(req.body, animals);
    res.json(animal);
  }
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
  //   we're using the "path" module again to ensure that we're finding the correct location for the HTML code we want to display in the browser. This way, we know it will work in any server environment!
});
app.get("/animals", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/animals.html"));
});
app.get("/zookeepers", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/zookeepers.html"));
});
app.get("*", (req, res) => {
  // The * will act as a wildcard, meaning any route that wasn't previously defined will fall under this request and will receive the homepage as the response.The * route should always come last.
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`);
});
