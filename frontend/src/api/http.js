import * as API from "./API.js";

export async function fetchAvailablePlaces() {
	var response = await fetch(`${API.baseUrl}${API.places}`);
	var resData = await response.json();
	if (!response.ok) {
		throw Error("Failed to fetch destinations.");
	}
	return resData.places;
}

export async function fetchUserPlaces() {
	var response = await fetch(`${API.baseUrl}${API.userPlaces}`);
	var resData = await response.json();
	if (!response.ok) {
		throw Error("Failed to fetch user destinations.");
	}
	return resData.places;
}

export async function updateUserPlaces(places) {
	var response = await fetch(`${API.baseUrl}${API.userPlaces}`, {
		method: "PUT",
		body: JSON.stringify({ places }),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const resData = await response.json();
	if (!response.ok) {
		throw new Error("Failed to update user data.");
	}
	return resData.message;
}
