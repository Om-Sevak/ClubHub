/*********************************************************************************
    FileName: ApiRequestTestBoxes.jsx
    FileVersion: 1.0
    Core Feature(s): API Request Status Display
    Purpose: This component fetches data from the server using different HTTP methods (GET, POST, PUT, DELETE) and displays the status of each request.
*********************************************************************************/


import { useEffect, useState } from "react";
import clubApi from "../api/clubs";


const ApiRequestBoxes = () => {

  const [getRequest, setGetStatus] = useState([]);
  const [postRequest, setPostStatus] = useState([]);
  const [putRequest, setPutStatus] = useState([]);
  const [deleteRequest, setDeleteStatus] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { status: getStatus } = await clubApi.getClub('New Club');
        const { status: deleteStatus} = await clubApi.deleteClub('New Club')
        const { status: postStatus } = await clubApi.createClub({
          name: 'New Club',
          description: 'Test Club For Front to Back end testing',
          email: 'test@test.com'
        });
        const { status: putStatus } = await clubApi.updateClub('New Club',{
          email: 'newtest@test.com'
        })
        
        
        setGetStatus(getStatus);
        setPostStatus(postStatus);
        setPutStatus(putStatus);
        setDeleteStatus(deleteStatus);

      } catch (error) {
        console.log(error)
      }
    };

    fetchData();
  }, []);


  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
      alignItems: 'normal',
      justifyContent: 'center'
    }}>
      <div style={{ border: '1px solid #ccc', padding: '20px', alignSelf: 'flex-end', textAlign: 'center' }}>
        <h3>GET Request Status</h3>
        <p>Status: {getRequest}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', alignSelf: 'flex-end', textAlign: 'center' }}>
        <h3>POST Request Status</h3>
        <p>Status: {postRequest}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', alignSelf: 'flex-start', textAlign: 'center' }}>
        <h3>PUT Request Status</h3>
        <p>Status: {putRequest}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', alignSelf: 'flex-start', textAlign: 'center' }}>
        <h3>DELETE Request Status</h3>
        <p>Status: {deleteRequest}</p>
      </div>
    </div>
  );
};

export default ApiRequestBoxes;