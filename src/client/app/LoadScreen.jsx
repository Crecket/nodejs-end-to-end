import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import CircularProgress from 'material-ui/CircularProgress';


class LoadScreen extends React.Component {
    render() {
        var inlineStyle = {
            color: 'white',
            textAlign: 'center',
        };

        return (
            <div style={inlineStyle}>
                <CircularProgress size={15}/>
                <p>{this.props.message}</p>
            </div>
        );
    };
}

// give theme context
LoadScreen.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default muiThemeable()(LoadScreen);