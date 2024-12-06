module.exports = function (req, res, next) {
  if (req.url === '/rest/repositories/all') {
    // custom response overriding the dev server
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(getAllRepositories));
  } else {
    // pass request on to the default dev server
    next();
  }
};

const getAllRepositories = {
  "": [
    {
      "id": "starwars4",
      "title": "",
      "uri": "http://localhost:8080/graphdb/repositories/starwars4",
      "externalUrl": "http://boyantonchev:7200/repositories/starwars4",
      "local": true,
      "type": "graphdb",
      "sesameType": "graphdb:SailRepository",
      "location": "",
      "readable": true,
      "writable": true,
      "unsupported": false,
      "state": "RUNNING"
    },
    {
      "id": "marvel",
      "title": "",
      "uri": "http://localhost:8080/graphdb/repositories/marvel",
      "externalUrl": "http://boyantonchev:7200/repositories/marvel",
      "local": true,
      "type": "graphdb",
      "sesameType": "graphdb:SailRepository",
      "location": "",
      "readable": true,
      "writable": true,
      "unsupported": false,
      "state": "RUNNING"
    },
    {
      "id": "OntopRepo",
      "title": "",
      "uri": "http://localhost:8080/graphdb/repositories/OntopRepo",
      "externalUrl": "http://boyantonchev:7200/repositories/OntopRepo",
      "local": true,
      "type": "graphdb",
      "sesameType": "graphdb:SailRepository",
      "location": "",
      "readable": true,
      "writable": true,
      "unsupported": false,
      "state": "RUNNING"
    }
  ],
  "http:/localhost:7002/remote-location": [
    {
      "id": "starwars4-remote",
      "title": "",
      "uri": "http://localhost:8080/graphdb/repositories/starwars4",
      "externalUrl": "http://boyantonchev:7200/repositories/starwars4",
      "local": true,
      "type": "graphdb",
      "sesameType": "graphdb:SailRepository",
      "location": "http:/localhost:7002/remote-location",
      "readable": true,
      "writable": true,
      "unsupported": false,
      "state": "RUNNING"
    },
    {
      "id": "marvel-remote",
      "title": "",
      "uri": "http://localhost:8080/graphdb/repositories/marvel",
      "externalUrl": "http://boyantonchev:7200/repositories/marvel",
      "local": true,
      "type": "graphdb",
      "sesameType": "graphdb:SailRepository",
      "location": "http:/localhost:7002/remote-location",
      "readable": true,
      "writable": true,
      "unsupported": false,
      "state": "RUNNING"
    },
    {
      "id": "OntopRepo-remote",
      "title": "",
      "uri": "http://localhost:8080/graphdb/repositories/OntopRepo",
      "externalUrl": "http://boyantonchev:7200/repositories/OntopRepo",
      "local": true,
      "type": "graphdb",
      "sesameType": "graphdb:SailRepository",
      "location": "http:/localhost:7002/remote-location",
      "readable": true,
      "writable": true,
      "unsupported": false,
      "state": "RUNNING"
    }
  ]
}

