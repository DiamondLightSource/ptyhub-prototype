import React, { useContext } from 'react';
import { Navbar, User } from 'diamond-components';
import { AppInfoContext } from '../AppInfoContextProvider/AppInfoContextProvider';

function DiamondHeader() {
  const {
    user, isDeploymentMode,
  } = useContext(AppInfoContext);

  return (
    <Navbar
      user={isDeploymentMode ? {
        fedid: user.fedId,
        name: user.firstName,
      } : null}
    >
      {
        isDeploymentMode ? (
          <User
            onLogin={() => {
            }}
            onLogout={() => {
              window.location.href = '/api/auth/logout';
            }}
            user={{
              fedid: user.fedId,
              name: user.firstName,
            }}
          />
        ) : undefined
      }
    </Navbar>
  );
}

export default DiamondHeader;
