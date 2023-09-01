import React, {
  createContext, useMemo, useState, useEffect,
} from 'react';
import Job from '../../classes/job';

type JobsContextType = {
  jobs: Job[];
  setJobs: (newJobs: Job[]) => void;
  selectedJobId?: string;
  setSelectedJobId: (newJob: string | undefined) => void;
};

export const JobsContext = createContext<JobsContextType>({
  jobs: [],
  setJobs: () => {},
  selectedJobId: undefined,
  setSelectedJobId: () => {},
});

type Props = {
  children: React.ReactNode
};

function JobsContextProvider({ children }: Props) {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const storedJobs = localStorage.getItem('jobs');
    return storedJobs ? JSON.parse(storedJobs).map(Job.fromJSON) : [];
  });
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);

  // Save to local storage whenever jobs change
  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs.map((job) => job.toJSON())));
  }, [jobs]);

  const contextValue = useMemo<JobsContextType>(() => ({
    jobs,
    setJobs,
    selectedJobId,
    setSelectedJobId,
  }), [jobs, selectedJobId]);

  return (
    <JobsContext.Provider value={contextValue}>
      {children}
    </JobsContext.Provider>
  );
}

export default JobsContextProvider;
