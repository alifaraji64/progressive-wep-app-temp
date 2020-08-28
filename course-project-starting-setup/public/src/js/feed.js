var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
	createPostArea.style.display = 'block';
	if (deferredPrompt) {
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then((choice) => {
			if (choice.outcome == 'dismissed') {
				//user rejected our app to be in his homescreen
				console.log('cancelled');
			} else {
				// if user accepted our app in homescreen
				console.log('accepted');
			}
		});
	}
}

function closeCreatePostModal() {
	createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
function createCard() {
	var cardWrapper = document.createElement('div');
	cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
	cardWrapper.style.margin = 'auto';
	var cardTitle = document.createElement('div');
	cardTitle.className = 'mdl-card__title';
	cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
	cardTitle.style.backgroundSize = 'cover';
	cardTitle.style.height = '180px';
	cardTitle.style.color = 'red';
	cardWrapper.appendChild(cardTitle);
	var cardTitleTextElement = document.createElement('h2');
	cardTitleTextElement.className = 'mdl-card__title-text';
	cardTitleTextElement.textContent = 'San Francisco Trip';
	cardTitle.appendChild(cardTitleTextElement);
	var cardSupportingText = document.createElement('div');
	cardSupportingText.className = 'mdl-card__supporting-text';
	cardSupportingText.textContent = 'In San Francisco';
	cardSupportingText.style.textAlign = 'center';
	//adding button
	var cardSaveButton = document.createElement('button');
	cardSaveButton.innerHTML = 'save';
	cardSaveButton.addEventListener('click', (e) => {
		console.log('clicked');
		//check if caches are supported in that browser
		if ('caches' in window) {
			//we are going to add the image to cache when user clicks to save btn
			caches.open('user-requested').then((cache) => {
				cache.add('https://httpbin.org/get');
				cache.add('./src/images/sf-boat.jpg');
			});
		}
	});
	//cardSupportingText.appendChild(cardSaveButton);
	cardWrapper.appendChild(cardSupportingText);
	componentHandler.upgradeElement(cardWrapper);
	sharedMomentsArea.appendChild(cardWrapper);
}

let URL = 'https://httpbin.org/get';
let isRecievedFromWeb = false;

// we are doing the 'cache then network strategy'

if ('caches' in window) {
	caches
		.match(URL)
		.then((res) => {
			//url is in the cache so we are going to return it
			if (res) {
				return res.json();
			}
		})
		.then((data) => {
			console.log('from cache');
			if (!isRecievedFromWeb) {
				sharedMomentsArea.innerHTML = '.';
				createCard();
				console.log('creating from cache');
			}
		});
}

fetch(URL)
	.then(function (res) {
		return res.json();
	})
	.then(function (data) {
		isRecievedFromWeb = true;
		console.log('from web data');
		sharedMomentsArea.innerHTML = '.';
		createCard();
	});
