import { useEffect, useState } from "react";
import clubApi from "../api/clubs";


const ApiRequestBoxes = () => {

  const [getRequest, setGetStatus] = useState([]);
  const [postRequest, setPostStatus] = useState([]);
  const [putRequest, setPutStatus] = useState([]);
  const [deleteRequest, setDeleteStatus] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { status: getStatus } = await clubApi.getClub('New Club');
        const { status: deleteStatus} = await clubApi.deleteClub('New Club')
        const { status: postStatus } = await clubApi.createClub({
          name: 'New Club',
          owner: 'Jimmy John Jenkins',
        });
        const { status: putStatus } = await clubApi.updateClub('New Club',{
          owner: 'Henry Hank Henderson'
        })
        
        
        setGetStatus(getStatus);
        setPostStatus(postStatus);
        setPutStatus(putStatus);
        setDeleteStatus(deleteStatus);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px' }}>
        <h3>GET Request Status</h3>
        <p>Status: {getRequest}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px' }}>
        <h3>POST Request Status</h3>
        <p>Status: {postRequest}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px' }}>
        <h3>PUT Request Status</h3>
        <p>Status: {putRequest}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px' }}>
        <h3>DELETE Request Status</h3>
        <p>Status: {deleteRequest}</p>
      </div>
    </div>
  );
};

export default ApiRequestBoxes;