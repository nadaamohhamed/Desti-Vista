import Places from "./Places.jsx";
import Error from "./Error.jsx";

import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../api/http.js";
import { useFetch } from "../hooks/useFetch.js";

async function fetchData() {
	const places = await fetchAvailablePlaces();

	return new Promise((resolve) => {
		navigator.geolocation.getCurrentPosition((position) => {
			const sortedPlaces = sortPlacesByDistance(
				places,
				position.coords.latitude,
				position.coords.longitude
			);
			resolve(sortedPlaces);
		});
	});
}

export default function AvailablePlaces({ onSelectPlace }) {
	const {
		fetchedData: availablePlaces,
		isFetching,
		error,
	} = useFetch(fetchData, []);

	return (
		<>
			{error && <Error title={"An error occurred."} message={error.message} />}
			{!error && (
				<Places
					title='Available destinations'
					places={availablePlaces}
					isLoading={isFetching}
					fallbackText='No destinations available.'
					onSelectPlace={onSelectPlace}
				/>
			)}
		</>
	);
}
