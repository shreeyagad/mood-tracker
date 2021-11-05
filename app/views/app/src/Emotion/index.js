import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import PieChart from "../PieChart";
import Container from 'react-bootstrap/Container';

const emotionToColor = {
  "Anger": "#e8c1a0",
  "Fear": "#f47560",
  "Joy": "#f1e15b",
  "Love": "#e8a838",
  "Sadness": "#61cdbb",
  "Surprise": "#97e3d5",
}

class Emotion extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      show: false,
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    function transformNum(num) {return parseFloat(num).toFixed(2)}
    this.emotionData = 
      Object.keys(emotionToColor).map(emotion => (
      {
        "id": emotion,
        "label": emotion,
        "value": transformNum(this.props.emotion.emotion_data[emotion]),
        "color": emotionToColor[emotion],
      }));
  }

  handleClick(event) {
    this.setState({
      show: !this.state.show
    });
  }

  handleDelete(event) {
    this.props.apiClient.deleteEmotion(this.props.emotion.id);
    this.props.updateState();
    this.props.updateState();
  }

  render() {
    return (
      <Card style={{background: emotionToColor[this.props.emotion.emotion], width: '20rem'}}>
        <Card.Header>
          <Row>
            <Col>
              <button onClick={this.handleDelete} style={{border: 0, backgroundColor: 'transparent'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16" >
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
              </button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body onClick={this.handleClick} style={{paddingBottom: 0}}>
          <Card.Text style={{display: 'flex', justifyContent: 'center'}}>
          <p>{this.props.emotion.status.slice(0,30) + "..."}</p>
            </Card.Text>
          <Modal centered show={this.state.show} onHide={this.handleClick} keyboard={false}>
            <Modal.Header closeButton>
              <Modal.Title>{this.props.emotion.date}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Modal.Title style={{color: emotionToColor[this.props.emotion.emotion], textAlign: 'center', marginBottom: 20}}>You felt {this.props.emotion.emotion}.</Modal.Title>
              <p>{this.props.emotion.status}</p>
              <Container style={{height: 350}}><PieChart data={this.emotionData}/></Container>
            </Modal.Body>
          </Modal>
        </Card.Body>
      </Card>
    );
  }
}




export default Emotion;