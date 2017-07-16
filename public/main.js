document.addEventListener('DOMContentLoaded', () => {
  try {
    const firebaseApp = firebase.app();
    const features = ['auth', 'database'].filter(feature => typeof firebaseApp[feature] === 'function');
    console.debug(`Firebase SDK loaded with ${features.join(', ')}`);
    new App(firebaseApp, document.getElementById('app'), window);
  } catch (e) {
    console.error(e);
  }
});
