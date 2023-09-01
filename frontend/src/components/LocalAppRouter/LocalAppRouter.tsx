import React, { useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppInfoContext } from '../AppInfoContextProvider/AppInfoContextProvider';
import LocalApp from '../LocalApp/LocalApp';
import PageNotFound from '../PageNotFound/PageNotFound';

function LocalAppRouter() {
  const { isDeploymentMode } = useContext(AppInfoContext);

  // This router component is only used in local mode
  return !isDeploymentMode ? (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LocalApp />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  ) : null;
}

export default LocalAppRouter;
