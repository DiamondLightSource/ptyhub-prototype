import React from 'react';
import ExpandableSection from '../ExpandableSection/ExpandableSection';
import ParameterConfigurationSubsection from '../ParameterConfigurationSubsection/ParameterConfigurationSubsection';
import JobConfigurationSubsection from '../JobConfigurationSubsection/JobConfigurationSubsection';

function ConfigurationSection() {
  return (
    <ExpandableSection title="Configure job">
      <ParameterConfigurationSubsection />

      <br />

      <JobConfigurationSubsection />
    </ExpandableSection>
  );
}

export default ConfigurationSection;
