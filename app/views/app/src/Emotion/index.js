import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import CloseButton from 'react-bootstrap/CloseButton';

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
  }

  render() {
    return (
      <Card style={{background: emotionToColor[this.props.emotion.emotion], width: '18rem'}}>
        <Card.Header>
            <Row>
            <Col><CloseButton onClick={this.handleDelete}/></Col>
            <Col className="float-right" style={{float: 'right'}}>{this.props.emotion.date}</Col>
            </Row>
          </Card.Header>
        <Card.Body onClick={this.handleClick}>
          <Card.Title style={{display: 'flex', justifyContent: 'center'}}>
            {this.props.emotion.emotion}
          </Card.Title>
          <Card.Text style={{display: 'flex', justifyContent: 'center'}}>
          {this.props.emotion.status}
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
                {this.props.emotion.status}
              </Modal.Body>
            </Modal>
        </Card.Body>
      </Card>
    );
  }
}

export default (Emotion);