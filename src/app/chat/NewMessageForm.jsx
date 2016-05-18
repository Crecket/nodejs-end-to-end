class NewMessageForm extends React.component {
    getInitialState() {
        return {
            checkboxToggle: false,
            messageLoading: false
        };
    };

    checkboxClick() {
        this.setState({checkboxToggle: !this.state.checkboxToggle}, function () {
            SessionHelper.setFileSetting(this.state.checkboxToggle);
        });
    };

    handleSubmit(e) {
        e.preventDefault();
        if (!this.state.messageLoading && SessionHelper.hasTarget()) {
            var message = this.refs['inputMessage'].value;

            if (message.length > 0 && message.length < 255) {
                this.setState({messageLoading: true});
                if (SessionHelper.sendMessage(message)) {
                    this.props.newMessageCallback(SessionHelper.getUsername(), message);
                }
            } else {
                debug('Message length: ' + message.length);
                this.setState({messageLoading: false});
            }
        }

    };

    render() {

        var fileSendDiv;
        if (this.state.checkboxToggle) {
            fileSendDiv = (
                <div className="form-group">
                    <div className="col-xs-12 col-sm-6">
                        <div className="row">
                            <a className="btn btn-lg btn-primary btn-block" id="file_upload">
                                Send File
                            </a>
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-6">
                        <div className="row">
                            <label className="">
                                Choose a file <input type="file" id="file_upload_test"/>
                            </label>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="col-xs-12">
                <div className="row">
                    <form onSubmit={this.handleSubmit} method="post">
                        <div className="panel panel-info">
                            <div className="panel-heading body_toggle" data-toggle="new_message_body">
                                New Message
                            </div>
                            <div className="panel-body" id="new_message_body">

                                <div className="form-group">
                                    <label for="inputTarget">Target</label>
                                    <input type="text"
                                           className="form-control input-lg"
                                           value={this.props.targetName}
                                           placeholder="No user selected"
                                           readOnly required/>
                                </div>

                                <div className="form-group">
                                    <label for="inputMessage">Message</label>
                                    <input type="text"
                                           ref="inputMessage"
                                           className="form-control input-lg"
                                           placeholder="Message"
                                           required autocomplete="off"/>
                                    <button className="btn btn-lg btn-primary btn-block" type="submit">
                                        Send Message
                                    </button>
                                </div>

                                <div className="form-group">
                                    <div className="col-xs-12">
                                        <div className="row">
                                            <label>
                                                <input type="checkbox" onClick={this.checkboxClick}/>
                                                Allow people to send me files.
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {fileSendDiv}

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
}

export default NewMessageForm;