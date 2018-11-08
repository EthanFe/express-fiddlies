// db stuff
// -----------------------
// -----------------------


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


const savedGameSchema = new mongoose.Schema({
  resources: Object,
  buildings: Object,
  dimensions: Object
});

const SavedGame = mongoose.model('savedGame', savedGameSchema);


module.exports=  {
  SavedGame
}