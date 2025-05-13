import useFetchData from '../lib/useFetchData';

const DiscomDrawl = () => {
  const { data, loading, error } = useFetchData("discom-drawl");
  const latestTime = data.length > 0 ? new Date(data[0].DD_DATE).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No Time Available';

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
    window.open(url, '_blank');
  };

  const handleDataTable = (discom) => {
    const url = `/data-table/${discom}`;
    window.open(url, '_blank');
  };

  return (
    <div className="real-time-data-page">
      <h2 style={{ color: '#0c6a98', fontWeight: 700 }}>
        DISCOM DRAWL - {latestTime}
      </h2>

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
                <td>
                  <button
                    onClick={() => handleDataTable(item.DD_DISCOM)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: '#f1f1f1',
                      border: 'none',
                      padding: '5px 10px',
                      color: "#0c6a98",
                      textDecoration: "underline"
                    }}
                  >
                    {item.DD_DISCOM === 'NDPL' ? 'TPDDL' : item.DD_DISCOM}
                  </button>
                </td>

                <td>
                  <button
                    onClick={() => handleOpenDrawlDetails(item.DD_DISCOM)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: '#f1f1f1',
                      border: 'none',
                      padding: '5px 10px',
                      color: "#0c6a98",
                      textDecoration: "underline"
                    }}
                  >
                    {Math.round(item.DD_SCHEDULE)}
                  </button>
                </td>

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
