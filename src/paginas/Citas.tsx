import { useAuth } from 'react-oidc-context';
import { API_URL } from '../config/Api';
import './Citas.css';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


//const InformacionAtencion

export const AgendarCitas: React.FC = () => {
    const auth= useAuth();
    const [motivo, setMotivo]= useState<string>("Atención General");
    const [fechaHora, setFechaHora]= useState(new Date());
    const [etapa, setEtapa]= useState<number>(1);

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

    const InformacionMascota: React.FC = ()=> {
        return (
            <>
            <div className="citas-header">
                <h2 className="titulo">Cuentanos de tu mascota</h2>
                <div className="btn-mascotas-cont">
                    <button className="btn btn-mascotas shadow" id="btn-mascotas-left">Perro</button>
                    <button className="btn btn-mascotas shadow" id="btn-mascotas-center">Gato</button>
                    <button className="btn btn-mascotas shadow" id="btn-mascotas-right">Hamster</button>
                </div>
                <p className="label label-nombre-mascota">Nombre de tu mascota</p>
                <input type="text" id="nombre-mascota-input" className="form-control"></input>
            </div>
            <div className="motivo-titulo">
                <p id="titulo-lista">¿Cómo te podemos ayudar?</p>
            </div>
            <div className='list-cont'>

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
            </>
        );
    }

    const FechaCita: React.FC= ()=> {
        return(
            <>
            <div className="citas-header">
                <h2 className="titulo">Elige una hora para la atención</h2>
                <div className="btn-mascotas-cont">
                    <button className="btn btn-fechas-semanas shadow" id="btn-mascotas-left">Esta Semana</button>
                    <button className="btn btn-fechas-semanas shadow" id="btn-mascotas-center">Próxima Semana</button>
                    <button className="btn btn-fechas-semanas shadow" id="btn-mascotas-right">En 3 Semanas</button>
                    <button className="btn btn-fechas-semanas shadow" id="btn-mascotas-right">En 4 Semanas</button>
                </div>
            </div>
                <ul className='lista-fechas-cont'>
                    <li>
                        <button className='btn btn-lista-fechas'>Lunes</button>
                    </li>
                    <li>
                        <button className='btn btn-lista-fechas'>Martes</button>
                    </li>
                    <li>
                        <button className='btn btn-lista-fechas'>Miercoles</button>
                    </li>
                    <li>
                        <button className='btn btn-lista-fechas'>Jueves</button>
                    </li>
                </ul>
            </>
        )
    }

    switch(etapa) {
        case 0:
            return (
                <div className="citas-cont">
                    <InformacionMascota></InformacionMascota>
                </div>
            )
        case 1:
            return(
                <div className="citas-cont">
                    <FechaCita></FechaCita>
                </div>
            )
    }

}