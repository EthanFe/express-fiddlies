const defaultState = {
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
}

module.exports=  {
  defaultState
}