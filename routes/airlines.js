var express = require('express');
var router = express.Router();
var promise = require('request-promise');

/*GET airline list from API*/

router.get('/', function(req, res) {
    options = {
        uri: "http://node.locomote.com/code-task/airlines",
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };
    // send request with no parameters to get the list of airlines from the api
    promise(options).then(function(result){
        res.json(result);
    }).catch(function(error){
        // throw this error out and handle at executor!
        res.status(500).send(error);
    });
});

module.exports = router;
