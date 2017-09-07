var q = require('q');
var express = require('express');
var request = require('request-promise');

var router = express.Router();


// Since these variables are fixed values, using global definitions
var flightSearchURI = 'http://node.locomote.com/code-task/flight_search/%airline%';
var airlinesURI = "http://node.locomote.com/code-task/airlines";//make the host names configurable before commercial deployment
var airportsURI = "http://node.locomote.com/code-task/airports";


router.get('/', function (req, res) {
    findAllFlights(req.query.from, req.query.to, req.query.date, res);
});


function execute_search(airlineResults, fromResults, toResults, date, response) {

    if (response.statusCode == 500) {
        return;
    }


    var searchPromises = [];

    airlineResults.forEach(
        function (airline) {
            var searchURL = flightSearchURI.replace('%airline%', airline.code);

            fromResults.forEach(function (origin) {
                toResults.forEach(function (destination) {
                    searchOptions = {
                        uri: searchURL,
                        qs: {
                            date: date,
                            from: origin.airportCode,
                            to: destination.airportCode
                        },
                        headers: {'User-Agent': 'Request-Promise'},
                        json: true
                    };
                    searchPromises.push(request(searchOptions)); // populate the search request list
                });
            });
        }
    );

    q.all(searchPromises).then(function (result) {
        response.json(result);
    }).catch(function (error) {
        response.status(500).send("Something went wrong when getting flights!");
        console.debug(error);
    });

    return;
}

function findAllFlights(from, to, date, res) {

    airlines_options = {
        uri: airlinesURI,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    from_options = {
        uri: airportsURI,
        qs: {q: from},
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    to_options = {
        uri: airportsURI,
        qs: {q: to},
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    var paramPromises = []; // The promises used to populate the search parameters for flight_search
    paramPromises.push(request(airlines_options));
    paramPromises.push(request(from_options));
    paramPromises.push(request(to_options));

    q.all(paramPromises).then(function (result) {
        airlineResults = result[0];
        fromResults = result[1];
        toResults = result[2];

        console.log('Parameters ready');

        execute_search(airlineResults, fromResults, toResults, date, res);

    }).catch(
        function (error) {
            res.status(500).send('Something went wrong when getting the search parameters!');
            console.debug(error)
        }
    );

}

module.exports = router;