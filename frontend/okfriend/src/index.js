import React from 'react';
import ReactDOM from 'react-dom';
import { ActionCableProvider } from 'react-actioncable-provider';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { API_WS_ROOT } from './constants';
import { BrowserRouter as Router } from 'react-router-dom'


ReactDOM.render(
    <ActionCableProvider url={API_WS_ROOT}>
        <Router>
            <App />
        </Router>
    </ActionCableProvider>, document.getElementById('root'));

serviceWorker.register();
