import React from 'react';
import Chat from './chat/Chat.jsx';
import Login from './Login.jsx';
import LoadScreen from './LoadScreen.jsx';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MessageIcon from 'material-ui/svg-icons/communication/message';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const styles = {
    container: {
        textAlign: 'center',
        paddingTop: 150,
    },
};

class Main extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            connected: false,
            loggedin: false,
            loginLoading: false,
            targetName: '',
            users: {},
            modalOpen: false,
            modalMessage: "",
            modalTitle: ""
        };

        this.loginLoadingCallback = this.loginLoadingCallback.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.userClickCallback = this.userClickCallback.bind(this);
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
        // TODO fix unmount issue
        // listen for server info changes which affect the whole app
        socket.on('server_info', function (server_info) {
            this.setState({users: server_info.user_list, connected: true});

            if (!SessionHelper.updateUserList(server_info.user_list)) {
                // current target is gone so reset the target input box
                $('#inputTarget').val('');
            }
        }.bind(this));

        // Socket event listeners
        socket.on('connect', function () {
            info('Connected to server');
            if (this.state.connected === false) {
                this.setState({connected: true});
            }
        }.bind(this));

        // Disconnected from server
        socket.on('disconnect', function () {
            error('Lost contact with server');
            if (this.state.connected === true) {
                this.setState({connected: false});
            }
            SessionHelper.resetUserList();
        }.bind(this));

        // Server requests verification
        socket.on('request verify', function () {
            if (this.state.connected === true) {
                this.setState({loggedin: false});
            }
        }.bind(this));

        // login attempt callback
        socket.on('login_attempt_callback', function (res) {
            this.setState({loginLoading: false});
            SessionHelper.loginAttemptCallback(res);
            if (res.success === false) {
                warn('Unsuccesful login attempt');
                this.setState({loggedin: false});
                this.openModal('Login attempt failed. Invalid password', 'Login attempt failed');
            } else {
                info('Succesful login attempt');
                this.setState({loggedin: true});
            }
            debug(res);
        }.bind(this));
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
                    <div key="connected_container" style={styles.container}>
                        <Chat users={this.state.users}
                              targetName={this.state.targetName}
                              userClickCallback={this.userClickCallback}/>
                    </div>
                );
            } else {
                MainComponent = (
                    <div key="login_container" style={styles.container}>
                        <Login loginLoadingState={this.state.loginLoading}
                               loginLoadingCallback={this.loginLoadingCallback}/>
                    </div>
                );
            }
        } else {
            MainComponent = (
                <div key="loader_container" style={styles.container}>
                    <LoadScreen message=""/>
                </div>
            );
        }

        var mainAppBar = <AppBar
            title="End-To-End"
            iconElementLeft={<IconButton><MessageIcon /></IconButton>}/>;
        if (this.state.loggedin) {
            mainAppBar = <AppBar
                title="NodeJS End-To-End"
                iconElementLeft={<IconButton><MessageIcon /></IconButton>}
                iconElementRight={<IconMenu
                        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                        targetOrigin={{horizontal: 'right', vertical: 'top'}}
                        anchorOrigin={{horizontal: 'right', vertical: 'top'}}>
                            <MenuItem primaryText="Sign out"/>
                        </IconMenu>}/>;
        }

        const modalActions = [
            <FlatButton
                label="Ok"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.closeModal}
            />,
        ];
        return (
            <div>
                <Dialog
                    title={this.state.modalMessage}
                    actions={modalActions}
                    modal={false}
                    open={this.state.modalOpen}
                    onRequestClose={this.closeModal}
                >
                    {this.state.modalMessage}
                </Dialog>
                {mainAppBar}
                {MainComponent}
            </div>
        )
    };
}

export default Main;