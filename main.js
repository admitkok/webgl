import './style.css';
import { DragGesture } from '@use-gesture/vanilla';
import App from './App';

const app = new App();

// const button = document.querySelector('.button');
// button.addEventListener('click', () => {
//     app.changeVersion();
// });

const el = document.querySelector('#canvas');
const gesture = new DragGesture(el, (state) => {
    app.onDrag(state, state.delta[0]);
});
// window.addEventListener('pointermove', e => app.onMouseMove(e))