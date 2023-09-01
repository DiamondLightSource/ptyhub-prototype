import threading

from ptypy.utils import Param, PlotClient
from job_util import submission_manager

# Job ID: Plot Client
_plot_client_tracker = {}
_finished_job_ids = set()
_finished_jobs_lock = threading.Lock()
_plot_client_tracker_lock = threading.Lock()


class PlotClientNotFound(Exception):
    pass


class ClusterJobNotStarted(Exception):
    pass


class ClusterJobFinished(Exception):
    pass


class NoReconstructionData(Exception):
    pass


class TimeoutablePlotClient(PlotClient):
    def __init__(self, job_id, timeout=300, client_pars=None, in_thread=False):
        super().__init__(client_pars=client_pars, in_thread=in_thread)
        self._timeout = timeout
        self.job_id = job_id

    def _loop(self):
        # Patching plot client loop to add timeout
        self._connect()

        self._initialize()
        while not self._stopping:
            self._request_data()
            new_message_received = self.client.wait(timeout=self._timeout)  # false if timeout

            if new_message_received:
                self._store_data()
            else:
                # Job has probably crashed
                self._stopping = True

        self.disconnect()
        self._has_stopped = True

        # Removing from tracker
        with _plot_client_tracker_lock:
            del _plot_client_tracker[self.job_id]
        with _finished_jobs_lock:
            _finished_job_ids.add(self.job_id)


def get_plot_client(job_id: str, attempt_to_create=True):
    with _finished_jobs_lock:
        if job_id in _finished_job_ids:
            raise ClusterJobFinished()

    with _plot_client_tracker_lock:
        not_tracking_job = job_id not in _plot_client_tracker

    if not_tracking_job:
        # There is not a scanner running for this job
        if not attempt_to_create:
            raise PlotClientNotFound(f"Plot client for job {job_id} not found")

        # Attempt to get the submitter for the job
        submitter = submission_manager.get_submission(job_id).ptydls_submission

        # Attempting to get IP and port of scanner
        try:
            plot_client_address_dict = submitter.rinfo.plot_remote_addr
            plot_client_port_dict = submitter.rinfo.plot_remote_port
        except:
            raise ClusterJobNotStarted()

        if None in [plot_client_address_dict, plot_client_port_dict]:
            raise ClusterJobNotStarted()

        number_of_addresses = len(list(plot_client_address_dict.values()))
        number_of_ports = len(list(plot_client_port_dict.values()))

        if 0 in [number_of_addresses, number_of_ports]:
            raise ClusterJobNotStarted()

        if job_id not in plot_client_address_dict or job_id not in plot_client_port_dict:
            raise ValueError(f"Could not find IP or port for job {job_id} in submitter")

        plot_client_address = plot_client_address_dict[job_id]
        plot_client_port = plot_client_port_dict[job_id]

        if None in [plot_client_address, plot_client_port]:
            raise ClusterJobNotStarted()

        # We have an IP and port, so we can create a plot client

        pc_config = Param(
            address=plot_client_address,
            port=plot_client_port
        )

        pc = TimeoutablePlotClient(job_id, client_pars=pc_config, in_thread=False)
        pc.start()
        pc.runtime["iter_info"] = []

        # Add to tracker
        set_plot_client(job_id, pc)

    return _plot_client_tracker[job_id]


def set_plot_client(job_id: str, plot_client) -> None:
    if job_id in _plot_client_tracker:
        # There is already a plot client running for this job
        # We should stop it
        _plot_client_tracker[job_id].stop()
    _plot_client_tracker[job_id] = plot_client
