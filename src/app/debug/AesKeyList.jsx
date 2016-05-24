import React  from 'react';
import RsaKey from '../components/RsaKey.jsx';

import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';

const styles = {
    paper: {
        display: 'inline-block',
        width: '100%',
        padding: 20,
    },
};

class AesKeys extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };

    componentDidMount() {
    };

    componentWillUnmount() {
    };

    render() {
        return (
            <div className="col-xs-12">
                <div className="box-row">
                    <Paper style={styles.paper}>
                        <h2>Stored AES keys</h2>
                        <p>
                            These are the AES keys stored on this client and the RSA keys that were used to verify these
                            AES keys.
                        </p>
                        <div id="stored_key_div"></div>
                    </Paper>
                </div>
            </div>
        );
    };
}


export default AesKeys;