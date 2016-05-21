import React  from '../node_modules/react';
import ReactDOM  from '../node_modules/react-dom';

import injectTapEventPlugin  from '../node_modules/react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import {grey800, deepPurple900, blueGrey900, blueGrey500, lightGreenA700, indigoA700, redA700, red800} from 'material-ui/styles/colors';

// get the dark theme
const darkTheme = getMuiTheme(darkBaseTheme);

// include jquery
require('script!jquery');

// main app
import Main from './app/Main.jsx';

// injection, required for materialze
injectTapEventPlugin();

// render the react app
ReactDOM.render(
    <MuiThemeProvider muiTheme={darkTheme}><Main /></MuiThemeProvider>,
    document.getElementById('app')
);

info('Mounted react succesfully');

// load the session keys
setTimeout(function () {
    // create new encryption key set on startup
    SessionHelper.newKeySet(function (keys) {
        updateChecksums();
    });
    // create new signing key set on startup
    SessionHelper.newKeySetSign(function (keys) {
        updateChecksums();
    });
}, 100);