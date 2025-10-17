module.exports = function (req, res, next) {
  const url = req.url;

  if (url.includes('/rest/security/users/admin')) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(getAdminUser));
  } else if (url.includes('/rest/login')) {
    res.writeHead(200, {'Content-Type': 'application/json', 'authorization': 'GDB token'});
    res.end(JSON.stringify(getAuthenticatedUser));
  } else if (url.includes('/rest/security/authenticated-user')) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(getAuthenticatedUser));
  } else if (url.includes('/rest/repositories/all')) {
    // custom response overriding the dev server
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(getAllRepositories));
  } else if (/\/rest\/repositories\/[^/]+\/size\?location=/.test(url)) {
    // custom response overriding the dev server
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(repositorySizeInfo));
  } else if (/\/rest\/security\/users\/.*/.test(url)) {
    // custom response overriding the dev server
    // user update does not return a response body
    res.writeHead(200);
    res.end();
  } else if (/\/rest\/monitor\/repository\/[^/]+\/operations/.test(url)) {
    // custom response overriding the dev server
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(monitoringOperations));
  } else if (/\/repositories\/[^/]+\/namespaces/.test(url)) {
    res.writeHead(200, {'Content-Type': 'application/sparql-results+json'});
    res.end(JSON.stringify(namespaces));
  } else if (url.includes('/rest/autocomplete/query?q=')) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(autocompleteSearchResults));
  } else {
    // pass request on to the default dev server
    next();
  }
};

const getAdminUser = {
  username: 'admin',
  password: '',
  grantedAuthorities: [
    'ROLE_ADMIN'
  ],
  appSettings: {
    COOKIE_CONSENT: true,
    DEFAULT_SAMEAS: true,
    DEFAULT_INFERENCE: true,
    EXECUTE_COUNT: true,
    IGNORE_SHARED_QUERIES: false,
    DEFAULT_VIS_GRAPH_SCHEMA: true
  },
  dateCreated: 1754309863184,
  gptThreads: []
};

const getAuthenticatedUser = {
  username: 'john.doe',
  password: '',
  grantedAuthorities: [
    'ROLE_ADMIN'
  ],
  appSettings: {
    COOKIE_CONSENT: true,
    DEFAULT_SAMEAS: true,
    DEFAULT_INFERENCE: true,
    EXECUTE_COUNT: true,
    IGNORE_SHARED_QUERIES: false,
    DEFAULT_VIS_GRAPH_SCHEMA: true
  },
  dateCreated: 1754309863184,
  gptThreads: []
};

const getAllRepositories = {
  '': [
    {
      'id': 'starwars4',
      'title': '',
      'uri': 'http://localhost:8080/graphdb/repositories/starwars4',
      'externalUrl': 'http://boyantonchev:7200/repositories/starwars4',
      'local': true,
      'type': 'graphdb',
      'sesameType': 'graphdb:SailRepository',
      'location': '',
      'readable': true,
      'writable': true,
      'unsupported': false,
      'state': 'RUNNING'
    },
    {
      'id': 'marvel',
      'title': '',
      'uri': 'http://localhost:8080/graphdb/repositories/marvel',
      'externalUrl': 'http://boyantonchev:7200/repositories/marvel',
      'local': true,
      'type': 'graphdb',
      'sesameType': 'graphdb:SailRepository',
      'location': '',
      'readable': true,
      'writable': true,
      'unsupported': false,
      'state': 'RUNNING'
    },
    {
      'id': 'OntopRepo',
      'title': '',
      'uri': 'http://localhost:8080/graphdb/repositories/OntopRepo',
      'externalUrl': 'http://boyantonchev:7200/repositories/OntopRepo',
      'local': true,
      'type': 'graphdb',
      'sesameType': 'graphdb:SailRepository',
      'location': '',
      'readable': true,
      'writable': true,
      'unsupported': false,
      'state': 'RUNNING'
    }
  ],
  'http:/localhost:7002/remote-location': [
    {
      'id': 'starwars4-remote',
      'title': '',
      'uri': 'http://localhost:8080/graphdb/repositories/starwars4',
      'externalUrl': 'http://boyantonchev:7200/repositories/starwars4',
      'local': true,
      'type': 'graphdb',
      'sesameType': 'graphdb:SailRepository',
      'location': 'http:/localhost:7002/remote-location',
      'readable': true,
      'writable': true,
      'unsupported': false,
      'state': 'RUNNING'
    },
    {
      'id': 'marvel-remote',
      'title': '',
      'uri': 'http://localhost:8080/graphdb/repositories/marvel',
      'externalUrl': 'http://boyantonchev:7200/repositories/marvel',
      'local': true,
      'type': 'graphdb',
      'sesameType': 'graphdb:SailRepository',
      'location': 'http:/localhost:7002/remote-location',
      'readable': true,
      'writable': true,
      'unsupported': false,
      'state': 'RUNNING'
    },
    {
      'id': 'OntopRepo-remote',
      'title': '',
      'uri': 'http://localhost:8080/graphdb/repositories/OntopRepo',
      'externalUrl': 'http://boyantonchev:7200/repositories/OntopRepo',
      'local': true,
      'type': 'graphdb',
      'sesameType': 'graphdb:SailRepository',
      'location': 'http:/localhost:7002/remote-location',
      'readable': true,
      'writable': true,
      'unsupported': false,
      'state': 'RUNNING'
    }
  ]
};

