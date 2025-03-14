module.exports = function (req, res, next) {
  if (req.url === '/rest/repositories/all') {
    // custom response overriding the dev server
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(getAllRepositories));
  } else if (/^\/rest\/repositories\/[^/]+\/size\?location=/.test(req.url)) {
    // custom response overriding the dev server
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(repositorySizeInfo));
  } else if (/^\/rest\/security\/users\/.*/.test(req.url)) {
    // custom response overriding the dev server
    // user update does not return a response body
    res.writeHead(200);
    res.end();
  } else if (/\/rest\/monitor\/repository\/[^/]+\/operations/.test(req.url)) {
    // custom response overriding the dev server
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(monitoringOperations));
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

const repositorySizeInfo = {
  "inferred":437,
  "total":4412,
  "explicit":3975
};

const monitoringOperations = {
  status: 'INFORMATION',
  allRunningOperations: [
    {
      value: '25',
      status: 'INFORMATION',
      type: 'queries'
    },
    {
      value: '1',
      status: 'INFORMATION',
      type: 'updates'
    },
    {
      value: '1',
      status: 'CRITICAL',
      type: 'imports'
    },
    {
      value: 'CREATE_BACKUP_IN_PROGRESS',
      status: 'WARNING',
      type: 'backupAndRestore'
    },
    {
      value: 'UNAVAILABLE_NODES',
      status: 'WARNING',
      type: 'clusterHealth'
    }
  ]
}
