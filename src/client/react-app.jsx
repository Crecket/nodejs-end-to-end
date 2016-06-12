import React from 'react';
import ReactDOM  from 'react-dom';
import injectTapEventPlugin  from 'react-tap-event-plugin';
// main app
import Main from './app/Main.jsx';

// include jquery
require('script!jquery');

// injection, required for materialze tap events
injectTapEventPlugin();

// render the react app
ReactDOM.render(
    <Main />,
    document.getElementById('app')
);

info('Mounted react succesfully');
