import React  from 'react';
import RsaKey from '../components/RsaKey.jsx';
import AesKey from '../components/AesKey.jsx';

import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {grey900, grey800} from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';

const styles = {
    paper: {
        display: 'inline-block',
        width: '100%',
        padding: 20,
    },
    cardText: {
        transition: transitions.create('max-height', '800ms', '0ms', 'ease-in-out'),
    }
};

class AesKeyCollection extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            expand: false
        };
    };

    componentDidMount() {
    };

    componentWillUnmount() {
    };

    render() {
        log('Aes key', this.props.userKey);

        // https://github.com/callemall/material-ui/blob/master/docs/src/app/components/CodeExample/CodeBlock.js

        // easier handling
        var Username = this.props.userKey.rsa_keys.username;
        var AesKeyVar = this.props.userKey.key;
        var PublicKey = this.props.userKey.rsa_keys.public_key;
        var PublicKeySign = this.props.userKey.rsa_keys.public_key_sign;

        return (
            <div className="col-xs-12">
                <div className="box-row">
                    <Card className="box-row">
                        <CardHeader
                            style={{backgroundColor: grey900}}
                            title={Username}
                            actAsExpander={true}
                            showExpandableButton={true}
                        />
                        <CardText expandable={true} style={styles.cardText}>
                            <div className="row">

                                <div className="col-xs-12">
                                    <div className="box-row">
                                        <div className="row">

                                            <div className="col-xs-12">
                                                <div className="box-row">
                                                    <Subheader>Private decryption key</Subheader>
                                                    <AesKey nameTag={Username + "aesKey"}
                                                            aesKey={AesKeyVar}/>
                                                </div>
                                            </div>

                                            <div className="col-xs-12 col-sm-6">
                                                <div className="box-row">
                                                    <Subheader>Public Encryption Key</Subheader>
                                                    <RsaKey nameTag={Username + "publicEncryptionKey"}
                                                            rsaKey={PublicKey}/>
                                                </div>
                                            </div>

                                            <div className="col-xs-12 col-sm-6">
                                                <div className="box-row">
                                                    <Subheader>Public Verification Key</Subheader>
                                                    <RsaKey nameTag={Username + "publicVerificationKey"}
                                                            rsaKey={PublicKeySign}/>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                            </div>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    };
}


export default AesKeyCollection;