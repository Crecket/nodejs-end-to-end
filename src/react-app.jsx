import  React  from '../node_modules/react';
import ReactDOM  from '../node_modules/react-dom';

import injectTapEventPlugin  from '../node_modules/react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

// get the dark theme
const lightTheme = getMuiTheme(lightBaseTheme);

// include jquery
require('script!jquery');

// main app
import Main from './app/Main.jsx';

// injection, required for materialze
injectTapEventPlugin();

// render the react app
ReactDOM.render(
    <MuiThemeProvider muiTheme={lightTheme}><Main /></MuiThemeProvider>,
    document.getElementById('app')
);

info('Mounted react succesfully');
