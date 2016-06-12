import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import TextField from 'material-ui/TextField';

const styles = {
    textarea: {
        width: '100%'
    },
};

class AesKey extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };

    render() {
        return (
            <TextField
                className="monospace"
                name={this.props.nameTag}
                style={styles.textarea}
                value={this.props.aesKey}
                readOnly
            />
        );
    };
}

// give theme context
AesKey.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default muiThemeable()(AesKey);