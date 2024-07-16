import { useState, useEffect } from "react";
import Places from "./Places.jsx";
import Error from "./Error.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../api/http.js";

export default function AvailablePlaces({ onSelectPlace }) {
	const [availablePlaces, setAvailablePlaces] = useState([]);
	const [isFetching, setIsFetching] = useState(false);
	const [error, setError] = useState();

	useEffect(() => {
		async function fetchData() {
			setIsFetching(true);

			try {
				const places = await fetchAvailablePlaces();

				navigator.geolocation.getCurrentPosition((position) => {
					const sortedPlaces = sortPlacesByDistance(
						places,
						position.coords.latitude,
						position.coords.longitude
					);
					setAvailablePlaces(sortedPlaces);
					setIsFetching(false);
				});
			} catch (error) {
				setError({
					message: error.message || "An error has occurred, try again later.",
				});
			}

			setIsFetching(false);
		}

		fetchData();
	}, []);

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
