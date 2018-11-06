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
