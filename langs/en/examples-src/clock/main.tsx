import { render } from 'solid-js/web';
import { Clock } from './Clock';
import './styles.css';

render(() => <Clock />, document.getElementById('app')!);
