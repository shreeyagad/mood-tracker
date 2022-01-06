import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
// import { TransitionGroup, CSSTransition } from "react-transition-group";

class EmotionNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userName: ""
    };
    this.logout = this.logout.bind(this);
  }

  logout = (e) => {
    e.preventDefault();
    if (this.state.userName == "Guest") {
      this.props.apiClient.deleteAllEmotions().then((value) => {
        this.props.oktaAuth.signOut();
      });
    }
    else {
      this.props.apiClient.uploadModel().then((value) => {
        this.props.oktaAuth.signOut();
      });
    }
  }

  componentDidMount() {
    this.props.oktaAuth.getUser().then((user) => {
      if (user["family_name"] != "Guest") {
        this.setState({userName: user["name"]});
      }
      else {
        this.setState({userName: "Guest"});
      }
    });
  }

  render() {
    return (
        <Navbar bg="light" expand="lg" style={{marginBottom: 50, marginTop: 10}}>
        <Container>
          <Navbar.Brand href="\home">Mood Tracker</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/data">Data</Nav.Link>
              <Nav.Link href="/statistics">Statistics</Nav.Link>
            </Nav>
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} style={{
                color: "black"
                }}>
{this.state.userName}
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" style={{minWidth: "5rem", right: "10%"}}>
                <NavDropdown.Item as={Button} onClick={this.logout}>Log Out</NavDropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default EmotionNav;