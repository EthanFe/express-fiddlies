// db stuff
// -----------------------
// -----------------------


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


const savedGameSchema = new mongoose.Schema({
  json: String
});

const SavedGame = mongoose.model('savedGame', savedGameSchema);


module.exports=  {
  SavedGame
}