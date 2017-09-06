var express = require('express');
var router = express.Router();
var promise = require('request-promise');

var al_ready = false;
var to_ready = false;
var from_ready = false;
var date = "";
var al_codes = [];
var from_airports = [];
var to_airports = [];
var search_results=[];

router.get('/', function(req, res) {
    search_results=[];
    date = req.query.date;
    al_ready = false;
    from_ready = false;
    from_airports = [];
    al_codes=[];
    to_ready=false;
    to_airports = [];
    findAllFlights(req.query.from, req.query.to, req.query.date,res);
});



var execute_search = function (response) {

    var counter = 1;
    if (response.statusCode == 500){
        return;
    }
    //if the airlines are gathered, the origin airport codes are found and destination airport codes are found
    // initiate api requests for searching flights
    if (al_ready && to_ready && from_ready){
        for (var a =0; a < al_codes.length ; a++){
            //for each airline
            var flightsearchuri = 'http://node.locomote.com/code-task/flight_search/'+al_codes[a];

            for (var i = 0; i < from_airports.length; i++){
                //for each origin
                for (var j = 0; j< to_airports.length; j++) {
                    //for each destination
                    flightsearchoptions = {
                        uri: flightsearchuri,
                        qs: {
                            date:date,
                            from: from_airports[i],
                            to:to_airports[j]
                        },
                        headers: {
                            'User-Agent': 'Request-Promise'
                        },
                        json: true
                    };

                    promise(flightsearchoptions).then(function(results){

                        counter++;

                        search_results.push(results);
                        if(counter == from_airports.length * to_airports.length*al_codes.length) {
                            response.json(search_results);
                            //if the total number of executed api queries is the total number possible, send current
                            //results as JSON objects to the client
                            console.debug('Search API Execution finished!');
                            }

                    }).catch(function(error){
                        counter++;
                        console.error(error);
                    });

                }
            }
        }
    }
    return;
};

var findAllFlights = function (from, to, date, res) {
    //get the airline list
    var airlines_uri = "http://localhost:3000/airlines";//make the host names configurable before commercial deployment
    var airports_uri = "http://localhost:3000/airports";
    date = date;

    airlines_options = {
        uri: airlines_uri,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    from_options = {
        uri: airports_uri,
        qs : {q : from},
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    to_options = {
        uri: airports_uri,
        qs : {q : to},
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };


    promise(airlines_options).then(

        function(result){

            for (var i =0; i<result.length; i++){
                al_codes.push(result[i].code);
            }
            al_ready = true;
            execute_search(res); // try to execute this search query after each successful response
            // we can't tell which response will come last due to network asynchrony
    }
    ).catch( function(error){
        if (res.statusCode != 500) {
            res.status(500).send("Error when getting airline list");
        }
        al_ready = false;
        console.debug(error);
    });

    promise(from_options).then(

        function(result){
            from_ready = false;
            for (var i =0; i<result.length; i++){
                from_airports.push(result[i].airportCode);
            }
            from_ready = true;
            execute_search(res);
        }
    ).catch( function(error){
        if (res.statusCode != 500) {
            res.status(500).send("Error when getting origin airport list");
        }
        from_ready = false;
        console.debug(error);
    });


    promise(to_options).then(

        function(result){
            to_ready = false;

            for (var i =0; i<result.length; i++){
                to_airports.push(result[i].airportCode);
            }
            to_ready = true;
            execute_search(res); // doesn't matter which one finishes last. It'll execute the searches!
        }
    ).catch( function(error){
        to_ready = false;
        if (res.statusCode != 500) {
            res.status(500).send("Error when getting destination airport list");
        }
        console.debug(error);
    });
};

module.exports = router;