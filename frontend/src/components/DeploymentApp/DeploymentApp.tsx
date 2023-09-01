import React from 'react';
import { useParams } from 'react-router-dom';
import FindOnSyncWebForm from '../FindOnSyncWebForm/FindOnSyncWebForm';
import JobsContextProvider from '../JobsContextProvider/JobsContextProvider';
import CurrentJobStatusContextProvider from '../CurrentJobStatusContextProvider/CurrentJobStatusContextProvider';
import ConfigurationSection from '../ConfigurationSection/ConfigurationSection';
import JobMonitorSection from '../JobMonitorSection/JobMonitorSection';
import VisualizerSection from '../VisualizerSection/VisualizerSection';
import LogsSection from '../LogsSection/LogsSection';
import DCIDContextProvider from '../DCIDContextProvider/DCIDContextProvider';
import PageNotFound from '../PageNotFound/PageNotFound';
import DataCollectionSection from '../DataCollectionSection/DataCollectionSection';
import JobConfigurationContextProvider from '../JobConfigurationContextProvider/JobConfigurationContextProvider';

type RouterParams = {
  dcid: string;
};

function DeploymentApp() {
  const { dcid } = useParams<RouterParams>();

  return typeof dcid !== 'undefined' && !Number.isNaN(Number(dcid)) ? (
    <DCIDContextProvider dcid={Number(dcid)}>
      <JobsContextProvider>
        <FindOnSyncWebForm />

        <CurrentJobStatusContextProvider>
          <JobConfigurationContextProvider>
            <DataCollectionSection />
            <ConfigurationSection />
          </JobConfigurationContextProvider>

          <JobMonitorSection />

          <VisualizerSection />

          <LogsSection />
        </CurrentJobStatusContextProvider>
      </JobsContextProvider>
    </DCIDContextProvider>
  ) : (
    <PageNotFound />
  );
}

export default DeploymentApp;
