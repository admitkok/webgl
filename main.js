import './style.css';
import { DragGesture } from '@use-gesture/vanilla';
import App from './App';

const app = new App();


const el = document.querySelector('#canvas');
const gesture = new DragGesture(el, (state) => {
    app.onDrag(state, state.delta[0]);
});
// window.addEventListener('pointermove', e => app.onMouseMove(e))