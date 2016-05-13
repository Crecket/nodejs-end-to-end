var ReactLoadScreen = React.createClass({
    render: function () {
        var inlineStyle = {
            color: 'white'
        };
        return (
            <div className="text-center" style={inlineStyle}>
                <h1 id="server_status">Loading</h1>
                <h1 id="server_status_icon" className="fa fa-refresh fa-spin fa-5x"></h1>
            </div>
        );
    }
});
