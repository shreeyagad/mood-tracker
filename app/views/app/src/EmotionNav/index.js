import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

class EmotionNav extends React.Component {

  logout = (e) => {
    e.preventDefault();
    this.props.oktaAuth.signOut();
  }

  render() {
    return (
        <Navbar bg="light" expand="lg" style={{marginBottom: 50, marginTop: 10}}>
        <Container>
          <Navbar.Brand href="/home">Mood Tracker</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/data">Data</Nav.Link>
              {/* <Nav.Link href="/profile">Profile</Nav.Link> */}
              {/* <Nav.Link href="/about">About</Nav.Link> */}
            </Nav>
            <Nav>
              <Button variant="light" onClick={this.logout} style={{float: 'right'}}>Log Out</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default EmotionNav;