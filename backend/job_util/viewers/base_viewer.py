from abc import ABC, abstractmethod


class BaseViewer(ABC):
    @staticmethod
    @abstractmethod
    # Generate a dictionary of data to be displayed in the viewer
    # Actually of type ReconstructionViewerResponse, but we use a dict to stop
    # pydantic from checking the types that takes a lot of time
    def get_viewer_data(job_id: str, standard_out_log: str, standard_err_log: str) -> dict:
        pass
