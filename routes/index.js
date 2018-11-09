const { SavedGame } = require('../models')
const { catchAsync } = require('../funtimes')
const { defaultState } = require('../data')

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

module.exports = router;

async function findOrCreateSaveGame() {
  const [ findError, games ] = await catchAsync( SavedGame.find() );
  if (games !== null && games.length > 0) {
    return games[0]
  } else {
    const game = new SavedGame(defaultState)
    game.save()
    return game
  }
}

async function start() {
  // SavedGame.remove({}, () => {})
  const game = await findOrCreateSaveGame()
  game.ready()
  setupSockets(game)
}

function setupSockets(game) {
  const http = require('http').Server(express);
  const io = require('socket.io')(http);

  io.on('connection', (socket) => {
    io.to(socket.id).emit('initialLoadData', {resources: game.resources,
                                              buildings: game.buildings,
                                              dimensions: game.dimensions})

    console.log('a user connected');

    game.when('buildingBuilt', payload => io.emit('buildingBuilt', payload))
    game.when('resourceGained', payload => io.emit('resourceGained', payload))

    socket.on('buildBuilding', function(buildingData){
      game.buildBuilding(buildingData.position, buildingData.buildingType)
    });
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });

  http.listen(3000, function(){
    console.log('listening on *:3000');
  });
}

start()