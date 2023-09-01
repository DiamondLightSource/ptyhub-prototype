from pydantic import BaseModel
from typing import List


class DirectoryEntry(BaseModel):
    name: str
    is_dir: bool


class Directory(BaseModel):
    path: str
    entries: List[DirectoryEntry]


class FileWrite(BaseModel):
    path: str
    content: str


class DirectoryCreate(BaseModel):
    path: str


class FileRead(BaseModel):
    path: str
    content: str
