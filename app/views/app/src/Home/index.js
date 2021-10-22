import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import Alert from 'react-bootstrap/Alert';
import Grid from '@material-ui/core/Grid';
import Row from 'react-bootstrap/Row';
import { withOktaAuth } from '@okta/okta-react';
import Emotion from "../Emotion"
import EmotionForm from "../EmotionForm"
import Container from 'react-bootstrap/Container';
import APIClient from '../apiClient';
import EmotionNav from "../EmotionNav";
import { BlinkingCursorTextBuilder } from 'react-animated-text-builders';

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 70
  },
  ml3: {
    fontWeight: 900,
    fontSize: 3.5
  }
});

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      emotions: [],
      apiClient: null,
      show: false,
    };
  }

  componentDidMount() {
    const accessToken = this.props.authState.accessToken.accessToken;
    const apiClient = new APIClient(accessToken);
    this.setState({ apiClient: apiClient });
    apiClient.getEmotions().then((data) =>
      this.setState({...this.state, emotions: data.data})
    );
  }

  showAlert = () => {
    this.setState({show: true});
  }

  hideAlert = () => {
    this.setState({show: false});
  }

  render() {
    return (
      <div className={styles.root}>
        <Container>
          <EmotionNav oktaAuth={this.props.oktaAuth}></EmotionNav>
          <BlinkingCursorTextBuilder
            textStyle={{fontWeight :"bold", fontSize : "50px"}}
            style={{marginTop:"200px", marginBottom :"10px"}}
            cursorComponent={<div>|</div>}
            blinkTimeAfterFinish={-1}>Welcome  to  Mood  Tracker
          </BlinkingCursorTextBuilder>
          <h4 style={{textAlign: 'center', paddingTop: 20, color: 'grey'}}>Enter your daily status below.</h4>

          <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js"></script>
          <Row>
          <EmotionForm showAlert={this.showAlert} apiClient={this.state.apiClient}/>
          <Alert style={{marginBottom: 50, backgroundColor: 'transparent', border: 'transparent'}} show={this.state.show} variant="danger" onClose={() => this.hideAlert()}>
              You already entered a status for today.
          </Alert>
          </Row>
        </Container>
      </div>
    )
  }
}

export default withStyles(styles)(withOktaAuth(Home));