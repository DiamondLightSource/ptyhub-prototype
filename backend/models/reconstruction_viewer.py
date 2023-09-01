from pydantic import BaseModel
from typing import List


class ReconstructionViewerAccessToken(BaseModel):
    job_id: str


class GraphData(BaseModel):
    fmag: List[int]
    phot: List[int]
    ex: List[int]
    iteration_numbers: List[int]


class ScanData(BaseModel):
    real: List[List[float]]
    imaginary: List[List[float]]
    pixel_size: float


class ReconstructionViewerResponse(BaseModel):
    probe: ScanData
    object: ScanData
    graph: GraphData
    is_finished: bool
