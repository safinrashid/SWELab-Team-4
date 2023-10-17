import React from 'react';
import {useParams} from "react-router-dom";
import HardwareSet from '../components/HardwareSet/HardwareSet';
import "./ProjectPage.scss"

function ProjectPage() {
    const {id} = useParams();

    const hardware = [
        {
            id: 1,
            capacity: 300,
            availability: 200
        },
        {
            id: 2,
            capacity: 300,
            availability: 200
        },
        {
            id: 3,
            capacity: 300,
            availability: 200
        },
    ]

    return (
        <div className="page-container">
            <h1>Hardware Set for Project {id}</h1>
            <div className='hw-set-container'>
                {hardware.map((hardwareSet) => <HardwareSet {...hardwareSet} />)}            
            </div>
        </div>
    );
}

export default ProjectPage;
