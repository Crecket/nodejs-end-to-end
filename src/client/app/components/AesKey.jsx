import React  from 'react';

import TextField from 'material-ui/TextField';

const styles = {
    textarea: {
        width: '100%'
    },
};

class Debug extends React.Component {
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


export default Debug;