import './style.css';
import App from './App';

const app = new App();

const button = document.querySelector('.button');
button.addEventListener('click', () => {
    app.changeVersion();
});
