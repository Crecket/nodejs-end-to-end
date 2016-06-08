import React  from 'react';
import RsaKey from './components/RsaKey.jsx';

import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {blue100, cyanA400, lightBlue500} from 'material-ui/styles/colors';

const styles = {
    paper: {
        display: 'inline-block',
        width: '100%',
        padding: 20,
    },
};

class Settings extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };

    // react function to test if props and/or state have changed
    shouldComponentUpdate(nextProps, nextState) {
        // check if state has changed
        if (JSON.stringify(this.state) !== JSON.stringify(nextState) || JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
        return false;
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
                    <Card className="box-row">
                        <CardHeader
                            title="Settings"
                            style={{background: cyanA400}}
                            actAsExpander={true}
                            showExpandableButton={true}
                        />
                        <CardText
                            expandable={true}
                            style={{background: lightBlue500}}
                        >
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
                                                            onClick={this.props.refreshEncryptionKeys}
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
                                                            onClick={this.props.refreshSigningKeys}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </Paper>
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


export default Settings;