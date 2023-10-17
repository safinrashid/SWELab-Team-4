import React from 'react';
import { redirect, useNavigate } from "react-router-dom";
import "./NewProject.scss";

const NewProject = () => {

    const navigate = useNavigate();

    const createProject = () => {
        const name = document.querySelector('input[name="name"]').value;
        const desc = document.querySelector('input[name="desc"]').value;
        const id = document.querySelector('input[name="id"]').value;

        console.log(name, desc, id);

        navigate(`/projects`);
    }

    return (
        <div className="home-container">
            <div className="projects-section">
                <h1>New Project</h1>
                <div className="projects-new-section">
                    <input type="text" name="name" placeholder="Name" />
                    <input type="text" name="desc" placeholder="Description" />
                    <input type="text" name="id" placeholder="ID" />
                    <button onClick={createProject} className='project-submit'>Create Project</button>
                </div>
            </div>
        </div>
    );
};

export default NewProject;
