import React, { useContext, useEffect, useState } from 'react';
import ExpandableSection from '../ExpandableSection/ExpandableSection';
import { AppInfoContext } from '../AppInfoContextProvider/AppInfoContextProvider';

type Props = {
  children: React.ReactNode
};

function SessionsSection({ children }: Props) {
  const {
    isDeploymentMode,
  } = useContext(AppInfoContext);

  const [hasSetSessionData, setHasSetSessionData] = useState<boolean>(false);

  useEffect(() => {
    if (!isDeploymentMode) {
      setHasSetSessionData(true);
    }
  }, [isDeploymentMode]);

  return (
    <>
      {
        isDeploymentMode && (
          <ExpandableSection title="Sessions" disableCollapse>
            <button type="button" onClick={() => setHasSetSessionData(true)}>
              Load session data
            </button>
          </ExpandableSection>
        )
      }

      {hasSetSessionData && children}
    </>
  );
}

export default SessionsSection;
