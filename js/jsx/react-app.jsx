var ReactApp = React.createClass({
    getInitialState: function () {
        return {
            connected: false,
            users: [],
            time: 0
        }
    },
    componentDidMount: function () {
        var fn = this;
        // listen for server info changes which affect the whole app
        socket.on('server_info', function (server_info) {
            fn.setState({users: server_info.user_list, time: server_info.time});
        });
    },
    render: function () {
        return (
            <div className="container-fluid">
                <ReactChat/>
            </div>
        );
    }
});

