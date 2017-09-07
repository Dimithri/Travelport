# Travelport
To run the file in your computer, simply move into the project folder and run 

`$./start.sh`

You need to install `node` for Linux/Unix and `npm ` before executing the startup
script. 

## Package requirements

For the operation of this prototype, you need the following libraries

- `q` - A library to execute a number of search queries in paralel
- `request` - A library for abstracting http request and response model
- `request-promse` - A library promisifying the request library

## Search Flights and Returns

navigate to http://localhost:3000/ for a search page. 

alternatively, you can submit queries to get a json response to `http://localhost:3000/` with query parameters
 
 `from : starting city
  to : destination city
  date: yyyy-mm-dd format date`

