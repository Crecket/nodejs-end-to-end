import React  from 'react';

import CircularProgress from 'material-ui/CircularProgress';


class LoadScreen extends React.Component {
    render() {
        var inlineStyle = {
            color: 'white',
            textAlign: 'center',
        };

        return (
            <div style={inlineStyle}>
                <CircularProgress size={1.5}/>
                <p>{this.props.message}</p>
            </div>
        );
    };
}

export default LoadScreen;