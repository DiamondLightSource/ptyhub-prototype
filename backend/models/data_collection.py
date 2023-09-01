from pydantic import BaseModel


class DataCollection(BaseModel):
    visit: str
    scan_number: int
    timestamp: int


class ProcessedJob(BaseModel):
    id: int
    app: str
    start_timestamp: int
    end_timestamp: int
