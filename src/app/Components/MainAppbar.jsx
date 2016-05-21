import React  from 'react';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MessageIcon from 'material-ui/svg-icons/communication/message';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {cyan800} from 'material-ui/styles/colors';

const styles = {
    appbar: {
        backgroundColor: cyan800,
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
        var mainAppBar = <AppBar
            style={styles.appbar}
            title="End-To-End"
            iconElementLeft={<IconButton><MessageIcon /></IconButton>}/>;

        if (this.props.loggedin) {

            // if we're logged in, show a extra menu
            mainAppBar = <AppBar
                style={styles.appbar}
                title="NodeJS End-To-End"
                iconElementLeft={<IconButton><MessageIcon /></IconButton>}
                iconElementRight={<IconMenu
                        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                        targetOrigin={{horizontal: 'right', vertical: 'top'}}
                        anchorOrigin={{horizontal: 'right', vertical: 'top'}}>
                            <MenuItem primaryText="Sign out"/>
                        </IconMenu>}/>;
        }

        return (
            <div className="row">
                <div className="col-xs-12">
                    <div className="box">
                        {mainAppBar}
                    </div>
                </div>
            </div>
        );
    };
}


export default MainAppbar;