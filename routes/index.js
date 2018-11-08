const { SavedGame } = require('../models')
const { catchAsync } = require('../funtimes')

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/load', async function(req, res) {
  const [findError, games] = await catchAsync(SavedGame.find())
  if (games.length > 0) {
    res.send({result: "success", gameData: games[0].json})
  } else {
    res.send({result: "error", error: "no game found"})
  }
})

router.post('/save', async function (req, res) {
  const data = JSON.stringify(req.body)
  const [ findError, games ] = await catchAsync( SavedGame.find() );
  const game = updateOrCreateSaveGame(games, data)
  res.send(saveGame(game))
})

function updateOrCreateSaveGame(games, data) {
  if (games.length > 0) {
    game = games[0]
    game.json = data
  } else {
    game = new SavedGame({ json: data });
  }
  return game
}

async function saveGame(game) {
  const [saveError, saveResult] = await catchAsync(game.save());
  if (saveError) {
    console.error(err);
    return {result: "error", error: err}
  } else {
    return {result: "success"}
  }
}

module.exports = router;



// make initial state stuff

const buildingTypes = [ 
  { name: "lumber mill", image: "mill", cost: {stone: 40, wood: 10}, production: [{resource: "wood", time: 4, amount: 2}]},
  { name: "mine", image: "mine", cost: {stone: 15, wood: 35}, production: [{resource: "stone", time: 3, amount: 1}]},
  { name: "farm", image: "farm", cost: {stone: 40, wood: 100}, production: [{resource: "cow", time: 6, amount: 1}]},
  { name: "garden", image: "christmas tree", cost: {stone: 10, wood: 40, cow: 5}, production: [{resource: "christmas tree", time: 5, amount: 1}]},
  { name: "pool", image: "pond", cost: {stone: 60, wood: 20, cow: 10, "christmas tree": 5}, production: [{resource: "fish", time: 1, amount: 1}]},
  // { name: "burjkhalifa", image: "burjkhalifa", cost: {stone: 1000000, wood: 1000000}}
]

const index = (array, key) => {
  return array.reduce( (object, element) => {
    object[element[key]] = element
    return object
    // eslint-disable-next-line
  }, new Object)
}

const buildingTypesByName = index(buildingTypes, 'name')

const productionIntervals = []

function startGame() {
  game = new SavedGame({
    resources: [
      {type: "stone", amount: 10},
      {type: "wood", amount: 10},
      {type: "cow", amount: 0},
      {type: "christmas tree", amount: 0},
      {type: "fish", amount: 0},
    ],
    buildings: [
      {position: {x: 1, y: 1}, type: "mine"},
      {position: {x: 3, y: 4}, type: "lumber mill"},
      {position: {x: 5, y: 2}, type: "lumber mill"}
    ],
    dimensions: {x: 8, y: 8},
  });
  saveGame(game)
  for (const building of game.buildings) {
    const productionData = buildingTypesByName[building.type].production
    for (const producedResource in productionData) {
      const resourceData = productionData[producedResource]
      productionIntervals.push(setInterval(
        () => generateResource(resourceData.resource, resourceData.amount, building.position),
        resourceData.time * 1000))
    }
  }
}

function generateResource(resourceType, amount, origin) {
  game.resources.find(resource => resource.type === resourceType).amount += amount
  // console.log(game.resources)
  saveGame(game)
  console.log(origin)
  io.emit('resourceGained', {resourceType: resourceType, amount: amount, origin: origin, totalResources: game.resources})
}


// socket stuff

// const express = require('express');
const http = require('http').Server(express);
const io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('buildBuilding', function(jsonSaveData){
    // const [ findError, games ] = await catchAsync( SavedGame.find() );
    // const game = updateOrCreateSaveGame(games, data)
    // console.log('message: ');
    // io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

startGame()