const catchAsync = promise => {
  return new Promise( (resolve) => {
    promise
      .then( result => resolve( [ null, result ]))
      .catch( error => resolve( [ error, null ] ))
  })
}

const index = (array, key) => {
  return array.reduce( (object, element) => {
    object[element[key]] = element
    return object
    // eslint-disable-next-line
  }, new Object)
}

class EventEmitter {
	
	constructor(){
		this.bin = new Object
    }

	on(event, callback){
		if(this.bin[event] == undefined) this.bin[event]= new Array
		this.bin[event].push(callback)
    }

	emit(event, payload){
		if(this.bin[event]) this.bin[event].forEach( callback => callback(payload))
    }
	

}

module.exports=  {
  catchAsync,
  index,
  EventEmitter
}