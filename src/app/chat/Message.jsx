class Message extends React.component {
    callback() {
        this.props.deleteCallback(this.props.messageKey);
    };

    render() {
        return (
            <p>
                <strong>{this.props.when} {this.props.from}</strong>: {escapeHtml(this.props.message)}
                <button onClick={this.callback} className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </p>
        );
    };
}

export default Message;