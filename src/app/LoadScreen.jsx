import React  from 'react';

import CircularProgress from 'material-ui/CircularProgress';


class LoadScreen extends React.Component {
    render() {
        var inlineStyle = {
            color: 'white',
            align: 'center'
        };
        return (
            <div>
                <CircularProgress size={1.5}/>
                <p>No connection to the server</p>
            </div>
        );
    };
}

export default LoadScreen;