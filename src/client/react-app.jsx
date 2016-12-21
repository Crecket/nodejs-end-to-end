import React from 'react';
import ReactDOM  from 'react-dom';
import injectTapEventPlugin  from 'react-tap-event-plugin';
// main app
import Main from './app/Main.jsx';

console.log(process.env.NODE_ENV);

// injection, required for materialze tap events
injectTapEventPlugin();

// render the react app
ReactDOM.render(
    <Main />,
    document.getElementById('app')
);

info('Mounted react succesfully');
