import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Chat from './chat/Chat.jsx';
import Login from './Login.jsx';
import LoadScreen from './LoadScreen.jsx';
import MainAppbar from './components/MainAppbar.jsx';
import AesKeyList from './AesKeyList.jsx';
import Settings from './Settings.jsx';

// Import the main chat client
import ChatClient from './ChatClient';

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

            // Create socket connection
            socket: io.connect('https://' + window.location.host, {secure: true})
        };

        // Create the chat client
        this.state.ChatClient = new ChatClient(this.state.socket);

        setInterval(() => {
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

        // delay because creating the keyset generation blocks browser rendering
        setTimeout(() => {
            // create default keysets
            this.refreshEncryptionKeys();
            this.refreshSigningKeys();
        }, 150);

        // set socket listeners
        this.state.socket.on('user_disconnect', this._SocketUserDisconnect);
        this.state.socket.on('server_info', this._SocketServerInfo);
        this.state.socket.on('connect', this._SocketConnect);
        this.state.socket.on('jwt_verify_callback', this._SocketJWTCallback);
        this.state.socket.on('disconnect', this._SocketDisconnect);
        this.state.socket.on('request verify', this._SocketRequestVerify);
        this.state.socket.on('login_attempt_callback', this._SocketLoginAttemptCallback);
        this.state.socket.on('aesKeyRequest', this._SocketAesKeyRequest);
        this.state.socket.on('aesKeyResponse', this._SocketAesKeyResponse);
        this.state.socket.on('confirm_aes', this._SocketConfirmAes);
        this.state.socket.on('confirm_aes_response', this._SocketConfirmAesResponse);
        this.state.socket.on('public_key', this._SocketPublicKey);
        this.state.socket.on('login_salt_callback', this._SocketLoginSaltCallback);

        // set stored theme if it is stored already
        this.setTheme(storageGet("main_theme"));
    };

    componentWillUnmount() {

        // Remove socket listeners if component is about to umount
        this.state.socket.removeListener('server_info', this._SocketServerInfo);
        this.state.socket.removeListener('connect', this._SocketConnect);
        this.state.socket.removeListener('jwt_verify_callback', this._SocketJWTCallback);
        this.state.socket.removeListener('user_disconnect', this._SocketUserDisconnect);
        this.state.socket.removeListener('disconnect', this._SocketDisconnect);
        this.state.socket.removeListener('request verify', this._SocketRequestVerify);
        this.state.socket.removeListener('login_attempt_callback', this._SocketLoginAttemptCallback);
        this.state.socket.removeListener('aesKeyRequest', this._SocketAesKeyRequest);
        this.state.socket.removeListener('aesKeyResponse', this._SocketAesKeyResponse);
        this.state.socket.removeListener('confirm_aes', this._SocketConfirmAes);
        this.state.socket.removeListener('confirm_aes_response', this._SocketConfirmAesResponse);
        this.state.socket.removeListener('public_key', this._SocketPublicKey);
        this.state.socket.removeListener('login_salt_callback', this._SocketLoginSaltCallback);
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
        this.state.ChatClient.newKeySet((keys) => {
            this.setState({publicKey: keys.publicKey, privateKey: keys.privateKey})
        });
    }

    // set a new key set for the sign/verification keys
    refreshSigningKeys = () => {
        this.state.ChatClient.newKeySetSign((keys) => {
            this.setState({publicKeySign: keys.publicKeySign, privateKeySign: keys.privateKeySign})
        });
    }

    // logout user and destroy any jwt tokens
    logout = () => {
        // send logout request
        this.state.socket.emit('logout');

        // log out locally
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
        this.setState({userKeys: this.state.ChatClient.getKeyList()});
    }

    // set loading state
    loginLoadingCallback = () => {
        this.setState({loginLoading: true});
    };

    // handle user clicks on userlist or messagelist items
    userClickCallback = (userName) => {
        if (this.state.ChatClient.isVerified()) {
            if (this.state.ChatClient.setTarget(userName)) {
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
        this.state.ChatClient.resetUserList();
    };

    // server's callback to the client sending its token
    _SocketJWTCallback = (callback) => {
        if (this.state.ChatClient.jwtLoginCallback(callback)) {
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
        this.state.ChatClient.setServerPublicKey(server_info.publicKey);
        this.setState({users: server_info.user_list, connected: true});
        if (!this.state.ChatClient.updateUserList(server_info.user_list)) {
            // current target is gone so reset the target input box
            this.setState({targetName: ''});
        }
    };

    // a user has disconnected
    _SocketUserDisconnect = (username, user_list) => {
        debug('User disconnected: ' + username);
        // first update the userlist
        if (!this.state.ChatClient.updateUserList(user_list)) {
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
        this.state.ChatClient.loginAttemptCallback(response);
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
        this.state.ChatClient.createNewAes(request);
    };

    // other client wants a confirmation for this request
    _SocketAesKeyResponse = (response) => {
        var fn = this;
        info('Received AES response');
        debug(response);
        this.state.ChatClient.setAesKey(response, (success) => {
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
        this.state.ChatClient.aesConfirmation(response, (success) => {
            if (success) {
                fn.setUserKeys();
            }
        });
    };

    // the client has sent a response to our confirmation request
    _SocketConfirmAesResponse = (response) => {
        info('Received AES confirmation response');
        debug(response);
        this.state.ChatClient.aesConfirmationResponse(response, (success) => {
            if (success) {
                this.setUserKeys();
            }
        });
    };

    // Server returns the user's salt
    _SocketLoginSaltCallback = (salt) => {
        debug('Salt callback');
        // send to session handler
        this.state.ChatClient.loginSaltCallback(salt);
    };

    // Receive public key from server
    _SocketPublicKey = (response) => {
        log('Received server public key');
        this.state.ChatClient.setServerPublicKey(response);
    };

    render() {
        var MainComponent = "";
        if (this.state.connected) {
            if (this.state.loggedin) {
                MainComponent = (
                    <div className="content">
                        <Chat
                            socket={this.state.socket}
                            ChatClient={this.state.ChatClient}
                            users={this.state.users}
                            targetName={this.state.targetName}
                            userClickCallback={this.userClickCallback}
                        />

                        <Settings
                            socket={this.state.socket}
                            ChatClient={this.state.ChatClient}
                            userKeys={this.state.userKeys}
                            encryptionKey={this.state.publicKey}
                            decryptionKey={this.state.privateKey}
                            signingKey={this.state.privateKeySign}
                            verificationKey={this.state.publicKeySign}
                            refreshEncryptionKeys={this.refreshEncryptionKeys}
                            refreshSigningKeys={this.refreshSigningKeys}
                        />

                        <AesKeyList
                            socket={this.state.socket}
                            ChatClient={this.state.ChatClient}
                            userKeys={this.state.userKeys}
                        />
                    </div>
                );
            } else {
                MainComponent = (
                    <div className="content">
                        <Login
                            socket={this.state.socket}
                            ChatClient={this.state.ChatClient}
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
