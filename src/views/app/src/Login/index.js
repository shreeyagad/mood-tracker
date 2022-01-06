import React, { Component } from 'react';
import { withOktaAuth } from '@okta/okta-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { BlinkingCursorTextBuilder } from 'react-animated-text-builders';
import {Redirect} from 'react-router-dom';

class Login extends Component {
  constructor(props) {
    super(props);

    this.signIn = this.signIn.bind(this);
    this.signInAsGuest = this.signInAsGuest.bind(this);
  }
  
  async signIn() {
    await this.props.oktaAuth.signInWithRedirect();
  }

  async signInAsGuest(event) {
    event.preventDefault();
    const transaction = await this.props.oktaAuth.signIn({
      username: "guest@okta.com",
      password: "anonymous!"
    });

    if (transaction.status === 'SUCCESS') {
      this.props.oktaAuth.signInWithRedirect({sessionToken: transaction.sessionToken})
    } else {
      throw new Error('Could not sign in: ' + transaction.status);
    }
  }

  render() {
    if (this.props.authState.isAuthenticated) {
      return <Redirect to="/home"/>
    }
    else {
      return (
      <Container>
          <div style={{marginTop: 300}}>
          <BlinkingCursorTextBuilder
          textStyle={{fontWeight : "bold", fontSize : "50px"}}
          style={{marginBottom : "10px"}}
          cursorComponent={<div>|</div>}
          blinkTimeAfterFinish={-1}>Welcome  to  Mood  Tracker
          </BlinkingCursorTextBuilder>
          </div>
          <div style={{marginTop: 30, textAlign: 'center'}}>
          <Button style={{margin: 10}} size="lg" variant="primary" onClick={this.signIn}>Login with Okta</Button>
          <Button style={{margin: 10}} size="lg" variant="secondary" onClick={this.signInAsGuest}>Continue as Guest</Button>
          </div>
      </Container>
      );
    }
  }
}

export default withOktaAuth(Login);