import re

from ispyb.sqlalchemy import AutoProcProgram
from ispyb.sqlalchemy import DataCollection, ProcessingJob

from util.database import db, get_session
import typing
from models import data_collection as dc_model


def get_data_collection_response(data_collection_id: int) -> dc_model.DataCollection:
    dc = get_data_collection_exception(data_collection_id)

    visit = dc.imageDirectory.split("/")[5]
    scan = re.match(r'.*-(\d+)$', dc.fileTemplate.split(".")[0]).group(1)
    timestamp = int(dc.startTime.timestamp())

    return dc_model.DataCollection(visit=visit, scan_number=scan, timestamp=timestamp)


def get_proc_jobs_response(data_collection_id: int) -> typing.List[dc_model.ProcessedJob]:
    proc_jobs = []
    prjs = db.session.query(ProcessingJob).filter(ProcessingJob.dataCollectionId == data_collection_id).all()
    for pj in prjs:
        ap = db.session.query(AutoProcProgram).filter(AutoProcProgram.processingJobId == pj.processingJobId).first()

        proc_jobs.append(
            dc_model.ProcessedJob(
                id=pj.processingJobId,
                app=pj.displayName.split(" ")[0],
                start_timestamp=int(ap.processingStartTime.timestamp()),
                end_timestamp=int(ap.processingEndTime.timestamp())
            )
        )

    return proc_jobs


def get_data_collection_exception(data_collection_id: int) -> DataCollection:
    return db.session.query(DataCollection).filter(DataCollection.dataCollectionId == data_collection_id).one()


def _test():
    with get_session():
        data_collection_id = 10216847
        collection = get_data_collection_exception(data_collection_id)
        print(collection)

if __name__ == "__main__":
    _test()