const repositorySizeInfo = {
  'inferred': 437,
  'total': 4412,
  'explicit': 3975
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
};

const namespaces = {
  head: {
    vars: [
      'prefix',
      'namespace'
    ]
  },
  results: {
    bindings: [
      {
        prefix: {
          type: 'literal',
          value: 'agg'
        },
        namespace: {
          type: 'literal',
          value: 'http://jena.apache.org/ARQ/function/aggregate#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'sail'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.openrdf.org/config/sail#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'owl'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.w3.org/2002/07/owl#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'geof'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.opengis.net/def/function/geosparql/'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'xsd'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.w3.org/2001/XMLSchema#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'fn'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.w3.org/2005/xpath-functions'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'rdfs'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.w3.org/2000/01/rdf-schema#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'voc'
        },
        namespace: {
          type: 'literal',
          value: 'https://swapi.co/vocabulary/'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'spif'
        },
        namespace: {
          type: 'literal',
          value: 'http://spinrdf.org/spif#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'path'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.ontotext.com/path#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'array'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.w3.org/2005/xpath-functions/array'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'apf'
        },
        namespace: {
          type: 'literal',
          value: 'http://jena.apache.org/ARQ/property#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'xml'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.w3.org/XML/1998/namespace'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'rep'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.openrdf.org/config/repository#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'map'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.w3.org/2005/xpath-functions/map'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'rdf4j'
        },
        namespace: {
          type: 'literal',
          value: 'http://rdf4j.org/schema/rdf4j#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'sr'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.openrdf.org/config/repository/sail#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'wgs'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.w3.org/2003/01/geo/wgs84_pos#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'gn'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.geonames.org/ontology#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'afn'
        },
        namespace: {
          type: 'literal',
          value: 'http://jena.apache.org/ARQ/function#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'list'
        },
        namespace: {
          type: 'literal',
          value: 'http://jena.apache.org/ARQ/list#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'rdf'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'ofn'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.ontotext.com/sparql/functions/'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'geoext'
        },
        namespace: {
          type: 'literal',
          value: 'http://rdf.useekm.com/ext#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'graphdb'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.ontotext.com/config/graphdb#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'sesame'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.openrdf.org/schema/sesame#'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'math'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.w3.org/2005/xpath-functions/math'
        }
      },
      {
        prefix: {
          type: 'literal',
          value: 'omgeo'
        },
        namespace: {
          type: 'literal',
          value: 'http://www.ontotext.com/owlim/geo#'
        }
      }
    ]
  }
};

