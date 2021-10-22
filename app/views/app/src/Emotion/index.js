import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';

let emotionToColor = {
  "Anger": "Salmon",
  "Fear": "SandyBrown",
  "Joy": "Thistle",
  "Love": "PeachPuff",
  "Sadness": "SkyBlue",
  "Surprise": "PaleGreen",
}

class Emotion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
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

  // data = [
  //   {
  //     "id": "anger",
  //     "label": "anger",
  //     "value": this.props.emotion.anger,
  //     "color": "hsl(215, 70%, 50%)"
  //   },
  //   {
  //     "id": "fear",
  //     "label": "fear",
  //     "value": 533,
  //     "color": "hsl(59, 70%, 50%)"
  //   },
  //   {
  //     "id": "joy",
  //     "label": "Joy",
  //     "value": 35,
  //     "color": "hsl(127, 70%, 50%)"
  //   },
  //   {
  //     "id": "sadness",
  //     "label": "Sadness",
  //     "value": 505,
  //     "color": "hsl(295, 70%, 50%)"
  //   },
  //   {
  //     "id": "love",
  //     "label": "Love",
  //     "value": 108,
  //     "color": "hsl(229, 70%, 50%)"
  //   },
  //   {
  //     "id": "surprise",
  //     "label": "Surprise",
  //     "value": 108,
  //     "color": "hsl(229, 70%, 50%)"
  //   }
  // ]

  render() {
    return (
      <Card style={{background: emotionToColor[this.props.emotion.emotion], width: '18rem'}}>
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
            <Col className="float-right" style={{float: 'right', textAlign: 'right'}}>{this.props.emotion.date}</Col>
            </Row>
          </Card.Header>
        <Card.Body onClick={this.handleClick}>
          <Card.Title style={{display: 'flex', justifyContent: 'center'}}>
            {this.props.emotion.emotion}
          </Card.Title>
          <Card.Text style={{display: 'flex', justifyContent: 'center'}}>
          {this.props.emotion.status.slice(0,30) + "..."}
            </Card.Text>
          <Modal
            centered
            show={this.state.show}
            onHide={this.handleClick}
            keyboard={false}
            >
              <Modal.Header closeButton>
                <Modal.Title>{this.props.emotion.date}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
              <Modal.Title style={{color: emotionToColor[this.props.emotion.emotion], textAlign: 'center', marginBottom: 20}}>You felt {this.props.emotion.emotion}.</Modal.Title>
                {this.props.emotion.status}
              </Modal.Body>
            </Modal>
        </Card.Body>
      </Card>
    );
  }
}




export default (Emotion);