import React  from '../node_modules/react';
import ReactDOM  from '../node_modules/react-dom';
import injectTapEventPlugin  from '../node_modules/react-tap-event-plugin';

// include jquery
require('script!jquery');

// init the theme
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// main app
import Main from './app/Main.jsx';

// injection, required for materialze
injectTapEventPlugin();

// render the react app
ReactDOM.render(
    <MuiThemeProvider muiTheme={getMuiTheme()}><Main /></MuiThemeProvider>,
    document.getElementById('app')
);

info('Mounted react succesfully');

// function serverInfo(info) {
//     log(info);
// }
//
// socket.on('server_info', serverInfo);
//
// setTimeout(function () {
//     socket.removeListener('server_info', serverInfo);
// }, 2000);