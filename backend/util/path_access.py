import os

ROOT_DIR_WHITELISTED_FOLDERS = ["/", "/dls", "/home"]


def normalise_path(path: str):
    """Normalise a path to remove any double slashes, etc."""
    if not path.startswith("/"):
        path = "/" + path

    return os.path.realpath(path)


def is_allowed_to_access(path: str):
    # Preventing vulnerability of /dls/../<whatever here>
    path = normalise_path(path)
    file_path_parts = path.split(os.sep)
    if len(file_path_parts) < 2:
        return False

    root_path = "/".join(file_path_parts[:2])

    if root_path not in ROOT_DIR_WHITELISTED_FOLDERS:
        return False

    return True
