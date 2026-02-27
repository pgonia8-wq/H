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
      TEST DE RENDER - VERSIÓN FUNCIONAL<br /><br />
      Fondo negro + texto blanco → React monta correctamente.<br />
      Si ves blanco → hay crash en el bundle o mounting.<br /><br />
      (Prueba para descartar error de render)
    </div>
  );
}
