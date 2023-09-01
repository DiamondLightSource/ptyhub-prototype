import React, { useContext, useState } from 'react';
import { ToggleGroup } from '@h5web/lib';
import { toast } from 'react-toastify';
import ScanNumbersTextInputDropdown from '../ScanNumbersTextInputDropdown/ScanNumbersTextInputDropdown';
import BackendFileViewerModalOpener from '../BackendFileViewerModalOpener/BackendFileViewerModalOpener';
import CustomButton from '../CustomButton/CustomButton';
import { convertParameterTreeDataToJson } from '../../util/paramTreeUtil';
import Job from '../../classes/job';
import Subsection from '../Subsection/Subsection';
import { JobsContext } from '../JobsContextProvider/JobsContextProvider';
import SubsectionTitle from '../SubsectionTitle/SubsectionTitle';
import Seperator, { SeperatorOrientation } from '../Seperator/Seperator';
import { ClusterType, ExtraOptionType, JobsService } from '../../network';
import './JobConfigurationSubsection.css';
import {
  JobConfigurationContext,
  JobConfigurationContextType,
} from '../JobConfigurationContextProvider/JobConfigurationContextProvider';
import { AppInfoContext } from '../AppInfoContextProvider/AppInfoContextProvider';
import CustomTextInput from '../CustomTextInput/CustomTextInput';

const CLUSTER_DROPDOWN_VALUE_ENUM_MAP: Record<string, ClusterType> = {
  hamilton: ClusterType.HAMILTON,
  science: ClusterType.SCIENCE,
};

