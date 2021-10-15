import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Grid from '@material-ui/core/Grid';
import { withOktaAuth } from '@okta/okta-react';
import Emotion from "../Emotion"
import EmotionForm from "../EmotionForm"
import Container from 'react-bootstrap/Container';
import APIClient from '../apiClient';
import EmotionNav from "../EmotionNav";

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 70
  },
});

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      emotions: [],
      apiClient: null,
    };
  }

  componentDidMount() {
    const accessToken = this.props.authState.accessToken.accessToken;
    const apiClient = new APIClient(accessToken);
    this.setState({ apiClient });
    apiClient.getEmotions().then((data) =>
      this.setState({...this.state, emotions: data.data})
    );
  }

  updateState = (emotion) => {
    this.state.apiClient.getEmotions().then((data) =>
      this.setState({...this.state, emotions: data.data})
    );
  }
  
  renderEmotions = (emotions) => {
    if (!emotions) { return [] }
    return emotions.map((emotion) => {
      return (
        <Grid item xs={12} md={3} key={emotion.id}>
          <Emotion updateState={this.updateState} emotion={emotion} apiClient={this.state.apiClient} />
        </Grid>
      );
    })
  }
  
  logout = (e) => {
    e.preventDefault();
    this.props.oktaAuth.signOut();
  }

  render() {
    return (
      <div className={styles.root}>
        <Container>
          <EmotionNav></EmotionNav>
          <Grid container spacing={10} style={{padding: '20px 0'}}>
              { this.renderEmotions(this.state.emotions) }
          </Grid>
          <EmotionForm apiClient={this.state.apiClient}/>
          <Button onClick={this.logout}></Button>
        </Container>
      </div>
    )
  }
}

export default withStyles(styles)(withOktaAuth(Home));