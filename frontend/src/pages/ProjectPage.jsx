import React from 'react';
import {useParams} from "react-router-dom";
import HardwareSet from '../components/HardwareSet/HardwareSet';

function ProjectPage() {
    const {id} = useParams();

    return (
        <div className="project-page-container">
            <h1>Project page for {id}</h1>
            <HardwareSet/>
        </div>
    );
}

export default ProjectPage;
