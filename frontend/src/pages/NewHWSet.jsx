import React from 'react';
import { redirect, useNavigate, useParams } from "react-router-dom";
import "./NewHWSet.scss";
import { newHWSet, newProject } from '../api';
import { useCookies } from 'react-cookie';

const NewHWSet = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['userID']);

    const createHWSet = () => {
        const name = document.querySelector('input[name="name"]').value;
        const capacity = document.querySelector('input[name="capacity"]').value;
        const availability = document.querySelector('input[name="availability"]').value;
        
        newHWSet(cookies.userID, id, {
            name: name,
            capacity: capacity,
            availability: availability
        }).then(() => navigate(`/projects/${id}`));
    }

    return (
        <div className="home-container">
            <div className="projects-section">
                <h1>New Hardware Set</h1>
                <div className="hw-set-new-section">
                    <input type="text" name="name" placeholder="Name" />
                    <input type="text" name="capacity" placeholder="Capacity" />
                    <input type="text" name="availability" placeholder="Availability" />
                    <button onClick={createHWSet} className='hw-set-submit'>Create Hardware Set</button>
                </div>
            </div>
        </div>
    );
};

export default NewHWSet;
