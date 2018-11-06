const catchAsync = promise => {
  return new Promise( (resolve) => {
    promise
      .then( result => resolve( [ null, result ]))
      .catch( error => resolve( [ error, null ] ))
  })
}

module.exports=  {
  catchAsync
}