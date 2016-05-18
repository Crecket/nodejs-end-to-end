import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin  from 'react-tap-event-plugin';
injectTapEventPlugin();

var Main = require('./app/Main.jsx');
ReactDOM.render(
    <Main/>,
    document.getElementById('app')
);

info('Mounted react succesfully');