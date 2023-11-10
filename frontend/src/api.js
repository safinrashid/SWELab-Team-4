import axios from "axios";

async function getProjects(auth) {
	if (auth == null || auth === "") return null;

	const response = await axios
		.get("http://localhost:8000/projects", {
			headers: {
				Authorization: "Bearer " + auth,
				"Content-Type": "application/x-www-form-urlencoded"
			}
		})
		.catch((error) => {
			return null;
		});

	if (response == null) return null;

	return response.data;
}

async function getAbsentProjects(auth) {
	if (auth == null || auth === "") return null;

	const response = await axios
		.get("http://localhost:8000/projects", {
			headers: {
				Authorization: "Bearer " + auth,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			params: {
				absent: true
			}
		})
		.catch((error) => {
			return null;
		});

	if (response == null) return null;

	return response.data;
}

async function getProject(auth, projectID) {
	if (auth == null || auth === "") return null;
	if (projectID == null || projectID === "") return null;

	const response = await axios
		.get("http://localhost:8000/projects/" + projectID, {
			headers: {
				Authorization: "Bearer " + auth,
				"Content-Type": "application/x-www-form-urlencoded"
			}
		})
		.catch((error) => {
			return null;
		});

	if (response == null) return null;

	return response.data;
}

async function newProject(auth, project) {
	if (auth == null || auth === "") return null;
	if (project == null) return null;

	const response = await axios
		.post("http://localhost:8000/projects", project, {
			headers: {
				Authorization: "Bearer " + auth,
				"Content-Type": "application/json"
			}
		})
		.catch((error) => {
			window.alert(error.response.data.message)
			return null;
		});

	if (response == null) return null;

	return response.data;
}

async function getHWSets(auth, projectID) {
	if (auth == null || auth === "") return null;
	if (projectID == null || projectID === "") return null;

	const response = await axios
		.get(`http://localhost:8000/projects/${projectID}/hwsets`, {
			headers: {
				Authorization: "Bearer " + auth,
				"Content-Type": "application/x-www-form-urlencoded"
			}
		})
		.catch((error) => {
			return null;
		});

	if (response == null) return null;

	return response.data;
}

async function newHWSet(auth, projectID, hwSet) {
	if (auth == null || auth === "") return null;
	if (projectID == null || projectID === "") return null;
	if (hwSet == null) return null;

	const response = await axios
		.post(`http://localhost:8000/projects/${projectID}/hwsets`, hwSet, {
			headers: {
				Authorization: "Bearer " + auth,
				"Content-Type": "application/json"
			}
		})
		.catch((error) => {
			return null;
		});

	if (response == null) return null;

	return response.data;
}

async function joinProject(auth, projectID) {
	if (auth == null || auth === "") return null;
	if (projectID == null || projectID === "") return null;

	const response = await axios
		.post(`http://localhost:8000/projects/${projectID}/join`, {
			headers: {
				Authorization: "Bearer " + auth,
				"Content-Type": "application/json"
			}
		})
		.catch((error) => {
			return null;
		});

	if (response == null) return null;

	return response.data;
}

async function leaveProject(auth, projectID) {
	if (auth == null || auth === "") return null;
	if (projectID == null || projectID === "") return null;

	const response = await axios
		.post(`http://localhost:8000/projects/${projectID}/leave`, {
			headers: {
				Authorization: "Bearer " + auth,
				"Content-Type": "application/json"
			}
		})
		.catch((error) => {
			return null;
		});

	if (response == null) return null;

	return response.data;
}

async function checkInHWSet(auth, projectID, hwSetID, quantity) {
	if (auth == null || auth === "") return null;
	if (projectID == null || projectID === "") return null;
	if (hwSetID == null || hwSetID === "") return null;

	const response = await axios
		.post(
			`http://localhost:8000/projects/${projectID}/hwsets/${hwSetID}/checkin`,
			{
					quantity: quantity
			},
			{
				headers: {
					Authorization: "Bearer " + auth,
					"Content-Type": "application/json"
				}
			}
		)
		.catch((error) => {
			window.alert(error.response.data.message)
			return null;
		});

	if (response == null) return null;

	return response.data;
}

async function checkOutHWSet(auth, projectID, hwSetID, quantity) {
	if (auth == null || auth === "") return null;
	if (projectID == null || projectID === "") return null;
	if (hwSetID == null || hwSetID === "") return null;

	console.log(quantity);

	const response = await axios
		.post(
			`http://localhost:8000/projects/${projectID}/hwsets/${hwSetID}/checkout`,
			{
					quantity: quantity
			},
			{
				headers: {
					Authorization: "Bearer " + auth,
					"Content-Type": "application/json"
				}
			}
		)
		.catch((error) => {
			window.alert(error.response.data.message)
			return null;
		});

	if (response == null) return null;

	return response.data;
}

export {
	getProjects,
	getAbsentProjects,
	getProject,
	newProject,
	getHWSets,
	newHWSet,
	joinProject,
	leaveProject,
	checkInHWSet,
	checkOutHWSet
};
