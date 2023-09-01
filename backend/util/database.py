import contextlib
import contextvars
import sqlalchemy.orm
from util.session import _session as sqlsession

_session = contextvars.ContextVar("_session", default=None)


class Database:
    @classmethod
    def set_session(cls, session):
        _session.set(session)

    @property
    def session(cls) -> sqlalchemy.orm.Session:
        try:
            if _session.get() is None:
                raise AttributeError
            return _session.get()
        except (AttributeError, LookupError):
            raise Exception("Can't get session. Please call Database.set_session()")


db = Database()


@contextlib.contextmanager
def get_session() -> sqlalchemy.orm.Session:
    db_session = sqlsession()
    try:
        Database.set_session(db_session)
        yield db_session
    except Exception:
        db_session.rollback()
        raise
    finally:
        Database.set_session(None)
        db_session.close()
