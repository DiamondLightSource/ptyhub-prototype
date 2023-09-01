import React, {
  createContext, useEffect, useMemo, useRef, useState,
} from 'react';
import Job from '../../classes/job';
import { JobStatusResponse } from '../../network/models/JobStatusResponse';
import useSelectedJob from '../../hooks/useSelectedJob';
import { ReconstructionViewerResponse } from '../../network/models/ReconstructionViewerResponse';
import { JobsService } from '../../network/services/JobsService';

type CurrentJobStatusContextType = {
  currentJobStatus: JobStatusResponse,
  updatedAt: Date,
};

export const CurrentJobStatusContext = createContext<
CurrentJobStatusContextType | undefined
>(undefined);

type Props = {
  children: React.ReactNode
};

function CurrentJobStatusContextProvider({ children }: Props) {
  const [jobStatusesCache, setJobStatusesCache] = useState<
  { [jobId: string]: CurrentJobStatusContextType }
  >({});

  const finishedJobIdsRef = useRef<Set<string>>(new Set());

  const isFetchingStatus = useRef<boolean>(false);
  const updateIntervalIdRef = React.useRef<number | null>(null);

  const selectedJob = useSelectedJob();
  const selectedJobRef = useRef<Job | undefined>(undefined);

  const contextValue = useMemo<CurrentJobStatusContextType | undefined>(() => {
    if (!selectedJob?.jobId) {
      return undefined;
    }

    if (!(selectedJob.jobId in jobStatusesCache)) {
      return undefined;
    }

    return jobStatusesCache[selectedJob.jobId];
  }, [selectedJob, jobStatusesCache]);

  const resetUpdateStatusInterval = () => {
    if (updateIntervalIdRef.current) {
      window.clearTimeout(updateIntervalIdRef.current);
    }

    if (!isFetchingStatus.current) {
      updateIntervalIdRef.current = window.setTimeout(
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        updateStatus,
        updateIntervalIdRef.current ? 5000 : 0, // If no update interval is set, call right away
      );
    }
  };

  // Getting status ever 5s
  const updateStatus = () => {
    if (!selectedJobRef.current || !selectedJobRef.current.accessToken) {
      resetUpdateStatusInterval();
      return;
    }

    const currentJob: Job = selectedJobRef.current;

    // Don't fetch if the reconstruction is finished
    if (currentJob && finishedJobIdsRef.current.has(currentJob.jobId)) {
      resetUpdateStatusInterval();
      return;
    }

    isFetchingStatus.current = true;
    JobsService.getJobStatus(selectedJobRef.current.accessToken).then((jobStatus) => {
      setJobStatusesCache((prev) => {
        let newReconstruction: ReconstructionViewerResponse | undefined = jobStatus.reconstruction;

        // If the backend does not provide us with reconstruction data, but we have a
        // reconstruction in cache, use the one in cache instead
        if (typeof newReconstruction === 'undefined' && currentJob.jobId in prev) {
          newReconstruction = prev[currentJob.jobId].currentJobStatus.reconstruction;
        }

        return {
          ...prev,
          [currentJob.jobId]: {
            currentJobStatus: {
              reconstruction: newReconstruction,
              logs: jobStatus.logs,
            },
            updatedAt: new Date(),
          },
        };
      });

      if (jobStatus.reconstruction?.is_finished) {
        finishedJobIdsRef.current.add(currentJob.jobId);
      }
    }).finally(() => {
      isFetchingStatus.current = false;
      resetUpdateStatusInterval();
    });
  };

  useEffect(() => {
    selectedJobRef.current = selectedJob;

    // When the active selected job changes, we immediately want to update
    // the log, not wait until the next timeout call
    if (updateIntervalIdRef.current) {
      window.clearTimeout(updateIntervalIdRef.current);
      updateIntervalIdRef.current = null;
    }
    resetUpdateStatusInterval();
  }, [selectedJob]);

  useEffect(() => () => {
    if (updateIntervalIdRef.current) {
      window.clearTimeout(updateIntervalIdRef.current);
    }
  }, []);

  return (
    <CurrentJobStatusContext.Provider value={contextValue}>
      {children}
    </CurrentJobStatusContext.Provider>
  );
}

export default CurrentJobStatusContextProvider;
