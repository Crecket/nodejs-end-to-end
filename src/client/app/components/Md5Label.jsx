import React  from 'react';

import Subheader from 'material-ui/Subheader';

class Md5Label extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };

    render() {
        var md5Hash = CryptoHelper.MD5(this.props.MD5Val);
        console.log(typeof md5Hash);
        return (
            <Subheader name={this.props.nameTag}>Checksum: {md5Hash}</Subheader>
        );
    };
}


export default Md5Label;