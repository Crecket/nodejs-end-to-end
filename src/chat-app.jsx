var React = require('react');
var ReactDOM = require('react-dom');
import injectTapEventPlugin  from 'react-tap-event-plugin';
injectTapEventPlugin();

var NodeRSA = require('node-rsa');
var Main = require('./app/Main.jsx');

ReactDOM.render(
    <Main/>,
    document.getElementById('app')
);

info('Mounted react succesfully');
