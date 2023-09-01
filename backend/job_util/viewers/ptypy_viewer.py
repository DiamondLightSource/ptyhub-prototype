from .base_viewer import BaseViewer
import os.path

from ptydls.cluster.scheduler import JobStatus

import job_util.scan_data_manipulator as data_manipulator
from job_util import normalization, plot_client_manager, submission_manager
import ptypy

DOWN_SAMPLING_REMAINING_PIXELS = 150000


class PtyPyViewer(BaseViewer):
    @staticmethod
    def get_viewer_data(job_id: str, standard_out_log: str, standard_err_log: str) -> dict:
        data_is_from_file = False
        try:
            plot_client = plot_client_manager.get_plot_client(job_id, attempt_to_create=True)
            probe_dict, object_dict, meta_dict = plot_client.get_data()
        except plot_client_manager.ClusterJobFinished:
            print("Cluster job finished! Getting from file")
            # If the job has finished, we should return from the file
            submitter = submission_manager.get_submission(job_id)
            if not os.path.exists(submitter.submitter.get_final_output_file_path()):
                raise plot_client_manager.ClusterJobFinished()

            # Getting job status
            task_id = int(job_id.split(".")[1]) if "." in job_id else None
            job_status = submitter.ptydls_submission.rinfo.cluster.job_status(task_id)

            # Making sure that the job is not still running as this indicates we are still writing to the file
            if job_status in [JobStatus.QUEUED, JobStatus.RUNNING]:
                raise plot_client_manager.ClusterJobFinished()

            ptypy_file_data = ptypy.io.h5read(submitter.submitter.get_final_output_file_path(), "content")["content"]
            print("finished reading")
            probe_dict = ptypy_file_data.probe
            object_dict = ptypy_file_data.obj
            meta_dict = ptypy_file_data.runtime

            data_is_from_file = True

        scan_names = list(probe_dict.keys())

        if len(scan_names) == 0:
            # No scans yet
            raise plot_client_manager.NoReconstructionData()

        scan_name = scan_names[0]

        probe_scan = probe_dict.get(scan_name)
        object_scan = object_dict.get(scan_name)

        if "data" not in probe_scan or "data" not in object_scan:
            raise plot_client_manager.NoReconstructionData()

        probe_data = data_manipulator.ScanData(probe_scan.get("data")[0])
        object_data = data_manipulator.ScanData(object_scan.get("data")[0])
        graph_normalised = normalization.normalize_graph(meta_dict)

        # Down sampling data
        probe_data.down_sample(remaining_pixels=DOWN_SAMPLING_REMAINING_PIXELS)
        object_data.down_sample(remaining_pixels=DOWN_SAMPLING_REMAINING_PIXELS)

        p_size_key = "_psize" if data_is_from_file else "psize"

        # We are using dicts instead of models because pydamic models are slow with such large amounts of data
        return {
            "probe": {
                **probe_data.to_dict(),
                **{
                    "pixel_size": probe_scan.get(p_size_key, 0.0)[0].astype(float) / probe_data.zoom_scale_factor
                }
            },
            "object": {
                **object_data.to_dict(),
                **{
                    "pixel_size": object_scan.get(p_size_key, 0.0)[0].astype(float) / object_data.zoom_scale_factor
                }
            },
            "graph": graph_normalised,
            "is_finished": data_is_from_file
        }
