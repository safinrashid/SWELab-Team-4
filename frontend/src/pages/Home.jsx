import React from 'react';
import "./Home.scss";
import Project from '../components/Project/Project';

function Home() {

    const projects = [
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
