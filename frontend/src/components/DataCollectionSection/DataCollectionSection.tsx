import React, {
  useContext, useMemo, useEffect, useState,
} from 'react';
import { toast } from 'react-toastify';
import { DCIDInfoContext } from '../DCIDContextProvider/DCIDContextProvider';
import ExpandableSection from '../ExpandableSection/ExpandableSection';
import DataCollectionLabel from '../DataCollectionLabel/DataCollectionLabel';
import './DataCollectionSection.css';
import {
  DataCollection, DataCollectionService, ProcessedJob, ProcessedJobService,
} from '../../network';
import { formatTimeFull, formatTimeShort } from '../../util/timeUtil';
import CustomButton from '../CustomButton/CustomButton';
import { loadParameterTreeFromFile } from '../../util/paramTreeUtil';
import {
  JobConfigurationContext,
  JobConfigurationContextType,
} from '../JobConfigurationContextProvider/JobConfigurationContextProvider';

function DataCollectionSection() {
  const [dataCollectionInfo, setDataCollectionInfo] = useState<DataCollection | null>(null);
  const [processedJobsInfo, setProcessedJobsInfo] = useState<ProcessedJob[]>([]);

  const {
    dcid,
  } = useContext(DCIDInfoContext);

  const {
    selectedParameterTreeStructure,
    setParameterTreeData,
    setExtraOptions,
    setSelectedParamIdPath,
  } = useContext<JobConfigurationContextType>(JobConfigurationContext);

  const loadConfig = (processedJobId: number) => {
    ProcessedJobService.getProcessedJobConfig(processedJobId).then((res) => {
      const file = new File([res], '');
      loadParameterTreeFromFile(
        file,
        selectedParameterTreeStructure,
        setSelectedParamIdPath,
        setExtraOptions,
        setParameterTreeData,
      );

      toast.success('Config file loaded');
    }).catch((err) => {
      toast.error(`Failed to load config file: ${err}`);
    });
  };

  const viewOutput = (processedJobId: number) => {
    console.log('Viewing output file...');
    console.log(processedJobId);
  };

  const viewLog = (processedJobId: number) => {
    console.log('Viewing log file...');
    console.log(processedJobId);
  };

  useEffect(() => {
    DataCollectionService.getDataCollection(dcid).then((dataCollection) => {
      setDataCollectionInfo(dataCollection);
    });

    DataCollectionService.getProcessedJobs(dcid).then((processedJobs) => {
      setProcessedJobsInfo(processedJobs);
    });
  }, []);

  const procJobsTableElements = useMemo<JSX.Element[]>(() => processedJobsInfo.map((procJob) => (
    <tr
      className="data-collection-section__proc-jobs-row"
      key={procJob.start_timestamp}
    >
      <td>{procJob.app}</td>
      <td>{formatTimeShort(procJob.start_timestamp)}</td>
      <td>{formatTimeShort(procJob.end_timestamp)}</td>
      <td>
        <CustomButton
          text="Load"
          onClick={() => loadConfig(procJob.id)}
        />
      </td>
      <td>
        <CustomButton
          text="View"
          onClick={() => viewOutput(procJob.id)}
        />
      </td>
      <td>
        <CustomButton
          text="View"
          onClick={() => viewLog(procJob.id)}
        />
      </td>
    </tr>
  )), [processedJobsInfo]);

  return (
    <ExpandableSection title="Data Collection" disableCollapse>
      {
        dataCollectionInfo !== null ? ( // Only shows once all info is fetched from backend
          <div className="data-collection-section__labels">
            <DataCollectionLabel name="Scan number" value={dataCollectionInfo.scan_number} />
            <DataCollectionLabel name="Visit" value={dataCollectionInfo.visit} />
            <DataCollectionLabel name="Data was collected on" value={formatTimeFull(dataCollectionInfo.timestamp)} />
          </div>
        ) : 'Loading...'
      }

      <div>
        <table className="data-collection-section__proc-jobs-table">
          <thead>
            <tr className="data-collection-section__proc-jobs-header-row">
              <th>App</th>
              <th>Start time</th>
              <th>End time</th>
              <th>Config</th>
              <th>Output</th>
              <th>Log</th>
            </tr>
          </thead>
          <tbody>
            {processedJobsInfo !== null ? procJobsTableElements : 'Loading...'}
          </tbody>
        </table>
      </div>
    </ExpandableSection>
  );
}

export default DataCollectionSection;
