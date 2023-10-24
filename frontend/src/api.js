import axios from 'axios';

async function getProjects(auth) {
    if (auth == null || auth === "") return null;

    const response = await axios.get('http://localhost:5000/projects', {
        headers: {
            'Authorization': "Bearer " + auth,
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }).catch((error) => {
        return null;
    });

    if (response == null) return null;

    return response.data;
}

async function getProject(auth, projectID) {
    if (auth == null || auth === "") return null;
    if (projectID == null || projectID === "") return null;

    const response = await axios.get('http://localhost:5000/projects/' + projectID, {
        headers: {
            'Authorization': "Bearer " + auth,
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }).catch((error) => {
        return null;
    });

    if (response == null) return null;

    return response.data;
}

async function newProject(auth, project) {
    if (auth == null || auth === "") return null;
    if (project == null) return null;

    const response = await axios.post('http://localhost:5000/projects', project, {
        headers: {
            'Authorization': "Bearer " + auth,
            "Content-Type": "application/json",
        }
    }).catch((error) => {
        return null;
    });

    if (response == null) return null;

    return response.data;
}

async function getHWSets(auth, projectID) {
    if (auth == null || auth === "") return null;
    if (projectID == null || projectID === "") return null;

    const response = await axios.get(`http://localhost:5000/projects/${projectID}/hwsets`, {
        headers: {
            'Authorization': "Bearer " + auth,
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }).catch((error) => {
        return null;
    });

    if (response == null) return null;

    return response.data;
}

async function newHWSet(auth, projectID, hwSet) {
    if (auth == null || auth === "") return null;
    if (projectID == null || projectID === "") return null;
    if (hwSet == null) return null;

    const response = await axios.post(`http://localhost:5000/projects/${projectID}/hwsets`, hwSet, {
        headers: {
            'Authorization': "Bearer " + auth,
            "Content-Type": "application/json",
        }
    }).catch((error) => {
        return null;
    });

    if (response == null) return null;

    return response.data;
}

export { getProjects, getProject, newProject, getHWSets, newHWSet };