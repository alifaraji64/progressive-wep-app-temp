'use strict';
// service workers are making our app offline ready.performing
// functionolities like push notifications or background sync.
// service workers are also javascript but it is also runs on seperate single thread and
// decoupled from html and unlike normal js service workers can manage all pages of given scope.
// keep living after pages have been closed and they can not manipulate dom elements
// they are listening and reacting to events
// listenable events in service workers
// 1-fetch
// 2-push notifications
// 3-notification interaction when user click to that notification
// 4-background sync:whe user has a bad connection or if he is offline and if he made a change or added a post we can save
// the change with service workers and execute it when conneciton is stablished
// 5-service worker lifesycle: 1-install event 2-activate event(service worker will be active if there is not another instance of it running)
// in install event when we are refreshing the page it will check for the sw.js file if it is the same then this event will not be triggered
// when it is active it can control all pages of scope
// service worker file should be in the root folder
// service worker only works on https
// service worker are independent from manifest.json
// *** if you have changed anything in your service worker file you have to close
//     that tab and open another one becuase activate event cannot run if another
//      instance of sw already exists ***
/* SERVICE WORKER LIFECYCLE=> 1-REGISTER 2-INSTALL 3-ACTIVATE 4-IDLE 5-FETCH */
// install and activate events are triggered by browser
// but fetch event activated by your website

//for any change in any file(except sw.js) you should update this variable
let CACHE_STATIC_NAME = 'static-v17';
let CACHE_DYNAMIC_NAME = 'dynamic-v2';

self.addEventListener('install', (e) => {
	console.log('service worker installed', e);
	//this method will create a new cache. if that cache already exists it will open it
	e.waitUntil(
		caches.open(CACHE_STATIC_NAME).then((cache) => {
			console.log('precaching app shell');
			//this will make a request to that ROUTE(NOT PATH) and download it and save it in the cache
			cache.addAll([
				'/',
				'./index.html',
				'./offline.html',
				'./src/js/app.js',
				'./src/js/feed.js',
				'./src/js/material.min.js',
				'./src/css/app.css',
				'./src/css/feed.css',
				'./src/images/main-image.jpg',
				'https://fonts.googleapis.com/css?family=Roboto:400,700',
				'https://fonts.googleapis.com/icon?family=Material+Icons',
				'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
			]);
		})
	);
});

self.addEventListener('activate', (e) => {
	console.log('service workeracrtivated', e);
	// best place for deleting the older versions of caches
	e.waitUntil(
		caches.keys().then((keyArray) => {
			return Promise.all(
				keyArray.map((key) => {
					if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
						console.log('removing the old cache');
						return caches.delete(key);
					}
				})
			);
		})
	);
});

// this function will fire when we are using some third party api for fetch icons,fonts and our
// own fetch methods
let allowed = false;
if (allowed) {
	self.addEventListener('fetch', (e) => {
		//with this statement we are skipping the requests that is made with chrome extension
		if (e.request.url.indexOf('http') === 0 || e.request.url.indexOf('https') === 0) {
			e.respondWith(
				// if the asset is in the cache we are going to retrieve it
				caches.match(e.request).then((res) => {
					//when we are checking the cache if there is another(new version)(for each change in feed.js a new version) of that specific
					//service worker will fetch the older version!! so we have to clean the older versions
					// and if it is not we are going to fetch it with a fetch request
					if (res) {
						return res;
						console.log('returning the stuff that is already in cache');
					} else {
						//if the data is not stored in cahce we are going to add it to the cache dynamically
						return fetch(e.request)
							.then((resp) => {
								//creating another cache for PUTTING!! dynamic caches
								return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
									//instead of cache.add we are going to use cache.put
									//cache.add makes an http request to that url but cache.put
									//is saving the data that i have (with making http earlier)
									cache.put(
										e.request.url,
										resp.clone() /* it create a clone of response becuase it is empty in the beginning*/
									);
									return resp;
								});
								//with this catch method we are going to serve the offline.html
								//page if user wants to visit a page that is not in cache
							})
							.catch((err) => {
								return caches.open(CACHE_STATIC_NAME).then((cache) => {
									//get something from cache with match command
									return cache.match('./offline.html');
								});
							});
					}
				})
			);
		}
	});
}
// CACHE_API
//KEY => REQUEST
//VALUE => RESPONSE
//after adding any file to cache our app not going to make an http request
//for retrieve it will save that app in cache and fetch whenever it needed
// !!CACHE_API
//handling cache before network strategy ***!!!!
self.addEventListener('fetch', (e) => {
	e.respondWith(
		caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
			return fetch(e.request).then((res) => {
				cache.put(e.request, res.clone());
				return res;
			});
		})
	);
});
