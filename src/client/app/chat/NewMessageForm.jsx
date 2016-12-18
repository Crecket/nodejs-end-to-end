import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
    inputs: {
        width: '100%',
    },
    imageInput: {
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: '100%',
        opacity: 0,
    },
};

class NewMessageForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            // checkboxToggle: false,
            messageLoading: false,
            inputText: ''
        };
    };

    componentDidMount() {
        var fn = this;
        // Received a message from server
        this.props.socket.on('message_callback', fn._SocketMessageCallback);
    };

    componentWillUnmount() {
        var fn = this;
        // Remove socket listeners if component is about to umount
        this.props.socket.removeListener('message_callback', fn._SocketMessageCallback);
    };

    handleChange = () => {
        this.setState({inputText: this.refs.inputMessage.input.value});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (!this.state.messageLoading && this.props.ChatClient.hasTarget()) {
            var message = this.refs.inputMessage.input.value;
            this.setState({inputText: ''});

            if (message && message.length > 0 && message.length < 255) {
                this.setState({messageLoading: true});
                if (this.props.ChatClient.sendMessage(message)) {
                    this.props.newMessageCallback(this.props.ChatClient.getUsername(), message);
                }
            } else {
                this.setState({messageLoading: false});
            }
        }

    };

    _SocketMessageCallback = (res) => {
        this.setState({messageLoading: false});
    }

    render() {

        return (
            <form onSubmit={this.handleSubmit} method="post">
                <div className="row middle-xs">

                    <div className="col-xs-12">
                        <div className="box-row">
                            <TextField
                                style={styles.inputs}
                                hintText="Target"
                                floatingLabelText="Target"
                                value={this.props.targetName}
                                type="text"
                                disabled={true}
                                readOnly required
                            />
                        </div>
                    </div>

                    <div className="col-xs-12">
                        <div className="box-row">
                            <TextField
                                style={styles.inputs}
                                hintText="Message"
                                ref="inputMessage"
                                floatingLabelText="Message"
                                onChange={this.handleChange}
                                value={this.state.inputText}
                                type="text"
                                required autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="col-xs-12">
                        <div className="box-row">
                            <RaisedButton
                                type="submit"
                                label="Send Message"
                                primary={true}
                                style={styles.inputs}
                            />
                        </div>
                    </div>

                </div>
            </form>
        );
    }    ;
}

// give theme context
NewMessageForm.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default NewMessageForm;