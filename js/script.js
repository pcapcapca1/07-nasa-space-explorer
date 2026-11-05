// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Fetch the APOD images for the selected date range.
async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;
	const todayDate = new Date();
	const selectedEndDate = new Date(`${endDate}T00:00:00`);
	const daysFromToday = Math.max(0, Math.floor((todayDate - selectedEndDate) / 86400000));
	const pageNumber = Math.floor(daysFromToday / 100) + 1;
	const apiBaseUrl = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic';

	gallery.innerHTML = '<p>Loading space images...</p>';

	try {
		// Fetch two nearby pages in case the selected dates cross a page boundary.
		const pageUrls = [pageNumber, pageNumber + 1].map((page) =>
			`${apiBaseUrl}?per_page=100&page=${page}`
		);
		const responses = await Promise.all(pageUrls.map((url) => fetch(url)));
		const pageData = await Promise.all(responses.map(async (response) => {
			if (!response.ok) {
				throw new Error('NASA APOD request failed');
			}
			return response.json();
		}));
		const images = pageData.flat().filter((image) => image.date >= startDate && image.date <= endDate);

		displayImages(images);
	} catch (error) {
		gallery.innerHTML = '';
		const errorMessage = document.createElement('p');
		errorMessage.textContent = `Unable to load space images: ${error.message}`;
		gallery.appendChild(errorMessage);
		console.error(error);
	}
}

// Add each APOD result to the gallery.
function displayImages(images) {
	gallery.replaceChildren();
	let imageCount = 0;

	images.forEach((image) => {
		const imageUrl = image.hdurl || image.url || '';
		const isNasaFallback = image.title === 'NASA Science' && imageUrl.includes('nasa-logo');

		if (image.media_type !== 'image' || isNasaFallback) {
			return;
		}

		imageCount += 1;

		const galleryItem = document.createElement('article');
		galleryItem.className = 'gallery-item';

		const imageElement = document.createElement('img');
		imageElement.src = imageUrl;
		imageElement.alt = image.title;

		const title = document.createElement('h2');
		title.textContent = image.title;

		const date = document.createElement('p');
		date.textContent = image.date;

		galleryItem.append(imageElement, title, date);
		galleryItem.tabIndex = 0;
		galleryItem.setAttribute('role', 'button');
		galleryItem.addEventListener('click', () => openModal(image));
		galleryItem.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				openModal(image);
			}
		});
		gallery.appendChild(galleryItem);
	});

	if (imageCount === 0) {
		gallery.innerHTML = '<p>No space images were found for these dates.</p>';
	}
}

// Show the selected APOD with its full explanation.
function openModal(image) {
	modalImage.src = image.hdurl || image.url;
	modalImage.alt = image.title;
	modalTitle.textContent = image.title;
	modalDate.textContent = image.date;
		modalExplanation.textContent = getPlainText(image.explanation) || 'No explanation is available for this image.';
	imageModal.hidden = false;
}

function getPlainText(htmlText) {
	const textContainer = document.createElement('div');
	textContainer.innerHTML = htmlText || '';
	return textContainer.textContent.trim();
}

function closeModal() {
	imageModal.hidden = true;
	modalImage.src = '';
}

button.addEventListener('click', getSpaceImages);
closeModalButton.addEventListener('click', closeModal);
imageModal.addEventListener('click', (event) => {
	if (event.target === imageModal) {
		closeModal();
	}
});
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && !imageModal.hidden) {
		closeModal();
	}
});