function JobConfigurationSubsection() {
  const [scanNumbers, setScanNumbers] = useState<string[]>([]);
  const scanNumbersRef = React.useRef<string[]>([]);
  const [cluster, setCluster] = useState<string>('hamilton');
  const [useGPU, setUseGPU] = useState<boolean>(true);
  const [slurmToken, setSlurmToken] = useState<string>('');
  const [isJobSubmitting, setIsJobSubmitting] = useState<boolean>(false);

  const { jobs, setJobs, setSelectedJobId } = useContext(JobsContext);

  const {
    parameterTreeData,
    extraOptions,
    selectedParameterTreeStructure,
    setExtraOptions,
    outputFolder,
    setOutputFolder,
  } = useContext<JobConfigurationContextType>(JobConfigurationContext);

  const {
    isDeploymentMode,
  } = useContext(AppInfoContext);

  const updateScanNumbers = (newScanNumbers: string[]) => {
    scanNumbersRef.current = newScanNumbers;
    setScanNumbers(newScanNumbers);
  };

  const submitJob = () => {
    if (!parameterTreeData || !selectedParameterTreeStructure?.parameter_tree_type) {
      toast.error('No parameter tree loaded, please refresh the page and try again');
      return;
    }

    const paramTreeYaml = convertParameterTreeDataToJson(
      selectedParameterTreeStructure,
      parameterTreeData,
      extraOptions,
    );
    const clusterEnum = CLUSTER_DROPDOWN_VALUE_ENUM_MAP[cluster];

    setIsJobSubmitting(true);

    const submissionPromise = isDeploymentMode
      ? JobsService.submitDeploymentJob({
        cluster: clusterEnum,
        config_file_data: paramTreeYaml,
        scan_id: scanNumbersRef.current.join(','),
        use_gpu: useGPU,
        parameter_tree_type: selectedParameterTreeStructure.parameter_tree_type,
        extra_option_values: extraOptions,
        processed_job_id: 15147809, // TODO update to be real value
        slurm_jwt: slurmToken,
      })
      : JobsService.submitLocalJob({
        cluster: clusterEnum,
        config_file_data: paramTreeYaml,
        output_folder_path: outputFolder,
        scan_id: scanNumbersRef.current.join(','),
        use_gpu: useGPU,
        parameter_tree_type: selectedParameterTreeStructure.parameter_tree_type,
        extra_option_values: extraOptions,
      });

    submissionPromise.then((submitRes) => {
      if (!submitRes.success) {
        toast.error('Failed to submit job. Backend did not accept our request');
        return;
      }
      const newlyStatedJobs = submitRes.submitted_jobs.map(
        (startedJob) => new Job(startedJob.job_id, startedJob.access_token),
      );
      const newJobs = [...jobs, ...newlyStatedJobs];
      setJobs(newJobs);

      if (newlyStatedJobs.length !== 0) {
        setSelectedJobId(newlyStatedJobs[0].jobId); // Select the first started job
      }

      toast.success('Job submitted successfully');
    }).catch((e) => {
      if (e?.body?.detail) {
        toast.error(`Failed to submit job: ${e.body?.detail}`);
      } else {
        toast.error(`Failed to submit job: ${e}`);
      }
    }).finally(() => {
      setIsJobSubmitting(false);
    });
  };

  const updateSingleExtraOptionValue = (
    configName: string,
    newValue: any,
    currentExtraOptions: Record<string, any>,
  ) => {
    const newExtraOptions = Object.entries(currentExtraOptions)
      .reduce((acc: Record<string, any>, [key, value]) => {
        if (key === configName) {
          acc[key] = newValue;
        } else {
          acc[key] = value;
        }

        return acc;
      }, {} as Record<string, any>);

    setExtraOptions(newExtraOptions);
  };

  return (
    <Subsection>
      <div className="job-configuration-subsection">
        <SubsectionTitle title="Submit cluster job" />
        <Seperator orientation={SeperatorOrientation.VERTICAL} coloured />

        <ScanNumbersTextInputDropdown
          name="Scan number"
          scanNumbers={scanNumbers}
          setScanNumbers={updateScanNumbers}
        />

        <Seperator orientation={SeperatorOrientation.VERTICAL} />

        {
          selectedParameterTreeStructure
          && selectedParameterTreeStructure.extra_options.map((extraOption) => (
            extraOption.config_name in extraOptions && (
              <React.Fragment key={extraOption.config_name}>
                <div>
                  {
                    extraOption.type === ExtraOptionType.FILE_SELECT && (
                      <BackendFileViewerModalOpener
                        isFolderSelector
                        onSelectedDirectoryChange={(newValue) => {
                          updateSingleExtraOptionValue(
                            extraOption.config_name,
                            newValue,
                            extraOptions,
                          );
                        }}
                        placeholder="Visit path"
                        selectedDirectory={extraOptions[extraOption.config_name]}
                        name="Visit Path"
                      />
                    )
                  }

                  {
                    extraOption.type === ExtraOptionType.RANGE_INPUT && (
                      <ScanNumbersTextInputDropdown
                        name="Projection"
                        scanNumbers={extraOptions[extraOption.config_name]}
                        setScanNumbers={(newValue) => {
                          updateSingleExtraOptionValue(
                            extraOption.config_name,
                            newValue,
                            extraOptions,
                          );
                        }}
                      />
                    )
                  }
                </div>

                <Seperator
                  orientation={SeperatorOrientation.VERTICAL}
                />
              </React.Fragment>
            )
          ))
        }

        {
          !isDeploymentMode && (
            <>
              <BackendFileViewerModalOpener
                isFolderSelector
                onSelectedDirectoryChange={setOutputFolder}
                placeholder="Output directory"
                selectedDirectory={outputFolder}
                name="Output directory"
              />
              <Seperator orientation={SeperatorOrientation.VERTICAL} />
            </>
          )
        }

        <select
          value={cluster}
          onChange={(e) => setCluster(e.target.value)}
        >
          <option value="hamilton">Hamilton</option>
          <option value="science">Science</option>
        </select>

        <Seperator orientation={SeperatorOrientation.VERTICAL} />

        <ToggleGroup
          role="radiogroup"
          value={useGPU ? 'gpu' : 'cpu'}
          onChange={(newValue: string) => setUseGPU(newValue === 'gpu')}
        >
          <ToggleGroup.Btn label="CPU" value="cpu" />
          <ToggleGroup.Btn label="GPU" value="gpu" />
        </ToggleGroup>

        <Seperator orientation={SeperatorOrientation.VERTICAL} />

        {
          isDeploymentMode && (
            <>
              <CustomTextInput type="text" value={slurmToken} onChange={setSlurmToken} placeholder="Slurm token" />
              <Seperator orientation={SeperatorOrientation.VERTICAL} />
            </>
          )
        }

        <Seperator orientation={SeperatorOrientation.VERTICAL} />

        <CustomButton
          text={isJobSubmitting ? 'Submitting...' : 'Submit'}
          onClick={submitJob}
          disabled={isJobSubmitting}
        />
      </div>
    </Subsection>
  );
}

export default JobConfigurationSubsection;