const autocompleteSearchResults = {
  suggestions: [
    {
      type: 'prefix',
      value: 'list',
      description: 'PREFIX <b>li</b>st: &lt;http://jena.apache.org/ARQ/list#&gt;'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#li',
      description: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#<b>li</b>'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#List',
      description: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#<b>Li</b>st'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/ns/hydra/core#Link',
      description: 'http://www.w3.org/ns/hydra/core#<b>Li</b>nk'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/ns/hydra/core#limit',
      description: 'http://www.w3.org/ns/hydra/core#<b>li</b>mit'
    },
    {
      type: 'uri',
      value: 'http://spinrdf.org/sp#limit',
      description: 'http://spinrdf.org/sp#<b>li</b>mit'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/ns/odrl/2/license',
      description: 'http://www.w3.org/ns/odrl/2/<b>li</b>cense'
    },
    {
      type: 'uri',
      value: 'http://usefulinc.com/ns/doap#license',
      description: 'http://usefulinc.com/ns/doap#<b>li</b>cense'
    },
    {
      type: 'uri',
      value: 'http://purl.org/dc/terms/license',
      description: 'http://purl.org/dc/terms/<b>li</b>cense'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/2000/01/rdf-schema#Literal',
      description: 'http://www.w3.org/2000/01/rdf-schema#<b>Li</b>teral'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/ns/shacl#Literal',
      description: 'http://www.w3.org/ns/shacl#<b>Li</b>teral'
    },
    {
      type: 'uri',
      value: 'http://rdfs.org/ns/void#Linkset',
      description: 'http://rdfs.org/ns/void#<b>Li</b>nkset'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/ns/org#linkedTo',
      description: 'http://www.w3.org/ns/org#<b>li</b>nkedTo'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/2008/05/skos-xl#literalForm',
      description: 'http://www.w3.org/2008/05/skos-xl#<b>li</b>teralForm'
    },
    {
      type: 'uri',
      value: 'http://rdfs.org/ns/void#linkPredicate',
      description: 'http://rdfs.org/ns/void#<b>li</b>nkPredicate'
    },
    {
      type: 'uri',
      value: 'http://purl.org/dc/terms/LicenseDocument',
      description: 'http://purl.org/dc/terms/<b>Li</b>censeDocument'
    },
    {
      type: 'uri',
      value: 'http://spinrdf.org/spin#LibraryOntology',
      description: 'http://spinrdf.org/spin#<b>Li</b>braryOntology'
    },
    {
      type: 'uri',
      value: 'http://purl.org/dc/terms/LinguisticSystem',
      description: 'http://purl.org/dc/terms/<b>Li</b>nguisticSystem'
    },
    {
      type: 'uri',
      value: 'http://www.opengis.net/ont/geosparql#wktLiteral',
      description: 'http://www.opengis.net/ont/geosparql#wkt<b>Li</b>teral'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/2004/02/skos/core#memberList',
      description: 'http://www.w3.org/2004/02/skos/core#member<b>Li</b>st'
    },
    {
      type: 'uri',
      value: 'http://spinrdf.org/sp#isLiteral',
      description: 'http://spinrdf.org/sp#is<b>Li</b>teral'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral',
      description: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XML<b>Li</b>teral'
    },
    {
      type: 'uri',
      value: 'http://spinrdf.org/sp#ElementList',
      description: 'http://spinrdf.org/sp#Element<b>Li</b>st'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/ns/hydra/core#TemplatedLink',
      description: 'http://www.w3.org/ns/hydra/core#Templated<b>Li</b>nk'
    },
    {
      type: 'uri',
      value: 'https://swapi.co/vocabulary/averageLifespan',
      description: 'https://swapi.co/vocabulary/average<b>Li</b>fespan'
    },
    {
      type: 'uri',
      value: 'http://spinrdf.org/sp#ReverseLinkPath',
      description: 'http://spinrdf.org/sp#Reverse<b>Li</b>nkPath'
    },
    {
      type: 'uri',
      value: 'http://usefulinc.com/ns/doap#mailing-list',
      description: 'http://usefulinc.com/ns/doap#mailing-<b>li</b>st'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/ns/shacl#IRIOrLiteral',
      description: 'http://www.w3.org/ns/shacl#IRIOr<b>Li</b>teral'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/2006/vcard/ns#hasCalendarLink',
      description: 'http://www.w3.org/2006/vcard/ns#hasCalendar<b>Li</b>nk'
    },
    {
      type: 'uri',
      value: 'http://www.w3.org/ns/shacl#BlankNodeOrLiteral',
      description: 'http://www.w3.org/ns/shacl#BlankNodeOr<b>Li</b>teral'
    },
    {
      type: 'uri',
      value: 'http://rdf4j.org/shacl-extensions#DataAndShapesGraphLink',
      description: 'http://rdf4j.org/shacl-extensions#DataAndShapesGraph<b>Li</b>nk'
    }
  ]
};
