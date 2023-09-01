import os
from dotenv import dotenv_values

path_to_this_dir = os.path.dirname(os.path.abspath(__file__))

_default_values = {
    "PTYHUB_PTYDLS_DEPLOYMENT_WRAPPER_PATH": "/dls_sw/apps/ptyhub/wrappers/ptypy_wrapper.py"
}

config = {
    **_default_values,
    **dotenv_values(os.path.join(path_to_this_dir, "../.env")),  # load shared development variables
    **dotenv_values(os.path.join(path_to_this_dir, "../.env.secret")),  # load secret variables
    **dotenv_values(os.path.join(path_to_this_dir, "../.env.local")),  # load development variables
    **os.environ,  # override loaded values with environment variables
}
