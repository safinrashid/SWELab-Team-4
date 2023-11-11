import React, { useEffect, useState } from 'react';
import "./Home.scss";
import Project from '../components/Project/Project';
import { getAbsentProjects, getProjects, joinProject } from '../api';
import { useCookies } from 'react-cookie';
import { useNavigate  } from 'react-router';

function Home() {
    const [projects, setProjects] = useState([]);
    const [absentProjects, setAbsentProjects] = useState([]);
    const [cookies, setCookie, removeCookie] = useCookies(['userID']);
    const [showJoinButton, setShowJoinButton] = useState(false);
    const [shouldRefetch, setShouldRefetch] = useState(true);
    const navigate = useNavigate();

    // Load projects from local storage when component mounts
    useEffect(() => {
        const storedProjects = localStorage.getItem('projects-${cookies.userID}');
        if (storedProjects) {
            setProjects(JSON.parse(storedProjects));
        }
    }, []);

        // Save projects to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem(`projects-${cookies.userID}`, JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        if (shouldRefetch) {
        getProjects(cookies.userID).then((response) => {
            console.log(response)
            if (response != null) setProjects(response.projects);
        })
        setShouldRefetch(false);
    }
    }, [shouldRefetch])

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
        fetch('http://localhost:8000/projects/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cookies.userID}`, 
            },
            body: JSON.stringify({ id }),
        })
        .then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            if (data.project != null) {
                setProjects([...projects, data.project]);
                setAbsentProjects(absentProjects.filter((project) => project.id !== id));
                setShouldRefetch(true);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    var logout = () => {
        removeCookie('userID');
        navigate('/login');
    };

    var newproject = () => {
        navigate('/projects/new');
    };

    return (
        <div className='home-container'>
            <div className="projects-section">
                <h1>Choose a project</h1>
                <button onClick={() => newproject()} className="projects-new">New Project</button>
                <button onClick={() => toggleAbsentProjects()} className="projects-new">
                    {absentProjects.length > 0 ? (showJoinButton ? 'Hide' : 'More Projects') : 'More Projects'}
                </button>
                <div className="projects-absent-container">
                    {absentProjects.length > 0 && (
                        <>
                            <select onChange={(e) => joinProjectButton(e.target.value)}>
                                <option value="">Select a project to join</option>
                                {absentProjects.map((project) => 
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                )}
                            </select>
                            {showJoinButton && <button onClick={() => joinProject()} className="projects-new">Join Project</button>}
                        </>
                    )}
                </div>
                <div className="projects-container">
                    {projects.map((project) => (<Project {...project}/>))}
                </div>
                <button onClick={() => logout()} className="logout-button">Logout</button>
            </div>
        </div>
    );
}

export default Home;
