import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Grid from '@material-ui/core/Grid';
import Row from 'react-bootstrap/Row';
import { withOktaAuth } from '@okta/okta-react';
import EmotionForm from "../EmotionForm"
import Container from 'react-bootstrap/Container';
import APIClient from '../apiClient';
import EmotionNav from "../EmotionNav";
import { BlinkingCursorTextBuilder } from 'react-animated-text-builders';
import Modal from 'react-bootstrap/Modal';
import PieChart from "../PieChart";

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

const emotionToColor = {
  "Anger": "#e8c1a0",
  "Fear": "#f47560",
  "Joy": "#f1e15b",
  "Love": "#e8a838",
  "Sadness": "#61cdbb",
  "Surprise": "#97e3d5",
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      emotions: [],
      apiClient: null,
      show: false,
      currEmotion: null,
      disagreeShow: false,
    };
    this.showModal =  this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.generateModal = this.generateModal.bind(this);
    this.handleDisagree = this.handleDisagree.bind(this);
    this.model = null;
  }

  componentDidMount() {
    const accessToken = this.props.authState.accessToken.accessToken;
    const apiClient = new APIClient(accessToken);
    this.setState({ apiClient: apiClient });
    apiClient.getEmotions().then((data) =>
      this.setState({...this.state, emotions: data.data})
    );
    if (this.model != null) {
      this.model = apiClient.getModel();
    }
  }

  showModal(newEmotion) {
    this.setState({currEmotion: newEmotion.data});
    this.setState({show: true});
  }

  hideModal() {
    this.setState({show: false});
  }

  getEmotionData(emotion) {
    function transformNum(num) {return parseFloat(num).toFixed(2)};
    return (
      Object.keys(emotionToColor).map(e => (
      {
        "id": e,
        "label": e,
        "value": transformNum(emotion.emotion_data[e]),
        "color": emotionToColor[e],
      }))
    )
  }

  handleDisagree() {
    this.setState({show: false});
    return (
      <Modal centered backdrop="static" onHide={this.hideModal} keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{this.state.currEmotion.date}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Title style={{color: emotionToColor[this.state.currEmotion.emotion], textAlign: 'center', marginBottom: 20}}>Select the emotion you feel.</Modal.Title>
          <p>{this.state.currEmotion.status}</p>
          {/* <Container style={{height: 400}}><PieChart data={this.emotionData}/></Container> */}
        </Modal.Body>
        <Modal.Footer>
          {Object.keys(emotionToColor).map((e) =>
            <Button style={{backgroundColor: emotionToColor[e], border: 'none'}} onClick={this.hideModal}>
              e
            </Button>
          )}
      </Modal.Footer>
      </Modal>
    )
  }

  generateModal() {
    if (this.state.show) {
      return (
        <Modal centered backdrop="static" show={this.state.show} onHide={this.hideModal} keyboard={false}>
          <Modal.Header>
            <Modal.Title>{this.state.currEmotion.date}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Title style={{color: emotionToColor[this.state.currEmotion.emotion], textAlign: 'center', marginBottom: 20}}>You felt {this.state.currEmotion.emotion}.</Modal.Title>
            <p>{this.state.currEmotion.status}</p>
            <Container style={{height: 400}}><PieChart data={this.getEmotionData(this.state.currEmotion)}/></Container>
          </Modal.Body>
          <Modal.Footer>
          <Button style={{backgroundColor: "#61cdbb", border: 'none'}} onClick={this.hideModal}>
            Agree
          </Button>
          <Button style={{backgroundColor: "#f47560", border: 'none'}} onClick={this.handleDisagree}>
            Disagree
          </Button>
        </Modal.Footer>
        </Modal>
      )
    }
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
            <EmotionForm showModal={this.showModal} showAlert={this.showAlert} apiClient={this.state.apiClient}/>
            {this.generateModal()}
          </Row>
        </Container>
      </div>
    )
  }
}

export default withStyles(styles)(withOktaAuth(Home));