import React from 'react';
import Chat from './chat/Chat.jsx';
import Login from './Login.jsx';
import LoadScreen from './LoadScreen.jsx';
import MainAppbar from './components/MainAppbar.jsx';
import Debug from './debug/Debug.jsx';

import {Container} from 'material-ui';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {cyan800} from 'material-ui/styles/colors';

const styles = {
    container: {
        textAlign: 'center',
    },
    paper: {
        display: 'inline-block',
        width: '100%',
        minHeight: 268,
        padding: 20,
    },
};

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

            modalOpen: false,
            modalMessage: "",
            modalTitle: "",
        };

        // bind the general functions
        this.loginLoadingCallback = this.loginLoadingCallback.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.userClickCallback = this.userClickCallback.bind(this);

        // bind the socket functions
        this._SocketServerInfo = this._SocketServerInfo.bind(this);
        this._SocketConnect = this._SocketConnect.bind(this);
        this._SocketDisconnect = this._SocketDisconnect.bind(this);
        this._SocketRequestVerify = this._SocketRequestVerify.bind(this);
        this._SocketLoginAttemptCallback = this._SocketLoginAttemptCallback.bind(this);
    };

    shouldComponentUpdate(nextProps, nextState) {
        // check if state has changed
        if (JSON.stringify(this.state) !== JSON.stringify(nextState) || JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
        return false;
    };

    openModal(message, title) {
        this.setState({modalOpen: true, modalMessage: message, modalTitle: title});
    };

    closeModal() {
        this.setState({modalOpen: false});
    };

    componentDidMount() {
        var fn = this;

        // create default keysets
        SessionHelper.newKeySet(function (keys) {
            fn.setState({publicKey: keys.publicKey, privateKey: keys.privateKey})
        });
        SessionHelper.newKeySetSign(function (keys) {
            fn.setState({publicKeySign: keys.publicKeySign, privateKeySign: keys.privateKeySign})
        });

        // listen for server info changes which affect the whole app
        socket.on('server_info', fn._SocketServerInfo);

        // Socket event listeners
        socket.on('connect', fn._SocketConnect);

        // Disconnected from server
        socket.on('disconnect', fn._SocketDisconnect);

        // Server requests verification
        socket.on('request verify', fn._SocketRequestVerify);

        // login attempt callback
        socket.on('login_attempt_callback', fn._SocketLoginAttemptCallback);
    };

    componentWillUnmount() {
        var fn = this;
        // Remove socket listeners if component is about to umount
        socket.removeListener('server_info', fn._SocketServerInfo);
        socket.removeListener('connect', fn._SocketConnect);
        socket.removeListener('disconnect', fn._SocketDisconnect);
        socket.removeListener('request verify', fn._SocketRequestVerify);
        socket.removeListener('login_attempt_callback', fn._SocketLoginAttemptCallback);
    };

    // socket events
    _SocketDisconnect() {
        error('Lost contact with server');
        if (this.state.connected === true) {
            this.setState({connected: false});
        }
        SessionHelper.resetUserList();
    };

    _SocketConnect() {
        info('Connected to server');
        if (this.state.connected === false) {
            this.setState({connected: true});
        }
    };

    _SocketServerInfo(server_info) {
        this.setState({users: server_info.user_list, connected: true});
        if (!SessionHelper.updateUserList(server_info.user_list)) {
            // current target is gone so reset the target input box
            $('#inputTarget').val('');
        }
    };

    _SocketRequestVerify() {
        if (this.state.connected === true) {
            this.setState({loggedin: false});
        }
    };

    _SocketLoginAttemptCallback(res) {
        this.setState({loginLoading: false});
        SessionHelper.loginAttemptCallback(res);
        if (res.success === false) {
            warn('Unsuccesful login attempt');
            this.setState({loggedin: false});
            this.openModal('Invalid username or password', 'Login attempt failed');
        } else {
            info('Succesful login attempt');
            this.setState({loggedin: true});
        }
        debug(res);
    };

    loginLoadingCallback() {
        this.setState({loginLoading: true});
    };

    userClickCallback(userName) {
        if (SessionHelper.isVerified()) {
            if (SessionHelper.setTarget(userName)) {
                this.setState({targetName: userName});
            }
        } else {
            warn('Not verified, can\'t select target');
        }
    };

    render() {
        var MainComponent = "";
        if (this.state.connected) {
            if (this.state.loggedin) {
                MainComponent = (
                    <Chat
                        users={this.state.users}
                        targetName={this.state.targetName}
                        userClickCallback={this.userClickCallback}/>
                );
            } else {
                MainComponent = (
                    <Login
                        className="center-xs"
                        loginLoadingState={this.state.loginLoading}
                        loginLoadingCallback={this.loginLoadingCallback}/>
                );
            }
        } else {
            MainComponent = (
                <LoadScreen message=""/>
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
                <MainAppbar customStyle={styles.appbar} loggedIn={this.state.loggedin}/>
                <div className="content">
                    {MainComponent}
                </div>

                <Debug
                    encryptionKey={this.state.publicKey}
                    decryptionKey={this.state.privateKey}
                    signingKey={this.state.privateKeySign}
                    verificationKey={this.state.publicKeySign}
                />
            </div>
        )
    };
}

export default Main;