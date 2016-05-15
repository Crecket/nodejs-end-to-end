var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var ReactTransitionGroup = React.addons.TransitionGroup;


var ReactApp = React.createClass({
    getInitialState: function () {
        return {
            connected: false,
            loggedin: false,
            users: {}
        }
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        // check if state has changed
        if (JSON.stringify(this.state) !== JSON.stringify(nextState) || JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
        return false;
    },
    componentDidMount: function () {
        // TODO fix unmount issue
        // listen for server info changes which affect the whole app
        socket.on('server_info', function (server_info) {
            if (this.isMounted()) {
                this.setState({users: server_info.user_list, connected: true});
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
            loginLoading = false;
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
    },
    render: function () {
        var MainComponent = "";
        if (this.state.connected) {
            if (this.state.loggedin) {
                MainComponent = (
                    <div key="connected_container" className="container-fluid">
                        <ReactChat users={this.state.users}/>
                    </div>
                );
            } else {
                MainComponent = (
                    <div key="login_container" className="container-fluid">
                        <ReactLogin/>
                    </div>
                );
            }
        } else {
            MainComponent = (
                <div key="loader_container" className="container-fluid">
                    <ReactLoadScreen message=""/>
                </div>
            );
        }

        return (
            <ReactCSSTransitionGroup
                transitionName="transition"
                transitionAppear={true}
                transitionAppearTimeout={500}
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}
                component='div'>
                {MainComponent}
            </ReactCSSTransitionGroup>
        )
    }
});

