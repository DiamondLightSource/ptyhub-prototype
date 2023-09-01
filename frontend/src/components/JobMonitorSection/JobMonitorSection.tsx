import React, {
  useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { toast } from 'react-toastify';
import ExpandableSection from '../ExpandableSection/ExpandableSection';
import { JobsContext } from '../JobsContextProvider/JobsContextProvider';
import './JobMonitorSection.css';
import { JobSummaryResponse } from '../../network/models/JobSummaryResponse';
import CustomButton from '../CustomButton/CustomButton';
import { JobStatus } from '../../network/models/JobStatus';
import { JobTokenList } from '../../network/models/JobTokenList';
import Job from '../../classes/job';
import { JobsService } from '../../network/services/JobsService';

function JobMonitorSection() {
  const {
    jobs, setJobs, selectedJobId, setSelectedJobId,
  } = useContext(JobsContext);
  const jobsRef = useRef<Job[]>([]);
  const runningJobsSummaryRef = useRef<JobSummaryResponse[]>([]);
  const [runningJobSummaryState, setRunningJobSummaryState] = useState<JobSummaryResponse[]>([]);
  const fetchRunningJobSummaryTimeoutId = useRef<number | undefined>(undefined);
  const isFetchingRunningJobSummary = useRef<boolean>(false);
  const [jobsBeingStopped, setJobsBeingStopped] = useState<string[]>([]);

  const fetchRunningJobSummary = () => {
    isFetchingRunningJobSummary.current = true;
    JobsService.getJobs(
      {
        tokens: jobsRef.current.map((job) => job.accessToken),
      },
    ).then((jobsSummary) => {
      runningJobsSummaryRef.current = jobsSummary;
      setRunningJobSummaryState(jobsSummary);
    }).finally(() => {
      fetchRunningJobSummaryTimeoutId.current = window.setTimeout(fetchRunningJobSummary, 5000);
      isFetchingRunningJobSummary.current = false;
    });
  };

  const removeJob = (jobId: string) => {
    setSelectedJobId(undefined);
    setJobs(jobs.filter((job) => job.jobId !== jobId));
  };

  const removeAllJobs = () => {
    setSelectedJobId(undefined);
    setJobs([]);
  };

  const stopJobs = (jobsToDelete: Job[]) => {
    const deleteJobTokens: JobTokenList = {
      tokens: jobsToDelete.map((job) => job.accessToken),
    };

    const newStoppingJobIds = jobsToDelete.map((job) => job.jobId);
    setJobsBeingStopped((prev) => [...prev, ...newStoppingJobIds]);
    JobsService.deleteJobs(deleteJobTokens).catch((err) => {
      // If we got an error stopping, remove those jobs from the stopping jobs array
      setJobsBeingStopped(
        (prev) => prev.filter((stoppingJobId) => !newStoppingJobIds.includes(stoppingJobId)),
      );
      toast.error(`Failed to stop job: ${err}`);
    });
  };

  const stopJob = (jobId: string) => {
    const jobLocal = jobs.find((job) => job.jobId === jobId);
    if (jobLocal) {
      stopJobs([jobLocal]);
    } else {
      toast.error('Could not find the job selected for deletion locally, strange...');
    }
  };

  const stopAllJobs = () => {
    stopJobs(jobs);
  };

  useEffect(() => {
    jobsRef.current = jobs;

    if (fetchRunningJobSummaryTimeoutId.current) {
      window.clearTimeout(fetchRunningJobSummaryTimeoutId.current);
    }

    // Preventing 2 timeouts being set if jobs updates whilst
    // fetching new results
    if (!isFetchingRunningJobSummary.current) {
      fetchRunningJobSummary();
    }

    return () => {
      if (fetchRunningJobSummaryTimeoutId.current) {
        window.clearTimeout(fetchRunningJobSummaryTimeoutId.current);
      }
    };
  }, [jobs]);

  const jobTableElements = useMemo<JSX.Element[]>(() => jobs.map((localJob) => {
    const backendState = runningJobSummaryState.find(
      (summary) => summary.job_id === localJob.jobId,
    );
    const isSelectedJob = localJob.jobId === selectedJobId;

    let scanId = 'Loading...';
    let progressPercent = 'Loading...';
    let status = 'Loading...';
    let allowStop = false;

    if (backendState) {
      scanId = backendState.scan_id;
      progressPercent = `${backendState.progress_percent}%`;
      status = backendState.status;
      allowStop = status === JobStatus.RUNNING || status === JobStatus.QUEUED;
    }

    // If the stop button for this job has been pressed
    if (jobsBeingStopped.includes(localJob.jobId)
      && ![JobStatus.ABORTED, JobStatus.FAILED, JobStatus.STOPPED].map(String).includes(status)) {
      allowStop = false;
      status = 'Stopping...';
    }

    return (
      <tr
        className={`job-monitor-section__job-row ${isSelectedJob ? 'job-monitor-section__job-row--selected' : ''}`}
        key={localJob.jobId}
      >
        <td>{localJob.jobId}</td>
        <td>{scanId}</td>
        <td>{progressPercent}</td>
        <td>{status}</td>
        <td>
          <CustomButton text="View" onClick={() => setSelectedJobId(localJob.jobId)} />
        </td>
        <td>
          <CustomButton
            text="Remove job"
            onClick={() => {
              removeJob(localJob.jobId);
            }}
          />
        </td>
        <td>
          {
            allowStop && (
              <CustomButton
                text="Stop job"
                onClick={() => {
                  stopJob(localJob.jobId);
                }}
              />
            )
          }
        </td>
      </tr>
    );
  }), [runningJobSummaryState, jobs, selectedJobId, jobsBeingStopped]);

  return (
    <ExpandableSection title="Job monitor">
      <table className="job-monitor-section__job-table">
        <thead>
          <tr className="job-monitor-section__header-row">
            <th>Job ID</th>
            <th>Scan ID</th>
            <th>Progress</th>
            <th>Status</th>
            <th>View Job</th>
            <th>
              <CustomButton
                onClick={removeAllJobs}
                text="Remove all jobs"
              />
            </th>
            <th>
              <CustomButton
                onClick={stopAllJobs}
                text="Stop all jobs"
              />
            </th>
          </tr>
        </thead>

        <tbody>
          {jobTableElements}
        </tbody>
      </table>

      {
        // Display a message if the user has not submitted a job yet
        // to avoid confusion
        jobTableElements.length === 0 && (
          <span>🛸 No jobs here yet, try submitting one</span>
        )
      }
    </ExpandableSection>
  );
}

export default JobMonitorSection;
