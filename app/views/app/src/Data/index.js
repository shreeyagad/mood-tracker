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

class Data extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          emotions: [],
        };
    }

    componentDidMount() {
        const accessToken = this.props.authState.accessToken.accessToken;
        this.apiClient = new APIClient(accessToken);
        this.apiClient.getEmotions().then((data) =>
            this.setState({...this.state, emotions: data.data})
        );
    }

    createPieChart(){}

    createHistogram(){}

    // add song recommender?

    // add a button that opens a modal that explains how the classifier works!
  
    logout = (e) => {
        e.preventDefault();
        this.props.oktaAuth.signOut();
    }

    render() {
        return (
        <div className={styles.root}>
            <Container>
            <EmotionNav></EmotionNav>
            <h1>Data</h1>
            </Container>
        </div>
        )
    }
}

export default withStyles(styles)(withOktaAuth(Data));