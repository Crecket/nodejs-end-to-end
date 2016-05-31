import React  from 'react';
import RsaKey from '../components/RsaKey.jsx';

import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {grey900, grey800} from 'material-ui/styles/colors';

const styles = {
    paper: {
        display: 'inline-block',
        width: '100%',
        padding: 20,
    },
};

class AesKey extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };

    componentDidMount() {
    };

    componentWillUnmount() {
    };

    render() {
        log('Aes key', this.props.aesKeyData);
        return (
            <div className="col-xs-12">
                <div className="box-row">
                </div>
            </div>
        );
    };
}


export default AesKey;