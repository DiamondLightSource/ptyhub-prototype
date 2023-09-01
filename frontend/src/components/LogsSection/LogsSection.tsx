import React, {
  useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { ToggleGroup } from '@h5web/lib';
import ExpandableSection from '../ExpandableSection/ExpandableSection';
import './LogsSection.css';
import { CurrentJobStatusContext } from '../CurrentJobStatusContextProvider/CurrentJobStatusContextProvider';

function LogsSection() {
  const currentStatus = useContext(CurrentJobStatusContext);
  const [showStdOut, setShowStdOut] = useState<boolean>(true);
  const terminalWrapperRef = useRef<HTMLDivElement>(null);

  const logText = useMemo<string>(() => {
    if (!currentStatus) {
      return 'No logs yet';
    }

    const { currentJobStatus: { logs } } = currentStatus;

    return showStdOut ? logs.stdout_log : logs.stderr_log;
  }, [currentStatus, showStdOut]);

  useEffect(() => {
    window.setTimeout(() => {
      if (terminalWrapperRef.current) {
        terminalWrapperRef.current.scrollTop = terminalWrapperRef.current.scrollHeight;
      }
    }, 1);
  }, [showStdOut]);

  return (
    <ExpandableSection title="Logs" className="logs-section">
      <div className="logs-section__toolbar-wrapper">
        <ToggleGroup
          role="radiogroup"
          value={showStdOut ? 'stdOut' : 'stdErr'}
          onChange={(newValue: string) => setShowStdOut(newValue === 'stdOut')}
        >
          <ToggleGroup.Btn label="Std Out" value="stdOut" />
          <ToggleGroup.Btn label="Std Err" value="stdErr" />
        </ToggleGroup>
      </div>

      <div className="logs-section__terminal-wrapper" ref={terminalWrapperRef}>
        <span
          className="logs-section__wrapper__terminal"
        >
          {logText}
        </span>
      </div>
    </ExpandableSection>
  );
}

export default LogsSection;
