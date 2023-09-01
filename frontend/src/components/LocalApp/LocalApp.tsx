import React from 'react';
import JobsContextProvider from '../JobsContextProvider/JobsContextProvider';
import CurrentJobStatusContextProvider from '../CurrentJobStatusContextProvider/CurrentJobStatusContextProvider';
import ConfigurationSection from '../ConfigurationSection/ConfigurationSection';
import JobMonitorSection from '../JobMonitorSection/JobMonitorSection';
import VisualizerSection from '../VisualizerSection/VisualizerSection';
import LogsSection from '../LogsSection/LogsSection';
import JobConfigurationContextProvider from '../JobConfigurationContextProvider/JobConfigurationContextProvider';

function LocalApp() {
  return (
    <JobsContextProvider>
      <CurrentJobStatusContextProvider>

        <JobConfigurationContextProvider>
          <ConfigurationSection />
        </JobConfigurationContextProvider>

        <JobMonitorSection />

        <VisualizerSection />

        <LogsSection />
      </CurrentJobStatusContextProvider>
    </JobsContextProvider>
  );
}

export default LocalApp;
