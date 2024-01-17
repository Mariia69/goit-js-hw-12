import axios from "axios";

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import simpleLightbox from "simplelightbox";

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = "https://pixabay.com/api/";
const API_KEY = '41701983-23ca5d5908e2c78927e8095f2';
const ITEMS_PER_PAGE = 40;

const lightbox = new SimpleLightbox(".gallery-item");

const getBaseUrl = () => {
  const url = new URL(BASE_URL);
  url.searchParams.append("key", API_KEY);
  url.searchParams.append("image_type", "photo");
  url.searchParams.append("orientation", "horizontal");
  url.searchParams.append("safesearch",true);

  return url;
};

const fetchImages = async (query, page = 1) => {
  try {
    const url = getBaseUrl();
    url.searchParams.append("q", query);
    url.searchParams.append("page", page);
    url.searchParams.append("per_page", ITEMS_PER_PAGE);

    const response = await axios.get(url.toString());
    return response.data.hits;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};

const renderGallery = (images) => {
  const galleryContainer = document.getElementById("gallery");
  galleryContainer.innerHTML = "";

  images.forEach((image) => {
    const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = image;

    galleryContainer.insertAdjacentHTML("beforeend", `
    <li class="gallery-item">
      <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}"/>
      </a>
      <div class="image-info">
        <p>Likes: ${likes}</p>
        <p>Views: ${views}</p>
        <p>Comments: ${comments}</p>
        <p>Downloads: ${downloads}</p>
      </div>
    </li>
    `);
  });

  lightbox.refresh();
};

const showLoadingIndicator = () => {
  document.getElementById("loader").style.display = "block";
};

const hideLoadingIndicator = () => {
  document.getElementById("loader").style.display = "none";
};

const showMessage = (message, type = "info") => {
  iziToast[type]({
    title: message,
    position: "topCenter",
  });
};

const handleSearchFormSubmit = async (event) => {
  event.preventDefault();
  const searchInput = document.getElementById("search-input");
  const query = searchInput.value.trim();

  if (query.length < 3) {
    showMessage("Please enter a search query with at least 3 characters", "warning");
    return;
  }

  showLoadingIndicator();

  try {
    const images = await fetchImages(query);
    hideLoadingIndicator();

    if (images.length > 0) {
      renderGallery(images);

      document.getElementById("load-more").style.display = images.length >= ITEMS_PER_PAGE ? "block" : "none";
    } else {
      showMessage("Sorry, there are no images matching your search query. Please try again.", "error");
    }
  } catch (error) {
    hideLoadingIndicator();
    showMessage("Error fetching images. Please try again later.", "error");
  }
};

const loadMoreImages = async () => {
  const searchInput = document.getElementById("search-input");
  const query = searchInput.value.trim();

  if (query.length < 3) {
    showMessage("Please enter a search query with at least 3 characters", "warning");
    return;
  }

  showLoadingIndicator();

  try {
    const images = await fetchImages(query, currentPage);

    hideLoadingIndicator();

    if (images.length > 0) {
      renderGallery(images);
      currentPage++;

      window.scrollBy(0, getCardHeight());
    } else {
      showMessage("No more images t load", "info");

      document.getElementById("load-more").style.display = "none";
    }
  } catch (error) {
    hideLoadingIndicator();
    showMessage("Error fetching images. Please try again later.", "error");
  }
};

const getCardHeight = () => {
  const firstCard = document.querySelector(".gallery-item");
  return firstCard ? firstCard.getBoundingClientRect().height : 0;
};

let currentPage = 1;

const searchForm = document.getElementById("form");
searchForm.addEventListener("submit", handleSearchFormSubmit);

const loadMoreButton = document.getElementById("load-more");
loadMoreButton.addEventListener("click", loadMoreImages);