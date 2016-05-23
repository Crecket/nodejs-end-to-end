import React  from 'react';

import RsaKey from '../components/RsaKey.jsx';

const style = {};

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

                <div class="col-xs-12">
                    <div class="box-row">
                        <p> Settings </p>

                        <div class="col-xs-12 col-sm-6">
                            <div class="row">
                                <label for="inputTarget">Private decryption key</label>
                                <RsaKey rsaKey={this.props.decryptionKey}/>
                            </div>
                        </div>

                        <div class="col-xs-12 col-sm-6">
                            <div class="row">
                                <label for="inputTarget">Public encryption key</label>
                                <RsaKey rsaKey={this.props.encryptionKey}/>
                            </div>
                        </div>

                        <div class="col-xs-12">
                            <div class="row">

                                <div class="col-xs-12">
                                    <div class="row">
                                        <a class="btn btn-warning col-xs-12" id="new_encryption_keypair">
                                            New encryption keypair <i class="fa fa-refresh"></i>
                                        </a>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div class="col-xs-12 col-sm-6">
                            <div class="row">
                                <label for="inputTarget">Private signing key</label>
                                <RsaKey rsaKey={this.props.signingKey}/>
                            </div>
                        </div>

                        <div class="col-xs-12 col-sm-6">
                            <div class="row">
                                <label for="inputTarget">Public verification key</label>
                                <RsaKey rsaKey={this.props.verificationKey}/>
                            </div>
                        </div>

                        <div class="col-xs-12">
                            <div class="row">
                                <div class="col-xs-12">
                                    <div class="row">
                                        <a class="btn btn-warning col-xs-12" id="new_encryption_sign_keypair">
                                            New signing keypair <i class="fa fa-refresh"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="col-xs-12">
                    <h2 class="color-white">Stored AES keys</h2>
                    <p class="color-white">
                        These are the AES keys stored on this client and the RSA keys that were used to verify these AES
                        keys.
                    </p>
                    <div id="stored_key_div"></div>
                </div>
            </div>
        );
    };
}


export default Debug;