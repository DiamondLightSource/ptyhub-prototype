from pydantic import BaseModel


class ClusterConfig(BaseModel):
    beamline: str
    cluster_queue: str
    total_processes: int
    gpu_arch: str
