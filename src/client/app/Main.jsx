import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
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
    "CustomDark": getMuiTheme(CustomDark),
    "CustomLight": getMuiTheme(CustomLight)
};

// material-ui components
import {Container} from 'material-ui';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class Main extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            // server connection status
            connected: false,

            // client public and private keys
            publicKey: "",
            privateKey: "",
            publicKeySign: "",
            privateKeySign: "",

            // login status
            rememberMe: false,
            loggedin: false,
            loginLoading: false,

            // stored session data
            targetName: '',
            users: {},
            userKeys: {},

            // default modal state
            modalOpen: false,
            modalMessage: "",
            modalTitle: "",

            // theme options
            muiTheme: 'CustomDark',

            socket: io.connect('https://' + window.location.host, {secure: true})
        };

        setInterval(function () {
            this.state.socket.emit('heart_beat', 'oi');
        }, 5000);
    };

    // set context for child components
    getChildContext() {
        if (typeof ThemesList[this.state.muiTheme] !== "undefined") {
            // check if style exists and than use it
            return {
                muiTheme: ThemesList[this.state.muiTheme]
            };
        } else {
            // default style
            return {
                muiTheme: CustomDark
            };
        }
    }

    componentDidMount() {
        var fn = this;

        // delay because creating the keyset generation blocks browser rendering
        setTimeout(function () {
            // create default keysets
            fn.refreshEncryptionKeys();
            fn.refreshSigningKeys();
        }, 150);

        // set socket listeners
        this.state.socket.on('user_disconnect', fn._SocketUserDisconnect);
        this.state.socket.on('server_info', fn._SocketServerInfo);
        this.state.socket.on('connect', fn._SocketConnect);
        this.state.socket.on('jwt_verify_callback', fn._SocketJWTCallback);
        this.state.socket.on('disconnect', fn._SocketDisconnect);
        this.state.socket.on('request verify', fn._SocketRequestVerify);
        this.state.socket.on('login_attempt_callback', fn._SocketLoginAttemptCallback);
        this.state.socket.on('aesKeyRequest', fn._SocketAesKeyRequest);
        this.state.socket.on('aesKeyResponse', fn._SocketAesKeyResponse);
        this.state.socket.on('confirm_aes', fn._SocketConfirmAes);
        this.state.socket.on('confirm_aes_response', fn._SocketConfirmAesResponse);
        this.state.socket.on('public_key', fn._SocketPublicKey);
        this.state.socket.on('login_salt_callback', fn._SocketLoginSaltCallback);

        // set stored theme if it is stored already
        this.setTheme(storageGet("main_theme"));
    };

    componentWillUnmount() {
        var fn = this;
        // Remove socket listeners if component is about to umount
        this.state.socket.removeListener('server_info', fn._SocketServerInfo);
        this.state.socket.removeListener('connect', fn._SocketConnect);
        this.state.socket.removeListener('jwt_verify_callback', fn._SocketJWTCallback);
        this.state.socket.removeListener('user_disconnect', fn._SocketUserDisconnect);
        this.state.socket.removeListener('disconnect', fn._SocketDisconnect);
        this.state.socket.removeListener('request verify', fn._SocketRequestVerify);
        this.state.socket.removeListener('login_attempt_callback', fn._SocketLoginAttemptCallback);
        this.state.socket.removeListener('aesKeyRequest', fn._SocketAesKeyRequest);
        this.state.socket.removeListener('aesKeyResponse', fn._SocketAesKeyResponse);
        this.state.socket.removeListener('confirm_aes', fn._SocketConfirmAes);
        this.state.socket.removeListener('confirm_aes_response', fn._SocketConfirmAesResponse);
        this.state.socket.removeListener('public_key', fn._SocketPublicKey);
        this.state.socket.removeListener('login_salt_callback', fn._SocketLoginSaltCallback);
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
    setTheme = (setValue) => {
        if (setValue) {
            if (typeof ThemesList[setValue] !== "undefined") {
                this.setState({muiTheme: setValue});
                storageSet('main_theme', setValue);
                return true;
            }
        }
        // no custom value given or value does not exist, just toggle between dark and light
        if (this.state.muiTheme === "CustomDark") {
            this.setState({muiTheme: "CustomLight"});
            storageSet('main_theme', "CustomLight");
        } else {
            this.setState({muiTheme: "CustomDark"});
            storageSet('main_theme', "CustomDark");
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

    // logout user and destroy any jwt tokens
    logout = () => {
        // log out
        this.setState({loggedin: false});
        // delete jwt tokens
        storageDelete('token');
    };

    // handle rememberme checkbox click
    remembermeCheckbox = (val) => {
        this.setState({rememberMe: val});
    };

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

    // server's callback to the client sending its token
    _SocketJWTCallback = (callback) => {
        if (SessionHelper.jwtLoginCallback(callback)) {
            // jwt token has been verified and is valid
            this.setState({loggedin: true});
        }
    };

    // Socket event listeners
    _SocketConnect = () => {
        info('Connected to server');
        if (this.state.connected === false) {
            this.setState({connected: true});
        }
        // check if we have a jwt token in storage
        var jwtToken = storageGet('token');
        if (jwtToken) {
            // send jwt token to server
            info('Sending stored JWT token');
            this.state.socket.emit('jwt_verify', jwtToken);
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
        if (response.success == true) {
            info('Succesful login attempt');
            this.setState({loggedin: true});

            // if rememberme has been checked
            if (this.state.rememberMe) {
                // store new jwt token
                storageSet('token', response.jwtToken);
            } else {
                // new sessino so delete existing token
                storageDelete('token');
            }

        } else {
            warn('Unsuccesful login attempt');
            this.setState({loggedin: false});
            this.openModal(response.message, 'Login attempt failed');
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
                            remembermeCheckboxCallback={this.remembermeCheckbox}
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
            <div className={"wrap " + this.state.muiTheme}
                 style={{background: ThemesList[this.state.muiTheme].bodyBackground}}>
                <div className="container-fluid">
                    <Dialog
                        title={this.state.modalTitle}
                        actions={modalActions}
                        modal={false}
                        open={this.state.modalOpen}
                        onRequestClose={this.closeModal}
                    >
                        {this.state.modalMessage}
                    </Dialog>

                    <MainAppbar
                        loggedin={this.state.loggedin}
                        setTheme={this.setTheme}
                        logoutCallback={this.logout}
                    />

                    {MainComponent}
                </div>
            </div>
        )
    };
}

// give theme context
Main.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default Main;
