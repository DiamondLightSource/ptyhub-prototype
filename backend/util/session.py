from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from util.config import config

engine = create_engine(
    url=config["PTYHUB_SQL_DATABASE_URL"],
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20,
)

_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
