# Developers Guide

## Extending the GraphDB Workbench



## Bundling

The workbench application consists of many resources: script files, stylesheets, images, fonts. In
a non optimized build this would lead to hundreds of http requests. Nowadays web applications are
usually optimized by bundling their resources and minifying them. The reason for this is to have 
significantly fewer http requests which leads to faster initial load and less traffic. 

Bundling of the workbench is done with webpack. It's configured with three config files:
* webpack.config.common.js
* webpack.config.dev.js
* webpack.config.prod.js

The common config contains shared configuration for the other two. 

There are two ways the application to be built. First is for production and the other is for dev. 
See the _Build_ and _Dev server_ sections above.

The code for production is build in in the `/dest` folder. The bundling covers the following
tasks:
* Processing the template.html and generating an index.html file. The file is also compressed and 
optimized. During the process, in the file are injected:
    * the favicon link pointing to the automatically copied icon image 
    * the bundled and compressed stylesheets
    
* Application code is bundled given it's entry point is the `/app.js` and is emitted in `/dest` in a 
bundle file named `bundle.[hash].js`. The hash is generated and applied in order to allow cache 
busting. Every change in the application code forces new hash to be generated thus forcing browsers 
to request the new bundle version. If the application code contains dynamic imports, webpack emits 
new bundle. This is the case for the `clustermanagement` module which is only imported if the 
workbench is loaded in enterprise mode.
* Vendor code is imported in a `vendor.[hash].js` and is bundled by the webpack. Here goes third 
party libraries like jquery, angularjs and third party libraries stylesheets.
* Some workbench application source files are imported in a separated file `main.js` which is 
bundled by the webpack and emitted as `main.[hash].js`. This is needed because importing them in the 
`app.js` breaks the bundle.
* Bundle files are injected during build time in the `index.html` at the end of the body tag.
* Th less stylesheets are processed with the `less-loader`, converted to javascript in the bundles
with `css-loader` and finally injected at the end of the head tag in `index.html`. Not injecting 
them during the build time would lead to unwanted showing the un-styled application until webpack 
injects them runtime.
* Many libraries such as `bootstrap` and `angular` depend on `jquery` to be loaded and present 
globally. That's why it is mandatory `jquery` to be properly pre-loaded and exposed in the global 
scope. This is done using the `expose-loader`. It ensures that when requested, it will be available 
for the libraries.
* Many resources like view and angular directive templates are directly copied in the `/dist` 
folder. Resources referenced from within those templates are also directly copied to allow proper
loading. The copying is done using the `CopyPlugin`.  
    * **An optimization would be to have separate bundle for every view. Then the main app bundle 
    would be much tinier thus even faster initial loading.**
    * **Another optimization is to have those templates emitted with a hash code in their names in
    order to prevent incorrect caching from browsers.**
    
* During the `template.html` processing, referenced images are automatically copied in the `/dist`
folder. The `file-loader` is used for the purpose.
* Resources referenced from stylesheets like images and fonts are copied in `/dist` folder using the
`url-loader`.
* The `/dist` directory is cleaned up before every build to prevent accumulating bundle files with
different hashes in their names.
