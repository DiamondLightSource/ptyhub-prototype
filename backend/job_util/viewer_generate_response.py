from . import viewers, submission_manager


def get_viewer_endpoint_response_dict(job_id: str, standard_out_log: str, standard_err_log: str) -> dict:
    submitter = submission_manager.get_submission(job_id)
    viewer = viewers.get_viewer(submitter.submitter.parameter_tree_type)
    return viewer.get_viewer_data(job_id, standard_out_log, standard_err_log)
