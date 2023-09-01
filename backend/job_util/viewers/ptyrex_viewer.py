import os

from ptydls.cluster.scheduler import JobStatus

from .base_viewer import BaseViewer
import numpy as np
import h5py

from .. import submission_manager, plot_client_manager, scan_data_manipulator

DOWN_SAMPLING_REMAINING_PIXELS = 150000
SEARCH_FOR_STRING = "Saving current state of reconstruction:\n"


class PtyRexViewer(BaseViewer):
    @staticmethod
    def get_viewer_data(job_id: str, standard_out_log: str, standard_err_log: str) -> dict:
        if SEARCH_FOR_STRING not in standard_out_log:
            # Could not find search string in standard out log, probably means it hasn't been outputted yet
            # We raise ClusterJobFinished as the frontend understands this as we don't have any info right now
            raise plot_client_manager.ClusterJobFinished()

        output_file = standard_out_log.split(SEARCH_FOR_STRING)[-1].split("\n")[0]
        print(f"Output file found: {output_file}")

        if not os.path.exists(output_file):
            raise plot_client_manager.ClusterJobFinished()

        submitter = submission_manager.get_submission(job_id)

        # Getting job status
        task_id = int(job_id.split(".")[1]) if "." in job_id else None
        job_status = submitter.ptydls_submission.rinfo.cluster.job_status(task_id)

        # Making sure that the job is not still running as this indicates we are still writing to the file
        if job_status in [JobStatus.QUEUED, JobStatus.RUNNING]:
            raise plot_client_manager.ClusterJobFinished()

        with h5py.File(output_file, 'r') as f:
            probe_modulus = np.squeeze(f['/entry_1/process_1/output_1/probe_modulus'][..., 0, :, :])
            probe_phase = np.squeeze(f['/entry_1/process_1/output_1/probe_phase'][..., 0, :, :])
            object_modulus = np.squeeze(f['/entry_1/process_1/output_1/object_modulus'][..., 0, :, :])
            object_phase = np.squeeze(f['/entry_1/process_1/output_1/object_phase'][..., 0, :, :])

            error = f['/entry_1/process_1/output_1/error'][()]
            pixel_size = f['/entry_1/process_1/common_1/dx'][()]

        probe_complex = probe_modulus * np.exp(1j * probe_phase)
        object_complex = object_modulus * np.exp(1j * object_phase)

        probe_scan_data = scan_data_manipulator.ScanData(probe_complex)
        object_scan_data = scan_data_manipulator.ScanData(object_complex)

        # Down sampling data
        probe_scan_data.down_sample(remaining_pixels=DOWN_SAMPLING_REMAINING_PIXELS)
        object_scan_data.down_sample(remaining_pixels=DOWN_SAMPLING_REMAINING_PIXELS)

        error_max = np.max(error)
        normalised_graph_points = (error / error_max).tolist()

        graph_data = {
            "fmag": normalised_graph_points,
            "phot": normalised_graph_points,
            "ex": normalised_graph_points,
            "iteration_numbers": list(range(1, len(normalised_graph_points) + 1))
        }

        original_pixel_size = pixel_size[0, 0].astype(float)

        # We are using dicts instead of models because pydamic models are slow with such large amounts of data
        return {
            "probe": {
                **probe_scan_data.to_dict(),
                **{
                    "pixel_size": original_pixel_size / probe_scan_data.zoom_scale_factor
                }
            },
            "object": {
                **object_scan_data.to_dict(),
                **{
                    "pixel_size": original_pixel_size / object_scan_data.zoom_scale_factor
                }
            },
            "graph": graph_data,
            "is_finished": True
        }
