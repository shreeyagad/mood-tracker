import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react'
import { Redirect } from 'react-router-dom'
import { withOktaAuth } from '@okta/okta-react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
  }

  async login() {
    await this.props.oktaAuth.signInWithRedirect();
  }

  render() {
    if (this.props.authState.isAuthenticated) {
      return <Redirect to='/home' />
    } else {
      return (
        <Container>
          <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <h1 style={{fontSize: 50, position: "absolute", top:"350px"}}>Welcome to Mood Tracker!</h1>
            <Button size="lg" style={{position: "relative", top:"50px", border: "black", background: "grey"}} onClick={this.login}>Login with Okta</Button>
          </div>
        </Container>
      )
    }
  }
}

export default withOktaAuth(Login);