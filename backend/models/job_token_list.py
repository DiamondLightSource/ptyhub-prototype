from typing import List

from pydantic import BaseModel


class JobTokenList(BaseModel):
    tokens: List[str]
