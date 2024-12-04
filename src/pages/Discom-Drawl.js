import React from 'react';
import useFetchData from '../lib/useFetchData';  

const DiscomDrawl = () => {
  // Simulate fetching the data (replace this with actual fetch logic or prop passing)
  const { data, loading, error } = useFetchData("discom-drawl");  
  
  // Handle loading and error states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Calculate totals for Schedule, Drawl, and OD/UD
  const totals = data.reduce(
    (acc, item) => {
      acc.scheduleTotal += item.DD_SCHEDULE;
      acc.drawlTotal += item.DD_DRAWL;
      acc.odudTotal += item.DD_ODUD;
      return acc;
    },
    { scheduleTotal: 0, drawlTotal: 0, odudTotal: 0 } // Initial values
  );

  return (
    <div className="real-time-data-page">
      <h2>Real-Time Data </h2>

      {/* Render DISCOM DRAWL table if data exists */}
      {data && Array.isArray(data) && data.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Discom</th>
              <th>Schedule</th>
              <th>Drawl</th>
              <th>OD/UD</th>
              
            </tr>
          </thead>
          <tbody>
            {/* Map through the data */}
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.DD_DISCOM}</td>
                <td>{Math.round(item.DD_SCHEDULE)}</td>
                <td>{Math.round(item.DD_DRAWL)}</td>
                <td>{Math.round(item.DD_ODUD)}</td>
              </tr>
            ))}

            {/* Add a row for the totals within the table */}
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
