import React from "react";

const App = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      textAlign: 'center',
      padding: '20px'
    }}>
      TEST RENDER OK<br /><br />
      Si ves este texto en negro → React monta correctamente.<br />
      Si ves blanco → crash antes del return.
    </div>
  );
};

export default App;
