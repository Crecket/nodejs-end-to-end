import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MessageIcon from 'material-ui/svg-icons/communication/message';
import ColorLensIcon from 'material-ui/svg-icons/image/color-lens';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

const styles = {
    appbar: {
        width: '100%',
    },
};

class MainAppbar extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };

    render() {
        // main app bar at the top of the screen
        var rightButton = <IconButton onClick={this.props.setTheme}><ColorLensIcon /></IconButton>;

        // if user is logged in, show a menu instead of single button
        if (this.props.loggedin) {
            rightButton = <IconMenu
                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}>
                <MenuItem onClick={this.props.logoutCallback} primaryText="Logout"/>
                <MenuItem onClick={this.props.setTheme} primaryText="Change Theme"/>
            </IconMenu>;
        }

        return (
            <div className="row">
                <div className="col-xs-12">
                    <div className="box">
                        {<AppBar
                            style={styles.appbar}
                            title="NodeJS End-To-End"
                            iconElementLeft={<IconButton><MessageIcon /></IconButton>}
                            iconElementRight={rightButton}
                        />}
                    </div>
                </div>
            </div>
        );
    };
}


// give theme context
MainAppbar.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default muiThemeable()(MainAppbar);