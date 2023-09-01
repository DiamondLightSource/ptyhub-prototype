import fastapi.openapi.utils
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from endpoints import parameter_tree, file_controller, jobs, auth_endpoints, system_setup, data_collection, \
    processed_job
from util import deployment_restrictions

app = fastapi.FastAPI()
origins = []

# Allowing access to API from external sources while in development
if deployment_restrictions.is_allow_external_ip_in_local_mode():
    import socket

    # Fetching local IP address to allow CORS
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)

    # Allowing access to API from external sources while in development
    # This is to allow the development frontend which is running on a different port to access the API
    # Do not use this in production
    origins.append(f"http://{local_ip}:3000")

if deployment_restrictions.is_local() and not deployment_restrictions.is_allow_external_ip_in_local_mode():
    # If we are not in development mode, we only allow access from localhost
    app.add_middleware(deployment_restrictions.RestrictToLocalhostMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adding GZip compression to responses
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)

# Setting up our endpoints
router = fastapi.APIRouter(prefix="/api")
router.include_router(jobs.jobs_router)
router.include_router(file_controller.file_controller_router)
router.include_router(parameter_tree.parameter_tree_router)
router.include_router(auth_endpoints.auth_router)
router.include_router(system_setup.system_setup_router)
router.include_router(data_collection.data_collection_router)
router.include_router(processed_job.processed_job_router)

app.include_router(router)
