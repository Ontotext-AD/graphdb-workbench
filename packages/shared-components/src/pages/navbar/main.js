let navbarElement = document.querySelector("onto-navbar");

// Mock the navigateUrl function which is exposed by the single-spa via the root-config module
// in order to allow the menu to work without going anywhere when clicking the menu items
window.singleSpa = {
  navigateToUrl: function (url) {
    console.log('%cnavigate', 'background: blue', url);
  }
};

navbarElement.menuItems = [
  {
    "items": [
      {
        "label": "Setup",
        "labelKey": "menu.setup.label",
        "href": "#",
        "order": 5,
        "role": "IS_AUTHENTICATED_FULLY",
        "icon": "icon-settings",
        "guideSelector": "menu-setup"
      },
      {
        "label": "ACL Management",
        "labelKey": "menu.aclmanagement.label",
        "href": "aclmanagement",
        "order": 6,
        "parent": "Setup",
        "role": "ROLE_ADMIN",
        "guideSelector": "sub-menu-aclmanagement"
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
        "guideSelector": "menu-setup"
      },
      {
        "label": "Autocomplete",
        "labelKey": "menu.autocomplete.label",
        "href": "autocomplete",
        "order": 40,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-autocomplete"
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
        "guideSelector": "sub-menu-backup-and-restore"
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
        "guideSelector": "menu-lab"
      },
      {
        "label": "Talk to Your Graph",
        "labelKey": "menu.ttyg.label",
        "href": "chatgpt",
        "order": 20,
        "role": "ROLE_USER",
        "parent": "Lab",
        "guideSelector": "sub-menu-ttyg"
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
        "guideSelector": "sub-menu-cluster"
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
        "guideSelector": "menu-explore"
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
        "guideSelector": "menu-explore"
      },
      {
        "label": "Graphs overview",
        "labelKey": "menu.graphs.overview.label",
        "href": "graphs",
        "order": 0,
        "role": "IS_AUTHENTICATED_FULLY",
        "parent": "Explore",
        "guideSelector": "sub-menu-graph-overview"
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
        "guideSelector": "menu-setup"
      },
      {
        "label": "Connectors",
        "labelKey": "menu.connectors.label",
        "href": "connectors",
        "order": 10,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-connectors"
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
        "guideSelector": "menu-explore"
      },
      {
        "label": "Class relationships",
        "labelKey": "menu.class.relationships.label",
        "href": "relationships",
        "order": 2,
        "parent": "Explore",
        "guideSelector": "sub-menu-class-relationships"
      },
      {
        "label": "Class hierarchy",
        "labelKey": "menu.class.hierarchy.label",
        "href": "hierarchy",
        "order": 1,
        "parent": "Explore",
        "guideSelector": "menu-class-hierarchy"
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
            "children": []
          }
        ],
        "guideSelector": "sub-menu-visual-graph"
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
        "guideSelector": "sub-menu-guide"
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
        "guideSelector": "menu-import"
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
        "guideSelector": "menu-setup"
      },
      {
        "label": "JDBC",
        "labelKey": "menu.jdbc.label",
        "href": "jdbc",
        "order": 50,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-jdbs"
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
        "guideSelector": "menu-setup"
      },
      {
        "label": "Namespaces",
        "labelKey": "menu.namespaces.label",
        "href": "namespaces",
        "order": 30,
        "parent": "Setup",
        "guideSelector": "sub-menu-namespaces"
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
        "guideSelector": "menu-setup"
      },
      {
        "label": "Plugins",
        "labelKey": "menu.plugins.label",
        "href": "plugins",
        "order": 25,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-plugins"
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
        "guideSelector": "menu-monitor"
      },
      {
        "label": "Queries and Updates",
        "labelKey": "menu.queries.and.updates.label",
        "href": "monitor/queries",
        "order": 1,
        "parent": "Monitor",
        "guideSelector": "sub-menu-queries-and-updates"
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
        "guideSelector": "menu-setup"
      },
      {
        "label": "RDF Rank",
        "labelKey": "view.rdf.rank.title",
        "href": "rdfrank",
        "order": 45,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-rdf-rank"
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
        "guideSelector": "menu-setup"
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
            "children": []
          }
        ],
        "guideSelector": "sub-menu-repositories"
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
        "role": "ROLE_MONITORING",
        "icon": "icon-monitoring",
        "guideSelector": "menu-monitor"
      },
      {
        "label": "Resources",
        "labelKey": "menu.resources.label",
        "href": "monitor/system",
        "role": "ROLE_MONITORING",
        "order": 3,
        "parent": "Monitor",
        "guideSelector": "sub-menu-resources"
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
        "guideSelector": "menu-setup"
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
            "children": []
          }
        ],
        "guideSelector": "sub-menu-user-and-access"
      },
      {
        "label": "My Settings",
        "labelKey": "menu.my.settings.label",
        "href": "settings",
        "order": 6,
        "parent": "Setup",
        "role": "ROLE_USER",
        "guideSelector": "sub-menu-my-settings"
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
        "guideSelector": "sub-menu-license"
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
        "guideSelector": "sub-menu-setup"
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
            "children": []
          }
        ],
        "guideSelector": "sub-menu-similarity"
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
        "guideSelector": "menu-sparql"
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
        "guideSelector": "menu-setup"
      },
      {
        "label": "SPARQL Templates",
        "labelKey": "menu.sparql.template.label",
        "href": "sparql-templates",
        "order": 51,
        "parent": "Setup",
        "role": "IS_AUTHENTICATED_FULLY",
        "guideSelector": "sub-menu-sparql-templates"
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
        "guideSelector": "menu-setup"
      },
      {
        "label": "Help",
        "labelKey": "menu.help.label",
        "href": "#",
        "order": 8,
        "icon": "icon-help",
        "guideSelector": "menu-help"
      },
      {
        "label": "System information",
        "labelKey": "menu.system.information.label",
        "href": "sysinfo",
        "order": 50,
        "parent": "Help",
        "role": "ROLE_ADMIN",
        "guideSelector": "sub-menu-system-information"
      },
      {
        "label": "REST API",
        "labelKey": "menu.rest.api.label",
        "href": "webapi",
        "order": 1,
        "parent": "Help",
        "guideSelector": "sub-menu-rest-api"
      },
      {
        "label": "Documentation",
        "labelKey": "menu.documentation.label",
        "order": 2,
        "parent": "Help",
        "icon": "icon-external",
        "guideSelector": "sub-menu-documentation"
      },
      {
        "label": "Tutorials",
        "labelKey": "menu.tutorials.label",
        "order": 3,
        "parent": "Help",
        "icon": "icon-external",
        "guideSelector": "sub-menu-developer-hub"
      },
      {
        "label": "Support",
        "labelKey": "menu.support.label",
        "order": 4,
        "parent": "Help",
        "icon": "icon-external",
        "guideSelector": "sub-menu-support"
      }
    ]
  }
];
