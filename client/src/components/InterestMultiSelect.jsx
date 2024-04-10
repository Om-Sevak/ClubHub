/*********************************************************************************
  FileName: InterestMultiSelect.jsx
  FileVersion: 1.0
  Core Feature(s): Multi-select interests component
  Purpose: This component renders a multi-select dropdown for selecting interests. It fetches interests from the server and allows users to select multiple interests.
*********************************************************************************/

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import interestsApi from '../api/interests';
import './InterestMultiSelect.css'


const InterestMultiSelect = ({selectedOptions, setSelectedOptions, minRquired}) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInterests = async () => {
      setIsLoading(true);
      try {
        const { status: reqStatus, data: interestData } = await interestsApi.getAllInterests();

        if (reqStatus === 200) {
          const interests = interestData.interests;
          const formattedOptions = interests.map(interest => ({ value: interest, label: interest}));
          setOptions(formattedOptions);
        }
      }
      catch (error) {
        console.error('unable to get interests ', error);
      }
      setIsLoading(false);
    };

    fetchInterests();
  }, []);

  const handleChange = (selectedItems) => {
    setSelectedOptions(selectedItems);
  };

  let minReqText = minRquired ? `Select at least ${minRquired} Interests` : "Select Interests";

  return (
    <label className="interests-select"  htmlFor="clubInterests">
      <Select
        isMulti
        options={options}
        placeholder={minReqText}
        value={selectedOptions}
        onChange={handleChange}
        isLoading={isLoading}
      />
    </label>
  );
};

export default InterestMultiSelect;