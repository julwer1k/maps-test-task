import { type Libraries, useJsApiLoader } from '@react-google-maps/api'
import { ref, remove } from 'firebase/database'
import React, { useCallback, useState } from 'react'
import classNames from 'classnames'
import { database } from '../configs/firebaseConfig'
import styles from './App.module.scss'
import { Map, MODES } from '../components/Map'
import type { ICoordinates, IMarker } from '../types/Marker'

const API_KEY = process.env.REACT_APP_API_KEY

const defaultCenter: ICoordinates = {
	lat: 34.098907,
	lng: -118.327759,
}

const libraries = ['places'] as Libraries

export const App = () => {
	const [maxMarkerId, setMaxMarkerId] = useState<number>(0)
	const [isActiveMode, setIsActiveMode] = useState(false)
	const [mode, setMode] = useState(MODES.MOVE)
	const [markers, setMarkers] = useState<IMarker[]>([])

	const { isLoaded, loadError } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: API_KEY || '1',
		libraries,
	})

	const onMarkerAdd = useCallback((marker: IMarker): void => {
		setMarkers((prevMarkers) => {
			return [...prevMarkers, marker]
		})
	}, [])

	const toggleMode = useCallback(() => {
		setMode((prevMode) => {
			return (prevMode === MODES.MOVE ? MODES.SET_MARKER : MODES.MOVE)
		})
		setIsActiveMode(!isActiveMode)
	}, [isActiveMode])


	if (loadError) {
		return <div>Error loading maps</div>
	}

	if (!isLoaded) {
		return <div>Loading...</div>
	}

	const handleClearMarkers = () => {
		setMarkers([])
		setMaxMarkerId(0)

		const questsRef = ref(database, 'quests');

		remove(questsRef)
			.then(() => {
				console.log('Markers successfully removed from Firebase');
			})
			.catch((error) => {
				console.error('Error removing markers from Firebase: ', error);
			});
	}

	return (
		<>
			<div className={styles.searchContainer}>
				<button
					className={classNames(styles.modeToggle, styles.button, {
						[styles.modeToggleActive]: isActiveMode,
					})} onClick={toggleMode}
				>Set Markers
				</button>
				<button className={styles.button} onClick={handleClearMarkers}>Clear All Markers</button>

			</div>
			<Map
				center={defaultCenter}
				markers={markers}
				mode={mode}
				onMarkerAdd={onMarkerAdd}
				setMarkers={setMarkers}
				maxMarkerId={maxMarkerId}
				setMaxMarkerId={setMaxMarkerId}
			/>
		</>
	)
}