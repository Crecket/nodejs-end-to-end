var ReactLogin = React.createClass({
    getInitialState: function () {
        return {
            username: '',
            password: ''
        }
    },
    usernameUpdate: function (e) {
        this.setState({username: e.target.value});
    },
    passwordUpdate: function (e) {
        this.setState({password: e.target.value});
    },
    handleSubmit: function (e) {
        e.preventDefault();
        // check if we're already handeling a login request
        if (!this.props.loginLoadingState) {
            // validate input
            if (this.state.username.length > 2 && this.state.username.length < 25 && CryptoHelper.validPasswordType(this.state.password)) {
                // update login loading state
                this.props.loginLoadingCallback();
                // start a new login attempt
                SessionHelper.loginAttempt(this.state.username, this.state.password);
            }
        }
    },
    render: function () {
        var button_login = {__html: (this.props.loginLoadingState) ? 'Login <span class="fa fa-refresh fa-spin"></span>' : 'Login'};
        return (
            <div className="col-xs-12 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">
                <form method="post" onSubmit={this.handleSubmit}>
                    <div className="panel panel-success">

                        <div className="panel-heading">
                            Enter your username and password
                        </div>

                        <div className="panel-body">
                            <label className="sr-only">Username</label>
                            <input type="text" onChange={this.usernameUpdate} className="form-control input-lg"
                                   placeholder="Username" required autofocus autocomplete="off"/>

                            <label className="sr-only">Password</label>
                            <input type="password" onChange={this.passwordUpdate} className="form-control input-lg"
                                   placeholder="Password"/>

                            <button className="btn btn-lg btn-primary btn-block" type="submit"
                                    dangerouslySetInnerHTML={button_login}/>
                        </div>

                    </div>
                </form>
            </div>
        );
    }
});

