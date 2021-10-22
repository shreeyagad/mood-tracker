import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import { withOktaAuth } from '@okta/okta-react';
import Container from 'react-bootstrap/Container';
import APIClient from '../apiClient';
import EmotionNav from "../EmotionNav";

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 70
  },
});

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          userData: [],
        };
    }

    componentDidMount() {
        const accessToken = this.props.authState.accessToken.accessToken;
        this.apiClient = new APIClient(accessToken);
        this.apiClient.getUserData().then((data) =>
            this.setState({...this.state, userData: data.data})
        );
        console.log(this.state.userData);
    }

    render() {
        return (
        <div className={styles.root}>
            <Container>
            <EmotionNav></EmotionNav>
            <h1>{this.state.userData}</h1>
            </Container>
        </div>
        )
    }
}

export default withStyles(styles)(withOktaAuth(Profile));