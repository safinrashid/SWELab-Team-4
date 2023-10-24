import React, { useEffect } from 'react';
import {useParams} from "react-router-dom";
import HardwareSet from '../components/HardwareSet/HardwareSet';
import "./ProjectPage.scss"
import { useState } from 'react';
import { getHWSets } from '../api';
import { useCookies } from 'react-cookie';

function ProjectPage() {
    const {id} = useParams();
    const [hwSets, setHWSets] = useState([]);
    const [cookies, setCookie] = useCookies(['userID']);

    useEffect(() => {
        getHWSets(cookies.userID, id).then((response) => {
            if (response != null) setHWSets(response.hwSets);
        })
    }, [])

    return (
        <div className="page-container">
            <h1>Hardware Set for Project {id}</h1>
            <a href={`/projects/${id}/hwsets/new`} className="hw-set-new">New Hardware Set</a>
            <div className='hw-set-container'>
                {hwSets.map((hardwareSet) => <HardwareSet {...hardwareSet} key={hardwareSet.name }/>)}            
            </div>
        </div>
    );
}

export default ProjectPage;
