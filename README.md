>[!NOTE]
> This was an early prototype developed by [Thomas Milburn](https://github.com/thomas-milburn). The production version of **PtyHub** can be found at [https://github.com/DiamondLightSource/ptyhub](https://github.com/DiamondLightSource/ptyhub).

# PtyHub Prototype

A web-based [ptychography](https://en.wikipedia.org/wiki/Ptychography) configuration editor, job submitter, and reconstruction viewer.

## Overview


PtyHub provides a web-based interface for configuring ptychography jobs, submitting
jobs to a cluster, and viewing the results in real-time.

PtyHub was coded specifically for [Diamond Light Source](diamond.ac.uk/), however, with some tinkering it should be able to be modified to work elsewhere. If you are serious about this, please review the [contact](#contact) section below.

PtyHub can be run in 2 different modes, local mode and deployment mode. In local mode, the frontend and backend run on the same machine. The frontend is then accessed via localhost. In this mode, connections from elsewhere are disabled for security reasons. Both PtyRex and [PtyPy](https://ptycho.github.io/ptypy/) are supported in this mode. In deployment mode, the backend is assumed to be running on a server and connections are allowed from external sources, enabling remote access and interaction with the application. In this mode authentication is required. Only [PtyPy](https://ptycho.github.io/ptypy/) is supported in this mode. You can toggle between the two modes by setting the env variable `PTYHUB_DEPLOYMENT` to either `true` or `false`.

The repository contains two folders
- **@ptyhub/frontend** - a React app that containing the web interface.
- **@ptyhub/backend** - a Python package coded using
  [FastAPI](https://fastapi.tiangolo.com/) that provides a REST API for all the functions of the frontend

## UI Preview

![An annotated preview of the UI running in local mode](https://i.imgur.com/WtNXrBM.png) 
 ## Contact
 If you have any questions about the project or wish to try and set it up for yourself, please contact [Benedikt Daurer](mailto:benedikt.daurer@diamond.ac.uk?subject=PtyHub).
