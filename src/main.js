import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api';
const galleryContainer = document.querySelector('.gallery');
const loader = document.querySelector('.loader');

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.form').addEventListener('submit', function (event) {
    event.preventDefault();

    loader.style.display = 'block';

    const searchQuery = document.querySelector('.input').value;
    searchImages(searchQuery);
  });
});

function searchImages(query) {
  const searchParams = {
    key: '41530173-f95b78bdec41263a85620f647',
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
  };

  fetch(`${BASE_URL}/?${new URLSearchParams(searchParams)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then(data => {
      loader.style.display = 'none';
      loader.classList.remove('loader--active');

      displayImages(data.hits);
    })
    .catch(() => {
      loader.style.display = 'none';
      loader.classList.remove('loader--active');

      showErrorToast();
    });

  function displayImages(images) {
    galleryContainer.innerHTML = '';

    if (images.length > 0) {
      const imageCards = images.map(image => {
        const card = document.createElement('div');
        card.classList.add('card');

        const largeImageLink = document.createElement('a');
        largeImageLink.href = image.largeImageURL;
        largeImageLink.dataset.lightbox = 'gallery';
        largeImageLink.setAttribute('data-title', image.tags);

        const img = document.createElement('img');
        img.src = image.webformatURL;
        img.alt = image.tags;

        largeImageLink.appendChild(img);

        card.appendChild(largeImageLink);

        const details = document.createElement('div');
        details.classList.add('details');

        const likes = document.createElement('p');
        likes.textContent = `Likes: ${image.likes}`;
        details.appendChild(likes);

        const views = document.createElement('p');
        views.textContent = `Views: ${image.views}`;
        details.appendChild(views);

        const comments = document.createElement('p');
        comments.textContent = `Comments: ${image.comments}`;
        details.appendChild(comments);

        const downloads = document.createElement('p');
        downloads.textContent = `Downloads: ${image.downloads}`;
        details.appendChild(downloads);

        card.appendChild(details);

        return card;
      });

      galleryContainer.append(...imageCards);

      const lightbox = new SimpleLightbox('.gallery a', {});
      lightbox.refresh();
    } else {
      showNoImagesFoundToast();
    }
  }
}

function showErrorToast() {
  iziToast.error({
    title: 'Error',
    message: 'An error occurred. Please try again later.',
  });
}

function showNoImagesFoundToast() {
  iziToast.info({
    title: 'No Images Found',
    message:
      'Sorry, there are no images matching your search query. Please try again!',
  });
}