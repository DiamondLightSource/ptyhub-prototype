import React, { useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppInfoContext } from '../AppInfoContextProvider/AppInfoContextProvider';
import DeploymentApp from '../DeploymentApp/DeploymentApp';
import DeploymentLandingPage from '../DeploymentLandingPage/DeploymentLandingPage';
import PageNotFound from '../PageNotFound/PageNotFound';

function LocalAppRouter() {
  const { isDeploymentMode } = useContext(AppInfoContext);

  // This router component is only used in deployment mode
  return isDeploymentMode ? (
    <BrowserRouter>
      <Routes>
        <Route path="/dcid/:dcid" element={<DeploymentApp />} />
        <Route path="/" element={<DeploymentLandingPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  ) : null;
}

export default LocalAppRouter;
