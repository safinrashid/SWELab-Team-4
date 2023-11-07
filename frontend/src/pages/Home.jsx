import React, { useEffect, useState } from 'react';
import "./Home.scss";
import Project from '../components/Project/Project';
import { getAbsentProjects, getProjects, joinProject } from '../api';
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
    const [absentProjects, setAbsentProjects] = useState([]);
    const [cookies, setCookie] = useCookies(['userID']);
    const [showJoinButton, setShowJoinButton] = useState(false);

    useEffect(() => {
        getProjects(cookies.userID).then((response) => {
            console.log(response)
            if (response != null) setProjects(response.projects);
        })
    }, [])

    var toggleAbsentProjects = () => {

        if (absentProjects.length > 0) {
            setAbsentProjects([]);
        } else {
            getAbsentProjects(cookies.userID).then((response) => {
                console.log(response)
                if (response != null) setAbsentProjects(response.projects);
                setShowJoinButton(true);
            })
        }
    }

    var joinProjectButton = (id) => {
        joinProject(cookies.userID, id).then((response) => {
            if (response != null) {
                setProjects([...projects, response.project]);
                setAbsentProjects(absentProjects.filter((project) => project.id !== id));
            }
        })
    }

    return (
        <div className='home-container'>
            <div className="projects-section">
                <h1>Choose a project</h1>
                <a href="/projects/new" className="projects-new">New Project</a>
                <button onClick={() => toggleAbsentProjects()} className="projects-new">View Projects</button>
                <div className="projects-absent-container">
                    {absentProjects.length > 0 && (
                        <select onChange={(e) => joinProjectButton(e.target.value)}>
                            <option value="">Select a project to join</option>
                            {absentProjects.map((project) => 
                                <option key={project.id} value={project.id}>{project.name}</option>
                            )}
                        </select>
                    )}
                    {showJoinButton && <button onClick={() => joinProject()} className="projects-new">Join Project</button>}
                </div>
                <div className="projects-container">
                    {projects.map((project) => (<Project {...project}/>))}
                </div>
            </div>
        </div>
    );
}

export default Home;
