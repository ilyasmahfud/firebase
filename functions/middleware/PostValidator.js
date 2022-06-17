const { body } = require('express-validator/check')

exports.validate = (method) => {
  switch (method) {
    case 'createUser': {
     return [ 
        body('name', 'Course name doesn\'t exists').exists(),
        body('description', 'Description doesn\'t exists').exists(),
        body('img_url', 'Image doesn\'t exists').exists(),
        body('tags', 'Tags doesn\'t exists').exists(),
        body('status').optional().isIn(['active', 'disactive'])
       ]   
    }
  }
}