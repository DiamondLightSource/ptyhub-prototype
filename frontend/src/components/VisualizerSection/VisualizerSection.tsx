import React, { useContext, useMemo } from 'react';
import { Visualizer, VisualizerGraph } from '@ptyweb/lib';
import ExpandableSection from '../ExpandableSection/ExpandableSection';
import { CurrentJobStatusContext } from '../CurrentJobStatusContextProvider/CurrentJobStatusContextProvider';
import { ReconstructionViewerResponse } from '../../network/models/ReconstructionViewerResponse';
import './VisualizerSection.css';

function VisualizerSection() {
  const currentStatus = useContext(CurrentJobStatusContext);

  const reconstructionData = useMemo<
  ReconstructionViewerResponse | undefined
  >(() => currentStatus?.currentJobStatus.reconstruction, [currentStatus]);

  return (
    <ExpandableSection title="Visualiser">
      {
        reconstructionData && (
          <div className="visualizer-section__visualizers">
            <Visualizer
              title="Object"
              data={
                {
                  imaginary: reconstructionData.object.imaginary,
                  real: reconstructionData.object.real,
                  pixel_size: reconstructionData.object.pixel_size,
                }
              }
            />

            <Visualizer
              title="Probe"
              data={
                {
                  imaginary: reconstructionData.probe.imaginary,
                  real: reconstructionData.probe.real,
                  pixel_size: reconstructionData.probe.pixel_size,
                }
              }
            />

            <VisualizerGraph data={reconstructionData.graph} />
          </div>
        )
      }

      {
        !reconstructionData && (
          <span>
            {`No reconstruction data yet. If you have jobs running,
            please select "View" in the
            job monitor section above to see it here (if a preview is available)`}
          </span>
        )
      }
    </ExpandableSection>
  );
}

export default VisualizerSection;
