# onto-reactodia-graph



<!-- Auto Generated Below -->


## Overview

A web component that renders a graph with the Reactodia workspace.

The component is backed by a SPARQL endpoint but is endpoint-agnostic: the host passes
the active repository's endpoint via `current-repository` and a `queryFunction` that
performs the actual HTTP request. Reactodia fetches all node, link and type data lazily
through them; the canvas starts empty and the user populates it via the search bar.

This is a proof of concept; the component and its Reactodia wrapper are written so
they can later be extracted into a standalone package and consumed here as an NPM
dependency.

## Properties

| Property            | Attribute            | Description                                                                                                                                                                                                                                                                                                                     | Type                                                                                                                                           | Default     |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `currentRepository` | `current-repository` | The active repository id. Bound as a plain HTML attribute and surfaced to {@link queryFunction} as the request `url`; changing it re-points the graph at the new repository (and resets the canvas), which is how runtime repository changes are handled.                                                                       | `string`                                                                                                                                       | `undefined` |
| `language`          | `language`           | UI language code (e.g. `en`, `fr`) for the Reactodia interface and the initial graph-data labels. Defaults to English. Reactodia bakes the translation bundle into the workspace when it is constructed and never re-reads it, so switching languages requires rebuilding the React tree; the watcher below remounts on change. | `string`                                                                                                                                       | `'en'`      |
| `queryFunction`     | `query-function`     | HTTP transport for the SPARQL requests. A DOM property (not an attribute, since it is a function) set by the host so requests go through the host's HTTP layer (auth, interceptors) instead of a built-in `fetch`. Keeping it injectable preserves portability.                                                                 | `(params: { url: string; body?: string; headers: { [header: string]: string; }; method: string; signal?: AbortSignal; }) => Promise<Response>` | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
