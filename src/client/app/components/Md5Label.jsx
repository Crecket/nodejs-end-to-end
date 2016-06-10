import React  from 'react';

import Subheader from 'material-ui/Subheader';

class Md5Label extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };

    render() {
        let md5Hash = CryptoJS.MD5(this.props.MD5Val);
        return (
            <Subheader
                name={this.props.nameTag}
                value={md5Hash}
            />
        );
    };
}


export default Md5Label;