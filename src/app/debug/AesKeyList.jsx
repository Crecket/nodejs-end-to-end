import React  from 'react';
import AesKey from './AesKey.jsx';

import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';

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

    render() {
        log('Refreshing aes key list');
        log(this.props.userKeys);
        var fn = this;
        return (
            <div className="col-xs-12">
                <div className="box-row">
                    <Paper style={styles.paper}>
                        <Subheader>Stored AES keys</Subheader>
                        <div className="keylist">
                            {Object.keys(fn.props.userKeys).map(function (key) {
                                <AesKey aesKeyData={fn.props.userKeys[key]}/>
                            })}
                        </div>
                    </Paper>
                </div>
            </div>
        );
    };
}

export default AesKeys;