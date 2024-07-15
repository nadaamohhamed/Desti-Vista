import { useRef, useState, useCallback, useEffect } from "react";

import Places from "./Places.jsx";
import Modal from "./Modal.jsx";
import DeleteConfirmation from "./DeleteConfirmation.jsx";
import AvailablePlaces from "./AvailablePlaces.jsx";
import Error from "./Error.jsx";

import logoImg from "../assets/logo.png";
import { fetchUserPlaces, updateUserPlaces } from "../api/http.js";

function App() {
	const selectedPlace = useRef();

	const [userPlaces, setUserPlaces] = useState([]);

	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();
	const [isFetching, setIsFetching] = useState(false);
	const [error, setError] = useState();

	useEffect(() => {
		async function fetchPlaces() {
			setIsFetching(true);
			try {
				const places = await fetchUserPlaces();
				setUserPlaces(places);
			} catch (error) {
				setError({
					message: error.message || "An error has occurred, try again later.",
				});
			}
			setIsFetching(false);
		}
		fetchPlaces();
	}, []);

	function handleStartRemovePlace(place) {
		setModalIsOpen(true);
		selectedPlace.current = place;
	}

	function handleStopRemovePlace() {
		setModalIsOpen(false);
	}

	async function handleSelectPlace(selectedPlace) {
		// optimistic updating (set first, then rollback if failed)
		setUserPlaces((prevPickedPlaces) => {
			if (!prevPickedPlaces) {
				prevPickedPlaces = [];
			}
			if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
				return prevPickedPlaces;
			}
			return [selectedPlace, ...prevPickedPlaces];
		});
		try {
			await updateUserPlaces([selectedPlace, ...userPlaces]);
		} catch (error) {
			// reset to old places, rollback
			setUserPlaces(userPlaces);

			setErrorUpdatingPlaces({
				message: error.message || "Failed to update places.",
			});
		}
	}

	const handleRemovePlace = useCallback(
		async function handleRemovePlace() {
			setUserPlaces((prevPickedPlaces) =>
				prevPickedPlaces.filter(
					(place) => place.id !== selectedPlace.current.id
				)
			);
			try {
				await updateUserPlaces(
					userPlaces.filter((place) => place.id !== selectedPlace.current.id)
				);
			} catch (error) {
				setUserPlaces(userPlaces);
				setErrorUpdatingPlaces({
					message: error.message || "Failed to delete places.",
				});
			}
			setModalIsOpen(false);
		},
		[userPlaces]
	);

	function handlerError() {
		setErrorUpdatingPlaces(null);
	}

	return (
		<>
			<Modal open={errorUpdatingPlaces} onClose={handlerError}>
				{errorUpdatingPlaces && (
					<Error
						title={"An error occurred."}
						message={errorUpdatingPlaces.message}
						onConfirm={handlerError}
					/>
				)}
			</Modal>

			<Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
				<DeleteConfirmation
					onCancel={handleStopRemovePlace}
					onConfirm={handleRemovePlace}
				/>
			</Modal>

			<header>
				<img src={logoImg} alt='Stylized globe' />
				<h1>PlacePicker</h1>
				<p>
					Create your personal collection of places you would like to visit or
					you have visited.
				</p>
			</header>
			<main>
				{error && (
					<Error title={"An error occurred."} message={error.message} />
				)}
				{!error && (
					<Places
						title="I'd like to visit ..."
						fallbackText='Select the places you would like to visit below.'
						places={userPlaces}
						isLoading={isFetching}
						onSelectPlace={handleStartRemovePlace}
					/>
				)}

				<AvailablePlaces onSelectPlace={handleSelectPlace} />
			</main>
		</>
	);
}

export default App;
