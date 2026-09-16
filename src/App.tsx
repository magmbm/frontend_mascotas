import { useEffect, useState } from 'react'
import perro_bienvenida  from './assets/perro.png';
import './App.css'
import { useAuth } from "react-oidc-context";
import {  useNavigate, Route, Routes } from 'react-router';
import { CarnetMascota } from './paginas/CarnetMascota';
import { RegistroMascota } from './paginas/RegistroMascota';
import { GestorMascotas } from './paginas/GestorMascotas';

interface TarjetaProps {
  imagen?: string;
  nombre: string;
  especie: string;
  edad: number;
  vacunado?: boolean;
  onVerDetalles?: () => void;
}


export const TarjetaMascota: React.FC<TarjetaProps> = ({
  imagen,
  nombre,
  especie,
  edad,
  vacunado,
  onVerDetalles,
}) => {
  /*
  */
  const navigate= useNavigate();
  const handleVerDetalles = () => {
    // Navegamos a la ruta /carnet pasando los datos de la mascota en el state
    navigate('/carnet', {
      state: {
        nombre,
        especieRaza: `${especie} • Dachshund`,
        edad,
        fotoUrl: imagen,
        vacunado,
      },
    });
  };
  return (
    <div className="card">
      {imagen && <img src={imagen} alt={nombre} className="card-img" />}
      
      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">{nombre}</h3>
          {vacunado !== undefined && (
            <span className={`badge ${vacunado ? "badge-success" : "badge-danger"}`}>
              {vacunado ? "✅ Vacunado" : "❌ Sin vacunar"}
            </span>
          )}
        </div>

        <p className="card-info">
          <strong>Especie:</strong> {especie} | <strong>Edad:</strong> {edad} {edad === 1 ? "año" : "años"}
        </p>

        {onVerDetalles && (
          <button className="card-btn" onClick={handleVerDetalles}>
            Ver detalles
          </button>
        )}
      </div>
    </div>
  );
};

const Inicio: React.FC = () => {
  const auth= useAuth();
  const roles = (auth.user?.profile["cognito:groups"] as string[]) || [];
  return (
    <div>
      <p>Bienvenido "{auth.user?.profile.email}"</p>
      <p>
        <strong>Roles: </strong>
        {roles.length > 0 ? roles.join(', ') : 'Sin roles asignados'}
      </p>
      <div className='tarjetaCont'>
        <TarjetaMascota
          nombre="Firulais"
          especie="Perro"
          edad={3}
          vacunado={true}
          imagen={perro_bienvenida}
          onVerDetalles={()=> console.log()}
          />
      </div>
    </div>
  );
};


function App() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleCerrarSesion = async ()  => {
    await auth.signoutRedirect();

    const cognitoDomain = "https://us-east-1qmdhsiox2.auth.us-east-1.amazoncognito.com";
    const clientId = "55hsp4g2da2n0g262v5bphgsj5";
    const logoutUri = "http://localhost:5173";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
  };

  useEffect(() => {
    console.log("Flag");
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator && !auth.error) {
      auth.signinRedirect().catch((err) => {
        console.error("Error al redirigir a Cognito:", err);
      });
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, auth.error]);

  if (auth.isLoading) {
    return(
      <div>
        <h3>Cargando sesión de usuario...</h3>
      </div>
    )
  }

  /*
  if (!auth.isAuthenticated) {
    auth.signinRedirect();
  }
  */


  if (auth.isAuthenticated) {
    console.log("Access Token");
    console.log(auth.user?.profile);
    console.log(auth.user?.access_token);
    return (
      <>
        <div className="header">
          <button className='botonTitulo' onClick={()=> navigate('/')}>
          <h1 className="tituloPagina">Mascotas</h1>
          </button>
          <button className="btnCerrarSesion" onClick={handleCerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
        <div className="navbar">
          <ul>
            <button className='btn' onClick={()=> navigate('/mascota/registrar')}>Agregar Mascota</button>
            <button className='btn' onClick={()=> navigate('/mascota/crud')}>Gestor de Mascotas</button>
          </ul>
        </div>
        <div className="ticks"></div>
        <div className='tarjetaCont'>
          </div>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/carnet" element={<CarnetMascota />} />
          <Route path="/mascota/registrar" element={<RegistroMascota />}/>
          <Route path="/mascota/crud" element={<GestorMascotas />}/>
        </Routes>
        </>
    )

  }

}

export default App
