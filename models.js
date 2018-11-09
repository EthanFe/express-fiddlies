const { index, EventEmitter } = require('./funtimes')

const express = require('express');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


const savedGameSchema = new mongoose.Schema({
  resources: Object,
  buildings: Object,
  dimensions: Object
});

const buildingTypes = [ 
  { name: "lumber mill", image: "mill", cost: {stone: 40, wood: 10}, production: [{resource: "wood", time: 4, amount: 2}]},
  { name: "mine", image: "mine", cost: {stone: 15, wood: 35}, production: [{resource: "stone", time: 3, amount: 1}]},
  { name: "farm", image: "farm", cost: {stone: 40, wood: 100}, production: [{resource: "cow", time: 6, amount: 1}]},
  { name: "garden", image: "christmas tree", cost: {stone: 10, wood: 40, cow: 5}, production: [{resource: "christmas tree", time: 5, amount: 1}]},
  { name: "pool", image: "pond", cost: {stone: 60, wood: 20, cow: 10, "christmas tree": 5}, production: [{resource: "fish", time: 1, amount: 1}]},
  // { name: "burjkhalifa", image: "burjkhalifa", cost: {stone: 1000000, wood: 1000000}}
]

const buildingTypesByName = index(buildingTypes, 'name')

savedGameSchema.methods = {

  events: new EventEmitter,

  ready: function() {
    this.productionIntervals = []
    for (const building of this.buildings) {
      this.startResourceTimer(building)
    }
  },

  get when(){
    return this.events.on.bind(this.events)
  },

  get trigger(){
    return this.events.emit.bind(this.events)
  },

  startResourceTimer: function(building) {
    const productionData = buildingTypesByName[building.type].production
    for (const producedResource in productionData) {
      const resourceData = productionData[producedResource]
      this.productionIntervals.push(setInterval(
        () => this.generateResource(resourceData.resource, resourceData.amount * 100, building.position),
        resourceData.time * 1000))
    }
  },

  generateResource: function(resourceType, amount, origin) {
    // console.log(`Generating ${amount} ${resourceType} from ${origin.x}, ${origin.y}`)
    this.resources.find(resource => resource.type === resourceType).amount += amount
    this.save()
    this.trigger('resourceGained', {resourceType: resourceType, amount: amount, origin: origin, totalResources: this.resources})
  },

  buildBuilding: function(position, buildingType) {
    // build da building
    const newBuilding = {position: position, type: buildingType}
    this.buildings.push(newBuilding)
    // spend da resources
    const costs = buildingTypesByName[buildingType].cost
    for (const spentResource in costs) {
      this.resources.find(resource => resource.type === spentResource).amount -= costs[spentResource]
    }

    this.save()

    // start producing resources from new building
    this.startResourceTimer(this, newBuilding)
    // update clients
    this.trigger('buildingBuilt', {buildings: this.buildings, resources: this.resources})
  }
} 

const SavedGame = mongoose.model('savedGame', savedGameSchema);

module.exports=  {
  SavedGame
}