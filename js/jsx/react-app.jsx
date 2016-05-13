var ReactApp = React.createClass({
    getInitialState: function () {
        return {
            connected: false,
            users: {},
            time: 0
        }
    },
    componentDidMount: function () {
        var fn = this;
        // listen for server info changes which affect the whole app
        socket.on('server_info', function (server_info) {
            fn.setState({users: server_info.user_list, time: server_info.time});
        });

        // Socket event listeners
        socket.on('connect', function () {
            info('Connected to server');
            info(fn.state);
            fn.setState({connected: true});
            info(fn.state);
        });

        // Disconnected from server
        socket.on('disconnect', function () {
            error('Lost contact with server');
            fn.setState({connected: false});
            SessionHelper.resetUserList();
        });
    },
    render: function () {
        console.log(this.state);
        if (this.state.connected) {
            return (
                <div key="connected_container" className="container-fluid">
                    <ReactChat/>
                </div>
            );
        } else {
            return (
                <div key="loader_container" className="container-fluid">
                    <ReactLoadScreen/>
                </div>
            );
        }

    }
});

