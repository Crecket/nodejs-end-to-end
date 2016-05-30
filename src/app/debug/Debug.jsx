import React  from 'react';
import RsaKey from '../components/RsaKey.jsx';
import AesKeyList from './AesKeyList.jsx';

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

class Debug extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };

    componentDidMount() {
        var fn = this;
    };

    componentWillUnmount() {
        var fn = this;
    };

    render() {
        return (
            <div className="row">
                <div className="col-xs-12">
                    <Card className="box-row" style={{backgroundColor: ''}}>
                        <CardHeader
                            style={{backgroundColor: grey900}}
                            title="Settings"
                            actAsExpander={true}
                            showExpandableButton={true}
                        />
                        <CardText expandable={true}>
                            <div className="row">

                                <div className="col-xs-12">
                                    <div className="box-row">
                                        <Paper style={styles.paper}>
                                            <div className="row">

                                                <div className="col-xs-12 col-sm-6">
                                                    <div className="box-row">
                                                        <Subheader>Private decryption key</Subheader>
                                                        <RsaKey nameTag="privateDecryptionKey"
                                                                rsaKey={this.props.decryptionKey}/>
                                                    </div>
                                                </div>

                                                <div className="col-xs-12 col-sm-6">
                                                    <div className="box-row">
                                                        <Subheader>Public encryption key</Subheader>
                                                        <RsaKey nameTag="publicEncryptionKey"
                                                                rsaKey={this.props.encryptionKey}/>
                                                    </div>
                                                </div>

                                                <div className="col-xs-12">
                                                    <div className="box-row">
                                                        <RaisedButton
                                                            style={styles.inputs}
                                                            type="submit"
                                                            label="New encryption keypair"
                                                            primary={true}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </Paper>
                                    </div>
                                </div>

                                <div className="col-xs-12">
                                    <div className="box-row">
                                        <Paper style={styles.paper}>
                                            <div className="row">

                                                <div className="col-xs-12 col-sm-6">
                                                    <div className="box-row">
                                                        <Subheader>Private signing key</Subheader>
                                                        <RsaKey nameTag="privateSigningKey"
                                                                rsaKey={this.props.signingKey}/>
                                                    </div>
                                                </div>

                                                <div className="col-xs-12 col-sm-6">
                                                    <div className="box-row">
                                                        <Subheader>Public verification key</Subheader>
                                                        <RsaKey nameTag="publicVerificationKey"
                                                                rsaKey={this.props.verificationKey}/>
                                                    </div>
                                                </div>

                                                <div className="col-xs-12">
                                                    <div className="box-row">
                                                        <RaisedButton
                                                            style={styles.inputs}
                                                            type="submit"
                                                            label="New signing keypair"
                                                            primary={true}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </Paper>
                                    </div>
                                </div>

                                <AesKeyList userKeys={this.props.userKeys}/>

                            </div>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    };
}


export default Debug;