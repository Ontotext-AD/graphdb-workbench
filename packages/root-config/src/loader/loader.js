// Alternative possible solution inspired by https://github.com/frehner/singlespa-transitions/blob/master/index.js

let loadingDiv;

export function bootstrap() {
  return Promise
    .resolve()
    .then(() => {
      console.log('Bootstrapping Loader from external file');
      loadingDiv = document.createElement('div');
      loadingDiv.id = 'loading-div';
      loadingDiv.style.position = 'fixed';
      loadingDiv.style.top = '0';
      loadingDiv.style.left = '0';
      loadingDiv.style.width = '100%';
      loadingDiv.style.height = '100%';
      loadingDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      loadingDiv.style.display = 'flex';
      loadingDiv.style.justifyContent = 'center';
      loadingDiv.style.alignItems = 'center';
      loadingDiv.style.zIndex = '9999';

      const loaderImage = document.createElement('img');
      loaderImage.src = '../img/graphdb-splash.svg';
      loaderImage.alt = 'Loading...';
      loaderImage.style.width = 'auto';
      loaderImage.style.height = 'auto';
      loadingDiv.appendChild(loaderImage);
      document.body.appendChild(loadingDiv);
    });
}

export function mount() {
  return Promise
    .resolve()
    .then(() => {
      console.log('Mounted Loader');
    });
}

export function unmount() {
  return Promise
    .resolve()
    .then(() => {
      if (loadingDiv) {
        loadingDiv.remove();
      }
    });
}
