import React, {
  createContext, useMemo, useState, useEffect,
} from 'react';
import { SystemSetupService, OpenAPI } from '../../network';
import { getUrl } from '../../network/core/request';

type AppInfoContextType = {
  isDeploymentMode: boolean,
  isAuthenticated: boolean,
  user: {
    fedId: string,
    firstName: string,
    lastName: string
  }
};

export const AppInfoContext = createContext<AppInfoContextType>({
  isDeploymentMode: false,
  isAuthenticated: false,
  user: {
    fedId: '',
    firstName: '',
    lastName: '',
  },
});

type Props = {
  children: React.ReactNode
};

function AppInfoContextProvider({ children }: Props) {
  const [isDeploymentMode, setDeploymentMode] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [fedId, setFedId] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isStateFetched, setIsStateFetched] = useState<boolean>(false);

  const contextValue = useMemo<AppInfoContextType>(() => ({
    isDeploymentMode,
    isAuthenticated,
    user: {
      fedId,
      firstName,
      lastName,
    },
  }), [isDeploymentMode, isAuthenticated, firstName, lastName]);

  useEffect(() => {
    // Fetch from API
    SystemSetupService.getSystemInfo().then((systemInfo) => {
      if (systemInfo.requires_authentication) {
        window.location.href = getUrl(OpenAPI, {
          method: 'GET',
          url: '/api/auth/authorise',
        });

        return;
      }

      setDeploymentMode(systemInfo.deployment_mode);
      setIsAuthenticated(systemInfo.is_authenticated);

      if (systemInfo.user != null) {
        setFedId(systemInfo.user.fed_id);
        setFirstName(systemInfo.user.first_name);
        setLastName(systemInfo.user.last_name);
      }

      setIsStateFetched(true);
    });
  }, []);

  return (
    <AppInfoContext.Provider value={contextValue}>
      {isStateFetched && children}
      {!isStateFetched && (
        <p>Fetching...</p>
      )}
    </AppInfoContext.Provider>
  );
}

export default AppInfoContextProvider;
