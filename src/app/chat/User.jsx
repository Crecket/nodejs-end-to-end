class User extends React.component {
    getIntialState() {
        return {};
    };

    userClickCallback() {
        // send click event to react app
        this.props.userClickCallback(this.props.username);
    };

    render() {
        if (SessionHelper.getUsername() === this.props.username) {
            return (
                <li key={this.props.username}>
                    {this.props.username}
                </li>
            );
        } else {
            return (
                <li key={this.props.username}>
                    <a onClick={this.userClickCallback}>{this.props.username}</a>
                </li>
            );
        }
    };
}


export default User;