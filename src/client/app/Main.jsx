import React from 'react';
import Chat from './chat/Chat.jsx';
import Login from './Login.jsx';
import LoadScreen from './LoadScreen.jsx';
import MainAppbar from './components/MainAppbar.jsx';
import AesKeyList from './AesKeyList.jsx';
import Settings from './Settings.jsx';

// Themes
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import CustomDark from './themes/CustomDark';
import CustomLight from './themes/CustomLight';
// theme list so we can access them more easily
const ThemesList = {
    "CustomDark": CustomDark,
    "CustomLight": CustomLight
};

// material-ui components
import {Container} from 'material-ui';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class Main extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            connected: false,

            publicKey: "",
            privateKey: "",
            publicKeySign: "",
            privateKeySign: "",

            loggedin: false,
            loginLoading: false,

            targetName: '',
            users: {},
            userKeys: {},

            modalOpen: false,
            modalMessage: "",
            modalTitle: "",

            muiTheme: 'CustomDark',
        };

    };

    getChildContext() {
        if (typeof ThemesList[this.state.muiTheme] !== "undefined") {
            // check if style exists and than use it
            return {
                muiTheme: getMuiTheme(ThemesList[this.state.muiTheme])
            };
        } else {
            // default style
            return {
                muiTheme: getMuiTheme(CustomDark)
            };
        }
    }

    componentDidMount() {
        var fn = this;

        // delay because creating the keysets blocks browser rendering
        setTimeout(function () {
            // create default keysets
            fn.refreshEncryptionKeys();
            fn.refreshSigningKeys();
        }, 150);

        socket.on('user_disconnect', fn._SocketUserDisconnect);
        socket.on('server_info', fn._SocketServerInfo);
        socket.on('connect', fn._SocketConnect);
        socket.on('disconnect', fn._SocketDisconnect);
        socket.on('request verify', fn._SocketRequestVerify);
        socket.on('login_attempt_callback', fn._SocketLoginAttemptCallback);
        socket.on('aesKeyRequest', fn._SocketAesKeyRequest);
        socket.on('aesKeyResponse', fn._SocketAesKeyResponse);
        socket.on('confirm_aes', fn._SocketConfirmAes);
        socket.on('confirm_aes_response', fn._SocketConfirmAesResponse);
        socket.on('public_key', fn._SocketPublicKey);
        socket.on('login_salt_callback', fn._SocketLoginSaltCallback);

    };

    componentWillUnmount() {
        var fn = this;
        // Remove socket listeners if component is about to umount
        socket.removeListener('server_info', fn._SocketServerInfo);
        socket.removeListener('connect', fn._SocketConnect);
        socket.removeListener('user_disconnect', fn._SocketUserDisconnect);
        socket.removeListener('disconnect', fn._SocketDisconnect);
        socket.removeListener('request verify', fn._SocketRequestVerify);
        socket.removeListener('login_attempt_callback', fn._SocketLoginAttemptCallback);
        socket.removeListener('aesKeyRequest', fn._SocketAesKeyRequest);
        socket.removeListener('aesKeyResponse', fn._SocketAesKeyResponse);
        socket.removeListener('confirm_aes', fn._SocketConfirmAes);
        socket.removeListener('confirm_aes_response', fn._SocketConfirmAesResponse);
        socket.removeListener('public_key', fn._SocketPublicKey);
        socket.removeListener('login_salt_callback', fn._SocketLoginSaltCallback);
    };

    // react function to test if props and/or state have changed
    shouldComponentUpdate(nextProps, nextState) {
        // check if state has changed
        if (JSON.stringify(this.state) !== JSON.stringify(nextState) || JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
        return false;
    };

    // change the theme
    setTheme = () => {
        if(this.state.muiTheme === "CustomDark"){
            this.setState({muiTheme: "CustomLight"});
        }else{
            this.setState({muiTheme: "CustomDark"});
        }
    };

    // set a new key set for the encryption/decryption keys
    refreshEncryptionKeys = () => {
        var fn = this;
        SessionHelper.newKeySet(function (keys) {
            fn.setState({publicKey: keys.publicKey, privateKey: keys.privateKey})
        });
    }

    // set a new key set for the sign/verification keys
    refreshSigningKeys = () => {
        var fn = this;
        SessionHelper.newKeySetSign(function (keys) {
            fn.setState({publicKeySign: keys.publicKeySign, privateKeySign: keys.privateKeySign})
        });
    }

    // open the general modal
    openModal = (message, title) => {
        this.setState({modalOpen: true, modalMessage: message, modalTitle: title});
    };

    // close the general modal
    closeModal = () => {
        this.setState({modalOpen: false});
    };

    // update the stored aes keys
    setUserKeys = () => {
        this.setState({userKeys: SessionHelper.getKeyList()});
    }

    // set loading state
    loginLoadingCallback = () => {
        this.setState({loginLoading: true});
    };

    // handle user clicks on userlist or messagelist items
    userClickCallback = (userName) => {
        if (SessionHelper.isVerified()) {
            if (SessionHelper.setTarget(userName)) {
                this.setState({targetName: userName});
            }
        } else {
            warn('Not verified, can\'t select target');
        }
    };

    // Disconnected from server
    _SocketDisconnect = () => {
        error('Lost contact with server');
        if (this.state.connected === true) {
            this.setState({connected: false, loginLoading: false, loggedin: false});
        }
        SessionHelper.resetUserList();
    };

    // Socket event listeners
    _SocketConnect = () => {
        info('Connected to server');
        if (this.state.connected === false) {
            this.setState({connected: true});
        }
    };

    // listen for server info changes which affect the whole app
    _SocketServerInfo = (server_info) => {
        SessionHelper.setServerPublicKey(server_info.publicKey);
        this.setState({users: server_info.user_list, connected: true});
        if (!SessionHelper.updateUserList(server_info.user_list)) {
            // current target is gone so reset the target input box
            this.setState({targetName: ''});
        }
    };

    // a user has disconnected
    _SocketUserDisconnect = (username, user_list) => {
        debug('User disconnected: ' + username);
        // first update the userlist
        if (!SessionHelper.updateUserList(user_list)) {
            // current target is gone so reset the target input box
            this.setState({targetName: ""});
        }
        loadKeyListDiv();
    };

    // Server requests verification
    _SocketRequestVerify = () => {
        if (this.state.connected === true) {
            this.setState({loginLoading: false, loggedin: false});
        }
    };

    // login attempt callback
    _SocketLoginAttemptCallback = (response) => {
        this.setState({loginLoading: false});
        SessionHelper.loginAttemptCallback(response);
        if (response.success === false) {
            warn('Unsuccesful login attempt');
            this.setState({loggedin: false});
            this.openModal(response.message, 'Login attempt failed');
        } else {
            info('Succesful login attempt');
            this.setState({loggedin: true});
        }
        debug(response);
    };

    // someone wants to chat and is requesting that we create a new aes key to use
    _SocketAesKeyRequest = (request) => {
        info('Received AES request');
        SessionHelper.createNewAes(request);
    };

    // other client wants a confirmation for this request
    _SocketAesKeyResponse = (response) => {
        var fn = this;
        info('Received AES response');
        debug(response);
        SessionHelper.setAesKey(response, function (success) {
            if (success) {
                fn.setUserKeys();
            }
        });
    };

    // the client a aes key was requested from has sent a response
    _SocketConfirmAes = (response) => {
        var fn = this;
        info('Received AES confirmation');
        debug(response);
        SessionHelper.aesConfirmation(response, function (success) {
            if (success) {
                fn.setUserKeys();
            }
        });
    };

    // the client has sent a response to our confirmation request
    _SocketConfirmAesResponse = (response) => {
        var fn = this;
        info('Received AES confirmation response');
        debug(response);
        SessionHelper.aesConfirmationResponse(response, function (success) {
            if (success) {
                fn.setUserKeys();
            }
        });
    };

    // Server returns the user's salt
    _SocketLoginSaltCallback = (salt) => {
        debug('Salt callback');
        // send to session handler
        SessionHelper.loginSaltCallback(salt);
    };

    // Receive public key from server
    _SocketPublicKey = (response) => {
        log('Received server public key');
        SessionHelper.setServerPublicKey(response);
    };

    render() {
        var MainComponent = "";
        if (this.state.connected) {
            if (this.state.loggedin) {
                MainComponent = (
                    <div className="content">
                        <Chat
                            users={this.state.users}
                            targetName={this.state.targetName}
                            userClickCallback={this.userClickCallback}
                        />

                        <Settings
                            userKeys={this.state.userKeys}
                            encryptionKey={this.state.publicKey}
                            decryptionKey={this.state.privateKey}
                            signingKey={this.state.privateKeySign}
                            verificationKey={this.state.publicKeySign}
                            refreshEncryptionKeys={this.refreshEncryptionKeys}
                            refreshSigningKeys={this.refreshSigningKeys}
                        />

                        <AesKeyList
                            userKeys={this.state.userKeys}
                        />
                    </div>
                );
            } else {
                MainComponent = (
                    <div className="content">
                        <Login
                            className="center-xs"
                            loginLoadingState={this.state.loginLoading}
                            loginLoadingCallback={this.loginLoadingCallback}
                        />
                    </div>
                );
            }
        } else {
            MainComponent = (
                <div className="content">
                    <LoadScreen message="No connection to the server"/>
                </div>
            );
        }

        // the default modal actions
        const modalActions = [
            <FlatButton
                label="Ok"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.closeModal}
            />,
        ];

        return (
            <div className="wrap container-fluid">
                <Dialog
                    title={this.state.modalTitle}
                    actions={modalActions}
                    modal={false}
                    open={this.state.modalOpen}
                    onRequestClose={this.closeModal}
                >
                    {this.state.modalMessage}
                </Dialog>

                <MainAppbar loggedin={this.state.loggedin} setTheme={this.setTheme}/>

                {MainComponent}
            </div>
        )
    };
}

// give theme context
Main.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};

export default Main;