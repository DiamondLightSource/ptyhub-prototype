import React, { useState } from 'react';
import { toast } from 'react-toastify';
import CustomButton from '../CustomButton/CustomButton';
import CustomTextInput from '../CustomTextInput/CustomTextInput';
import './FindOnSyncWebForm.css';

function FindOnSyncWebForm() {
  const [visitName, setVisitName] = useState<string>('');

  const redirectToSyncWeb = () => {
    if (visitName === '') {
      toast.error('The visit cannot be blank');
      return;
    }
    window.location.href = `https://ispyb.diamond.ac.uk/dc/visit/${visitName}`;
  };

  return (
    <div className="find-on-sync-web-form">
      <CustomTextInput
        type="text"
        value={visitName}
        onChange={setVisitName}
        placeholder="Visit"
        className="find-on-sync-web-form__input"
      />

      <CustomButton text="Find on SyncWeb" onClick={redirectToSyncWeb} />
    </div>
  );
}

export default FindOnSyncWebForm;
