import React  from 'react';

class Message extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
        
        this.callback = this.callback.bind(this);
    };

    callback() {
        this.props.deleteCallback(this.props.messageKey);
    };

    render() {
        var messageSender = <span>{this.props.when} {this.props.from}</span>;
        // if its our own message, make bold
        if(SessionHelper.getUsername() === this.props.from){
            messageSender = <strong>{this.props.when} {this.props.from}</strong>;
        }
        return (
            <p>
                {messageSender}: {escapeHtml(this.props.message)}
                <button onClick={this.callback.bind(this)} className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </p>
        );
    };
}

export default Message;