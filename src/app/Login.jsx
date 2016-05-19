import React  from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class Login extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSubmitClick = this.handleSubmitClick.bind(this);
    };

    handleSubmit(e) {
        e.preventDefault();
    };

    handleSubmitClick(e) {
        e.preventDefault();
        log(this.refs);
        
        var username = this.refs['inputUsername'].value;
        var password = this.refs['inputPassword'].value;

        // check if we're already handeling a login request
        if (!this.props.loginLoadingState) {
            // validate input
            if (username.length > 2 && username.length < 25 && CryptoHelper.validPasswordType(password)) {
                // update login loading state
                this.props.loginLoadingCallback();
                // start a new login attempt
                SessionHelper.loginAttempt(username, password);
            }
        }
    };

    render() {
        var button_login = {__html: (this.props.loginLoadingState) ? 'Login <span class="fa fa-refresh fa-spin"></span>' : 'Login'};
        return (
            <div className="col-xs-12 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">
                <form method="post" onSubmit={this.handleSubmit}>
                    <div className="panel panel-success">

                        <div className="panel-heading">
                            Enter your username and password
                        </div>

                        <div className="panel-body">

                            <TextField
                                floatingLabelText="Enter your username"
                                hintText="Username"
                                ref="inputUsername"
                                type="text"
                                required autofocus
                            /><br/>

                            <TextField
                                floatingLabelText="Enter your password"
                                hintText="Password"
                                ref="inputPassword"
                                type="password"
                                required autofocus
                            /><br/>

                            <RaisedButton label="Login" onClick={this.handleSubmitClick} primary={true}/>
                        </div>

                    </div>
                </form>
            </div>
        );
    };
}

export default Login;