import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Redirect } from 'react-router-dom';
import { Link } from 'react';


class EmotionNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isGuest: false,
    };
    this.logout = this.logout.bind(this);
}

  logout = (e) => {
    e.preventDefault();
    if (this.props.unauthenticated) {
      this.setState({isGuest: true});
    }
    else {
    this.props.apiClient.uploadModel().then((value) => {
        this.props.oktaAuth.signOut();
      });
    }
  }

  render() {
    if (this.state.isGuest) {
      return <Redirect to='/' />
    }
    else {
      return (
          <Navbar bg="light" expand="lg" style={{marginBottom: 50, marginTop: 10}}>
          <Container>
            <Navbar.Brand 
              // as={Link}
              // href="/home"
              to={{
                pathname: '/home',
                state: { unauthenticated: this.props.unauthenticated},
              }}>Mood Tracker</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link
                  // as={Link}
                  // href="/data"
                  to={{
                    pathname: '/data',
                    state: { unauthenticated: this.props.unauthenticated},
                  }}>Data
                </Nav.Link>
                <Nav.Link
                  // as={Link}
                  // href="/statistics"
                  to={{
                    pathname: '/statistics',
                    state: { unauthenticated: this.props.unauthenticated},
                  }}>Statistics
                </Nav.Link>
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
}

export default EmotionNav;