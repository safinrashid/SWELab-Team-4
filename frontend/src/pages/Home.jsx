import React, { useEffect, useState } from 'react';
import "./Home.scss";
import Project from '../components/Project/Project';
import { getProjects } from '../api';
import { useCookies } from 'react-cookie';

function Home() {

    const testProjects = [
        {
            name: 'Project 1',
            description: 'This is a project',
            id: "1"
        },
        {
            name: 'Project 2',
            description: 'This is a second project',
            id: "2"
        }
    ]

    const [projects, setProjects] = useState([]);
    const [cookies, setCookie] = useCookies(['userID']);

    useEffect(() => {
        getProjects(cookies.userID).then((response) => {
            console.log(response)
            if (response != null) setProjects(response.projects);
        })
    }, [])

    return (
        <div className='home-container'>
            <div className="projects-section">
                <h1>Choose a project</h1>
                <a href="/projects/new" className="projects-new">New Project</a>
                <div className="projects-container">
                    {projects.map((project) => (<Project {...project}/>))}
                </div>
            </div>
        </div>
    );
}

export default Home;
