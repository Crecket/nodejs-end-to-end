class LoadScreen extends React.component {
    render() {
        var inlineStyle = {
            color: 'white'
        };
        return (
            <div className="text-center" style={inlineStyle}>
                <h1 id="server_status">{this.props.message}</h1>
                <h1 id="server_status_icon" className="fa fa-refresh fa-spin fa-5x"></h1>
            </div>
        );
    };
}

export default LoadScreen;