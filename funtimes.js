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

module.exports=  {
  catchAsync,
  index
}