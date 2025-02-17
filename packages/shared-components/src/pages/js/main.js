const testContext = document.createElement('onto-test-context');
document.body.appendChild(testContext);
testContext.changeLanguage('en');

// Mock the navigateUrl function which is exposed by the single-spa via the root-config module
// in order to allow the menu to work without going anywhere when clicking the menu items
window.singleSpa = {
  navigateToUrl: function (url) {
    const redirect = document.createElement('div');
    redirect.id = 'redirect-url';
    redirect.innerHTML = `redirect to ${url}`;
    document.body.appendChild(redirect);
  }
};

const updateLicense = (license) => {
  testContext.updateLicense(license);
}

const loadProductInfo = () => {
  testContext.updateProductInfo({
    workbench: '2.8.0',
    sesame: '4.3.15',
    connectors: '16.2.13-RC2',
    productVersion: '11.0-SNAPSHOT'
  });
};

const loadRepositories = () => {
  testContext.loadRepositories();
}

const setAuthUser = (user) => {
  testContext.setAuthenticatedUser(user);
}

const setSecurityConfig = (config) => {
  testContext.setSecurityConfig(config);
}

window.PluginRegistry = {
  get: () => menuItems
}

menuItems = [
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "ACL Management",
        "labelKey": "menu.aclmanagement.label",
        "href": "aclmanagement",
        "order": 6,
        "parent": "Setup",
        "role": "ROLE_ADMIN",
        "guideSelector": "sub-menu-aclmanagement",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "Autocomplete",
        "labelKey": "menu.autocomplete.label",
        "href": "autocomplete",
        "order": 40,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-autocomplete",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Backup and Restore",
        "labelKey": "menu.backup_and_restore.label",
        "href": "monitor/backup-and-restore",
        "order": 2,
        "parent": "Monitor",
        "guideSelector": "sub-menu-backup-and-restore",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Lab",
        "labelKey": "menu.lab.label",
        "href": "#",
        "order": 6,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "fa fa-flask",
        "guideSelector": "menu-lab",
        "shouldShow": true
      },
      {
        "label": "Talk to Your Graph",
        "labelKey": "menu.ttyg.label",
        "href": "chatgpt",
        "order": 20,
        "role": "ROLE_USER",
        "parent": "Lab",
        "guideSelector": "sub-menu-ttyg",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Cluster",
        "labelKey": "menu.cluster.label",
        "href": "cluster",
        "order": 20,
        "role": "ROLE_USER",
        "parent": "Setup",
        "guideSelector": "sub-menu-cluster",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Explore",
        "labelKey": "menu.explore.label",
        "href": "#",
        "order": 1,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-data",
        "guideSelector": "menu-explore",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Explore",
        "labelKey": "menu.explore.label",
        "href": "#",
        "order": 1,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-data",
        "guideSelector": "menu-explore",
        "shouldShow": true
      },
      {
        "label": "Graphs overview",
        "labelKey": "menu.graphs.overview.label",
        "href": "graphs",
        "order": 0,
        "role": "IS_AUTHENTICATED_FULLY",
        "parent": "Explore",
        "guideSelector": "sub-menu-graph-overview",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "Connectors",
        "labelKey": "menu.connectors.label",
        "href": "connectors",
        "order": 10,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-connectors",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Explore",
        "labelKey": "menu.explore.label",
        "href": "#",
        "order": 1,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-data",
        "guideSelector": "menu-explore",
        "shouldShow": true
      },
      {
        "label": "Class relationships",
        "labelKey": "menu.class.relationships.label",
        "href": "relationships",
        "order": 2,
        "parent": "Explore",
        "guideSelector": "sub-menu-class-relationships",
        "shouldShow": true
      },
      {
        "label": "Class hierarchy",
        "labelKey": "menu.class.hierarchy.label",
        "href": "hierarchy",
        "order": 1,
        "parent": "Explore",
        "guideSelector": "menu-class-hierarchy",
        "shouldShow": true
      },
      {
        "label": "Visual graph",
        "labelKey": "visual.graph.label",
        "href": "graphs-visualizations",
        "order": 5,
        "parent": "Explore",
        "children": [
          {
            "href": "graphs-visualizations/config/save",
            "children": [],
            "shouldShow": true
          }
        ],
        "guideSelector": "sub-menu-visual-graph",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Guides",
        "labelKey": "menu.guides.label",
        "order": 0,
        "parent": "Help",
        "icon": "paste",
        "href": "guides",
        "role": "ROLE_USER",
        "guideSelector": "sub-menu-guide",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Import",
        "labelKey": "common.import",
        "href": "import",
        "order": 0,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-import",
        "guideSelector": "menu-import",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "JDBC",
        "labelKey": "menu.jdbc.label",
        "href": "jdbc",
        "order": 50,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-jdbs",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "Namespaces",
        "labelKey": "menu.namespaces.label",
        "href": "namespaces",
        "order": 30,
        "parent": "Setup",
        "guideSelector": "sub-menu-namespaces",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "Plugins",
        "labelKey": "menu.plugins.label",
        "href": "plugins",
        "order": 25,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-plugins",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Monitor",
        "labelKey": "menu.monitor.label",
        "href": "#",
        "order": 3,
        "role": "ROLE_USER",
        "icon": "icon-monitoring",
        "guideSelector": "menu-monitor",
        "shouldShow": true
      },
      {
        "label": "Queries and Updates",
        "labelKey": "menu.queries.and.updates.label",
        "href": "monitor/queries",
        "order": 1,
        "parent": "Monitor",
        "guideSelector": "sub-menu-queries-and-updates",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "RDF Rank",
        "labelKey": "view.rdf.rank.title",
        "href": "rdfrank",
        "order": 45,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-rdf-rank",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "Repositories",
        "labelKey": "menu.repositories.label",
        "href": "repository",
        "order": 1,
        "role": "ROLE_REPO_MANAGER",
        "parent": "Setup",
        "children": [
          {
            "href": "repository/create",
            "children": [],
            "shouldShow": true
          }
        ],
        "guideSelector": "sub-menu-repositories",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Monitor",
        "labelKey": "menu.monitor.label",
        "href": "#",
        "order": 3,
        "role": "ROLE_USER",
        "icon": "icon-monitoring",
        "guideSelector": "menu-monitor",
        "shouldShow": true
      },
      {
        "label": "Resources",
        "labelKey": "menu.resources.label",
        "href": "monitor/system",
        "role": "ROLE_MONITORING",
        "order": 3,
        "parent": "Monitor",
        "guideSelector": "sub-menu-resources",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "Users and Access",
        "labelKey": "menu.users.and.access.label",
        "href": "users",
        "order": 2,
        "parent": "Setup",
        "role": "ROLE_ADMIN",
        "children": [
          {
            "href": "user/create",
            "children": [],
            "shouldShow": true
          }
        ],
        "guideSelector": "sub-menu-user-and-access",
        "shouldShow": true
      },
      {
        "label": "My Settings",
        "labelKey": "menu.my.settings.label",
        "href": "settings",
        "order": 6,
        "parent": "Setup",
        "role": "ROLE_USER",
        "guideSelector": "sub-menu-my-settings",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "License",
        "labelKey": "menu.license.label",
        "href": "license",
        "order": 100,
        "role": "ROLE_ADMIN",
        "parent": "Setup",
        "guideSelector": "sub-menu-license",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "sub-menu-setup",
        "shouldShow": true
      },
      {
        "label": "Similarity",
        "labelKey": "menu.similarity.label",
        "href": "similarity",
        "order": 40,
        "parent": "Explore",
        "role": "IS_AUTHENTICATED_FULLY",
        "children": [
          {
            "href": "similarity/index/create",
            "children": [],
            "shouldShow": true
          }
        ],
        "guideSelector": "sub-menu-similarity",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "SPARQL",
        "labelKey": "menu.sparql.label",
        "href": "sparql",
        "order": 2,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-sparql",
        "guideSelector": "menu-sparql",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "SPARQL Templates",
        "labelKey": "menu.sparql.template.label",
        "href": "sparql-templates",
        "order": 51,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-sparql-templates",
        "shouldShow": true
      }
    ]
  },
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 7,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup",
        "shouldShow": true
      },
      {
        "label": "Help",
        "labelKey": "menu.help.label",
        "href": "#",
        "order": 8,
        "icon": "icon-help",
        "guideSelector": "menu-help",
        "shouldShow": true
      },
      {
        "label": "System information",
        "labelKey": "menu.system.information.label",
        "href": "sysinfo",
        "order": 50,
        "parent": "Help",
        "role": "ROLE_ADMIN",
        "guideSelector": "sub-menu-system-information",
        "shouldShow": true
      },
      {
        "label": "REST API",
        "labelKey": "menu.rest.api.label",
        "href": "webapi",
        "order": 1,
        "parent": "Help",
        "guideSelector": "sub-menu-rest-api",
        "shouldShow": true
      },
      {
        "label": "Documentation",
        "labelKey": "menu.documentation.label",
        "order": 2,
        "parent": "Help",
        "icon": "icon-external",
        "guideSelector": "sub-menu-documentation",
        "shouldShow": true
      },
      {
        "label": "Tutorials",
        "labelKey": "menu.tutorials.label",
        "order": 3,
        "parent": "Help",
        "icon": "icon-external",
        "guideSelector": "sub-menu-developer-hub",
        "shouldShow": true
      },
      {
        "label": "Support",
        "labelKey": "menu.support.label",
        "order": 4,
        "parent": "Help",
        "icon": "icon-external",
        "guideSelector": "sub-menu-support",
        "shouldShow": true
      }
    ]
  }
];
