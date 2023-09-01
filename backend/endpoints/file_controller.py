from fastapi import APIRouter, HTTPException
from models import file_controller as file_controller_model, util as util_model
import os
from util import path_access, deployment_restrictions

file_controller_router = APIRouter(prefix="/file-controller", tags=["File Controller"])


@file_controller_router.get("/directory",
                            response_model=file_controller_model.Directory,
                            operation_id="get_directory_content")
@deployment_restrictions.restrict_endpoint(allow_local=True)
def get_directory(path: str):
    # Always from root
    path = path_access.normalise_path(path)

    if not path_access.is_allowed_to_access(path):
        raise HTTPException(401, "No permission to access this path")

    try:
        real_directory_entries = os.listdir(path)
    except PermissionError:
        raise HTTPException(401, "Server has no permission to access this path")
    except FileNotFoundError:
        raise HTTPException(404, "Path not found")
    directory_entries = []
    for entry in real_directory_entries:
        if not path_access.is_allowed_to_access(os.path.join(path, entry)):
            continue

        directory_entries.append(
            file_controller_model.DirectoryEntry(
                name=entry,
                is_dir=os.path.isdir(os.path.join(path, entry))
            )
        )

    return file_controller_model.Directory(path=os.path.realpath(path), entries=directory_entries)


@file_controller_router.post("/file", response_model=util_model.Success, operation_id="write_to_file")
@deployment_restrictions.restrict_endpoint(allow_local=True)
def write_to_file(data: file_controller_model.FileWrite):
    path = path_access.normalise_path(data.path)

    if not path_access.is_allowed_to_access(path):
        raise HTTPException(401, "No permission to access this path")

    try:
        with open(path, "w") as file:
            file.write(data.content)
    except PermissionError:
        raise HTTPException(401, "Server has no permission to access this path")
    except FileNotFoundError:
        raise HTTPException(404, "Path not found")

    return util_model.Success(success=True)


@file_controller_router.post("/create-directory", response_model=util_model.Success, operation_id="create_directory")
@deployment_restrictions.restrict_endpoint(allow_local=True)
def create_directory(data: file_controller_model.DirectoryCreate):
    path = path_access.normalise_path(data.path)

    if not path_access.is_allowed_to_access(path):
        raise HTTPException(401, "No permission to access this path")

    try:
        os.mkdir(path)
    except PermissionError:
        raise HTTPException(401, "Server has no permission to access this path")
    except FileNotFoundError:
        raise HTTPException(404, "Path not found")

    return util_model.Success(success=True)


@file_controller_router.get("/file", response_model=file_controller_model.FileRead, operation_id="read_file")
@deployment_restrictions.restrict_endpoint(allow_local=True)
def read_file(path: str):
    path = path_access.normalise_path(path)

    if not path_access.is_allowed_to_access(path):
        raise HTTPException(401, "No permission to access this path")

    try:
        with open(path, "r") as file:
            content = file.read()
    except PermissionError:
        raise HTTPException(401, "Server has no permission to access this path")
    except FileNotFoundError:
        raise HTTPException(404, "Path not found")

    return file_controller_model.FileRead(path=os.path.realpath(path), content=content)
