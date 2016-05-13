var ReactApp = React.createClass({
    getInitialState: function () {
        return {
            connected: false,
            loggedin: false,
            users: {},
            time: 0
        }
    },
    componentDidMount: function () {
        // TODO fix unmount issue
        // listen for server info changes which affect the whole app
        socket.on('server_info', function (server_info) {
            if (this.isMounted()) {
                this.setState({users: server_info.user_list, time: server_info.time, connected: true});
            }
        }.bind(this));

        // Socket event listeners
        socket.on('connect', function () {
            info('Connected to server');
            if (this.isMounted()) {
                this.setState({connected: true});
            }
        }.bind(this));

        // Disconnected from server
        socket.on('disconnect', function () {
            error('Lost contact with server');
            if (this.isMounted()) {
                this.setState({connected: false});
            }
            SessionHelper.resetUserList();
        }.bind(this));

        // Server requests verification
        socket.on('request verify', function () {
            this.setState({loggedin: false});
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
        if (this.state.connected) {
            if(this.state.loggedin){
                return (
                    <div key="connected_container" className="container-fluid">
                        <ReactChat/>
                    </div>
                );
            }else{
                return (
                    <div key="login_container" className="container-fluid">
                        <ReactLogin/>
                    </div>
                );
            }
        } else {
            return (
                <div key="loader_container" className="container-fluid">
                    <ReactLoadScreen message=""/>
                </div>
            );
        }

    }
});

