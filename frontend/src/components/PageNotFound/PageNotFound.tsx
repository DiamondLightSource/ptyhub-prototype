import React from 'react';
import { Link } from 'react-router-dom';

function PageNotFound() {
  return (
    <div>
      <h1>Page not found</h1>
      <p>
        It seems like you&#39;re lost, try
        {' '}
        <Link to="/">clicking here</Link>
        {' '}
        to go home
      </p>
    </div>
  );
}

export default PageNotFound;
