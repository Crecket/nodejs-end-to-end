import React  from '../node_modules/react';
import ReactDOM  from '../node_modules/react-dom';
import injectTapEventPlugin  from '../node_modules/react-tap-event-plugin';

require('script!jquery');

import Main from './app/Main.jsx';

injectTapEventPlugin();

ReactDOM.render(
    <Main />,
    document.getElementById('app')
);

info('Mounted react succesfully');
