import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import interestsApi from '../api/interests';


const InterestMultiSelect = ({selectedOptions, setSelectedOptions}) => {
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

  return (
    <label htmlFor="clubInterests">
      Club Interests (Select at least 5):
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        isLoading={isLoading}
        className="interests-select"
      />
    </label>
  );
};

export default InterestMultiSelect;