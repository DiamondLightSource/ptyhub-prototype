# PtyHub

A web-based ptychography configuration editor, job submitter, and reconstruction viewer.

## Overview

PtyHub provides a web-based interface for configuring PtyPy jobs, submitting
jobs to a cluster, and viewing the results in real-time.

- **@ptyhub/frontend** - a React app that containing the web interface.
- **@ptyhub/backend** - a Python package coded using
  [FastAPI](https://fastapi.tiangolo.com/) that provides a REST API for all the functions of the frontend
