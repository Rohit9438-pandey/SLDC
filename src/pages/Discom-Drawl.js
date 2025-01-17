import { Link } from 'react-router-dom'; 
import useFetchData from '../lib/useFetchData';  

const DiscomDrawl = () => {
  const { data, loading, error } = useFetchData("discom-drawl");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const totals = data.reduce(
    (acc, item) => {
      acc.scheduleTotal += item.DD_SCHEDULE;
      acc.drawlTotal += item.DD_DRAWL;
      acc.odudTotal += item.DD_ODUD;
      return acc;
    },
    { scheduleTotal: 0, drawlTotal: 0, odudTotal: 0 }
  );

  const handleOpenDrawlDetails = (discom) => {
    const url = `/drawl-details/${discom}`;
    window.open(url, '_blank');  // This opens the URL in a new tab
  };

  return (
    <div className="real-time-data-page">
      <h2 style={{color: '#0c6a98', fontWeight: 700}}>DISCOM DRAWL</h2>

      {data && Array.isArray(data) && data.length > 0 ? (
        <table className="genco-table">
          <thead>
            <tr>
              <th>Discom</th>
              <th>Schedule</th>
              <th>Drawl</th>
              <th>OD/UD</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {/* Discom Column - Link to the DrawlDetails page */}
                <td>
                  <Link to={`${item.DD_DISCOM}`} target="_blank">
                    {item.DD_DISCOM}
                  </Link>
                </td>
                
                {/* Schedule Column - Button that opens in a new tab */}
                <td>
                  <button
                    onClick={() => handleOpenDrawlDetails(item.DD_DISCOM)}
                    style={{ cursor: 'pointer', backgroundColor: '#f1f1f1', border: 'none', padding: '5px 10px',color:"#0c6a98" , textDecoration: "underline" }}
                  >
                    {Math.round(item.DD_SCHEDULE)}
                  </button>
                </td>
                
                {/* Drawl and OD/UD columns */}
                <td>{Math.round(item.DD_DRAWL)}</td>
                <td>{Math.round(item.DD_ODUD)}</td>
              </tr>
            ))}
            <tr>
              <td><strong>Total:</strong></td>
              <td><strong>{Math.round(totals.scheduleTotal.toFixed(2))}</strong></td>
              <td><strong>{Math.round(totals.drawlTotal.toFixed(2))}</strong></td>
              <td><strong>{Math.round(totals.odudTotal.toFixed(2))}</strong></td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>Loading....</p>
      )}
    </div>
  );
};

export default DiscomDrawl;
