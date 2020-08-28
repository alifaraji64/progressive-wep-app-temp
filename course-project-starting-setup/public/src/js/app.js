let deferredPrompt;
if ('serviceWorker' in navigator) {
	// if the browser of the user has the service worker (it is supported)
	navigator.serviceWorker
		.register('/sw.js')
		.then(() => {
			console.log('service worker registered');
		})
		.catch(() => {
			console.log('an error occured');
		});
}
// this event will fire when chrome wants to show the banner
// we can just show the banner with a user gesture like click to somewhere
window.addEventListener('beforeinstallprompt', (e) => {
	console.log('banner fired');
	deferredPrompt = e;
});
