var express = require('express');
var router = express.Router();
var promise = require('request-promise');

/*GET airline list from API*/

router.get('/', function(req, res) {
    options = {
        uri: "http://node.locomote.com/code-task/airports",
        qs:{
            q:req.query.q
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    promise(options).then(function(result){
        res.json(result);
    }).catch(function(error){
        // Throw this error to be handled at executor!
        res.status(500).send(error);

    });
});

module.exports = router;
