// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Use your own NASA API key instead of DEMO_KEY for regular use.
const apiKey = 'DEMO_KEY';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Fetch the APOD images for the selected date range.
async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;
	const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

	gallery.innerHTML = '<p>Loading space images...</p>';

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error('NASA API request failed');
		}

		const images = await response.json();
		displayImages(images);
	} catch (error) {
		gallery.innerHTML = '<p>Unable to load space images. Please try again.</p>';
		console.error(error);
	}
}

// Add each APOD result to the gallery.
function displayImages(images) {
	gallery.innerHTML = '';

	images.forEach((image) => {
		if (image.media_type !== 'image') {
			return;
		}

		const galleryItem = document.createElement('article');
		galleryItem.className = 'gallery-item';

		const imageElement = document.createElement('img');
		imageElement.src = image.hdurl || image.url;
		imageElement.alt = image.title;

		const title = document.createElement('h2');
		title.textContent = image.title;

		const date = document.createElement('p');
		date.textContent = image.date;

		const explanation = document.createElement('p');
		explanation.textContent = image.explanation;

		galleryItem.append(imageElement, title, date, explanation);
		gallery.appendChild(galleryItem);
	});
}

button.addEventListener('click', getSpaceImages);
