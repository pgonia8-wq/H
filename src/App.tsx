import React from "react";

export default function App() {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      backgroundColor: "black",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28px",
      textAlign: "center",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      TEST DE RENDER<br /><br />
      Si ves este texto en fondo negro → React está montando correctamente.<br />
      Si ves pantalla blanca → hay crash antes del primer return.<br /><br />
      (Prueba 1: mounting básico)
    </div>
  );
}
