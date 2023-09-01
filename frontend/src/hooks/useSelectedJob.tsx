import { useContext, useMemo } from 'react';
import Job from '../classes/job';
import { JobsContext } from '../components/JobsContextProvider/JobsContextProvider';

const useSelectedJob = (): Job | undefined => {
  const { jobs, selectedJobId } = useContext(JobsContext);

  return useMemo(() => jobs.find((job) => job.jobId === selectedJobId), [jobs, selectedJobId]);
};

export default useSelectedJob;
