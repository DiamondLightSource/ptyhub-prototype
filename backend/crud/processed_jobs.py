from pathlib import Path

from ispyb.sqlalchemy import AutoProcProgram

from util.database import db, get_session


def get_proc_job(proc_job_id: int):
    return db.session.query(AutoProcProgram).filter(AutoProcProgram.processingJobId == proc_job_id).first()


def get_proc_job_with_exception(proc_job_id: int):
    return db.session.query(AutoProcProgram).filter(AutoProcProgram.processingJobId == proc_job_id).one()


def get_proc_job_log_file_path(proc_job_id: int) -> Path:
    ap = get_proc_job_with_exception(proc_job_id)
    return Path(ap.AutoProcProgramAttachments[0].filePath, ap.AutoProcProgramAttachments[0].fileName)


def get_proc_job_output_file_path(proc_job_id: int) -> Path:
    ap = get_proc_job_with_exception(proc_job_id)
    return Path(ap.AutoProcProgramAttachments[1].filePath, ap.AutoProcProgramAttachments[1].fileName)


def get_proc_job_config_file_path(proc_job_id: int) -> Path:
    ap = get_proc_job_with_exception(proc_job_id)
    return Path(ap.AutoProcProgramAttachments[1].filePath, "ptypy_live.yaml")


if __name__ == "__main__":
    with get_session():
        proc_job = get_proc_job(165351157)
        print(proc_job)
