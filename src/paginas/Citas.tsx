import { useAuth } from 'react-oidc-context';
import { API_URL } from '../config/Api';
import './Citas.css';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


export const AgendarCitas: React.FC = () => {
    const auth= useAuth();
    const [motivo, setMotivo]= useState("Atención General");
    const [fechaHora, setFechaHora]= useState(new Date());

    const agendar_cita= async ()=>  {
        const token= auth.user?.access_token;
        try {
            const response= await fetch(API_URL + "/api/citas/registrar", {
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });
        } catch (err : any) {

        }
    }

    return (
        <>
       <div className="form-citas-cont">
        <div className="form-citas-header">
            <h2 className="form-titulo">Cuentanos de tu mascota</h2>
            <div className="btn-mascotas-cont">
                <button className="btn btn-mascotas shadow ">Perro</button>
                <button className="btn btn-mascotas shadow ">Gato</button>
                <button className="btn btn-mascotas shadow ">Hamster</button>
            </div>
        </div>
        <div className="motivo-titulo">
            <h4>¿Cómo te podemos ayudar?</h4>
        </div>
        <div>

            <ul className="lista-motivos">
                <li><button className="btn btn-lista-motivos shadow"
                    onClick={()=> setMotivo("Atencion General")}
                >Atención General</button></li>
                <li><button className="btn btn-lista-motivos shadow"
                    onClick={()=> setMotivo("Vacunacion")}
                >Vacunación</button></li>
                <li><button className="btn btn-lista-motivos shadow"
                    onClick={()=> setMotivo("Antiparasitario interno")}
                >Antiparasitario interno</button></li>
                <li><button className="btn btn-lista-motivos shadow"
                    onClick={()=> setMotivo("Pack completo de examenes")}
                >Pack completo de examenes</button></li>
                <li><button className="btn btn-lista-motivos shadow"
                    onClick={()=> setMotivo("Radiografias")}
                >Radiografias</button></li>
                <li><button className="btn btn-lista-motivos shadow"
                    onClick={()=> setMotivo("Aplicacion de microchip")}
                >Aplicación de microchip</button></li>
            </ul>
        </div>
    </div> 
        </>
    );
}