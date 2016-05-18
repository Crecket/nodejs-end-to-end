import Chat from './chat/Chat.jsx';
import Login from './login/Login.jsx';
import Settings from './Settings.jsx';
import LoadScreen from './LoadScreen.jsx';

class App extends React.component {

    getInitialState() {
        return {
            connected: false,
            loggedin: false,
            loginLoading: false,
            targetName: '',
            users: {}
        }
    };

    shouldComponentUpdate(nextProps, nextState) {
        // check if state has changed
        if (JSON.stringify(this.state) !== JSON.stringify(nextState) || JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
        return false;
    };

    componentDidMount() {
        // TODO fix unmount issue
        // listen for server info changes which affect the whole app
        socket.on('server_info', function (server_info) {
            if (this.isMounted()) {
                this.setState({users: server_info.user_list, connected: true});
            }
            if (!SessionHelper.updateUserList(server_info.user_list)) {
                // current target is gone so reset the target input box
                $('#inputTarget').val('');
            }
        }.bind(this));

        // Socket event listeners
        socket.on('connect', function () {
            info('Connected to server');
            if (this.isMounted() && this.state.connected === false) {
                this.setState({connected: true});
            }
        }.bind(this));

        // Disconnected from server
        socket.on('disconnect', function () {
            error('Lost contact with server');
            if (this.isMounted() && this.state.connected === true) {
                this.setState({connected: false});
            }
            SessionHelper.resetUserList();
        }.bind(this));

        // Server requests verification
        socket.on('request verify', function () {
            if (this.isMounted() && this.state.connected === true) {
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
                    <div key="connected_container" className="container-fluid">
                        <Chat users={this.state.users}
                                   targetName={this.state.targetName}
                                   userClickCallback={this.userClickCallback}/>
                    </div>
                );
            } else {
                MainComponent = (
                    <div key="login_container" className="container-fluid">
                        <Login loginLoadingState={this.state.loginLoading}
                                    loginLoadingCallback={this.loginLoadingCallback}/>
                    </div>
                );
            }
        } else {
            MainComponent = (
                <div key="loader_container" className="container-fluid">
                    <LoadScreen message=""/>
                </div>
            );
        }

        return (
            <div>
                {MainComponent}
            </div>
        )
    };
}


export default App;