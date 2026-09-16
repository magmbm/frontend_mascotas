import { useAuth } from "react-oidc-context";
import "./CarnetMascota.css";
import { useLocation } from 'react-router-dom';
import { API_URL } from "../config/Api";
import { useEffect, useState } from "react";
import type { Mascota } from "./GestorMascotas";
import perro_bienvenida  from '../assets/perro.png'

interface CarnetProps {
  nombre: string;
  especie: string;
  edad: number;
  vacunas?: boolean;
}


export const CarnetMascota: any = ({
}) => {
  const location = useLocation();
  const id = location.state?.id;
  const auth= useAuth();
  const [mascota, setMascota]= useState<Mascota>();
  const [cargando, setCargando] = useState<boolean>(true);
  
  const getMascota= async ()=> {
    if (!id) {
      setCargando(false);
      return;
    }

    try {
      const token= auth.user?.access_token;
      const response= await fetch(`${API_URL}/api/mascotas/ver/${id}`, {
        method : "GET",
        headers : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })
      
      if (response.ok) {
        const data= await response.json();
        console.log(data);
        setMascota(data);
      }

    } catch (error : any) {
      console.log("Error get mascota");
      console.log(error);
    } setCargando(false);
  }

  useEffect(()=> {
    getMascota();
  }, [id])

  const handleVacunado= (vacunado : boolean)=> {
    if (vacunado) {
      return "Si";
    }
    return "No";
  }

  if (cargando) {
    return <div className="carnet-container"><p>Cargando información de la mascota...</p></div>;
  }

  if (!mascota) {
    return <div className="carnet-container"><p>No se encontró la información de la mascota.</p></div>;
  }

  return (
    
    <div className="carnet-container">
      {/* Columna Izquierda: Perfil */}
      <div className="carnet-sidebar">
        <div className="avatar-wrapper">
          <img src={perro_bienvenida} alt={""} className="pet-avatar" />
        </div>
        
        <h2 className="pet-name">{mascota.nombre}</h2>

      </div>
      {/* Columna Derecha: Tarjetas de Información 2x2 */}
      <div className="carnet-grid">
        <div className="info-card">
          <h3>Edad</h3>
          <p>{mascota.edad}</p>
        </div>

        <div className="info-card">
          <h3>Vacunas y Salud</h3>
          <p>{handleVacunado(mascota.vacunado)}</p>
        </div>

        <div className="info-card">
          <h3>Especie</h3>
          <p>{mascota.especie}</p>
        </div>

        <div className="info-card">
          <h3>Sexo</h3>
          <p>{mascota.sexo}</p>
        </div>
      </div>
    </div>
    
  );
};