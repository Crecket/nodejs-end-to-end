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
                    
                </div>
            </div>
        );
    };
}


export default AesKeys;