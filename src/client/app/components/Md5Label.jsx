import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import CryptoHelper from '../../js/CryptoHelper';

import Subheader from 'material-ui/Subheader';

class Md5Label extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };

    render() {
        var md5Hash = CryptoHelper.MD5(this.props.MD5Val);
        return (
            <Subheader name={this.props.nameTag}>Checksum: {md5Hash}</Subheader>
        );
    };
}


// give theme context
Md5Label.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default muiThemeable()(Md5Label);
