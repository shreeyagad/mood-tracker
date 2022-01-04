import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react'
import { Redirect } from 'react-router-dom'
import { withOktaAuth } from '@okta/okta-react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { BlinkingCursorTextBuilder } from 'react-animated-text-builders';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.loginAsGuest = this.loginAsGuest.bind(this);
    this.state = {
      isGuest: false,
    }
  }

  async loginAsGuest() {
    this.setState({isGuest: true});
  }

  async login() {
    await this.props.oktaAuth.signInWithRedirect();
  }

  render() {
    if (this.props.authState.isAuthenticated || this.state.isGuest) {
      return <Redirect to={{pathname: '/home', state: { unauthenticated: this.state.isGuest} }} />
    } else {
      return (
        <Container>
          <div style={{marginTop: 300, alignItems: 'center', justifyContent: 'center'}}>
            <BlinkingCursorTextBuilder
            textStyle={{fontWeight :"bold", fontSize : "50px"}}
            style={{marginBottom :"10px"}}
            cursorComponent={<div>|</div>}
            blinkTimeAfterFinish={-1}>Welcome  to  Mood  Tracker
            </BlinkingCursorTextBuilder>
          </div>
          <div style={{marginTop: 30, textAlign: 'center'}}>
            <Button style={{margin: 10}} size="lg" variant="primary" onClick={this.login}>Login with Okta</Button>
            <Button style={{margin: 10}} size="lg" variant="secondary" onClick={this.loginAsGuest}>Continue as Guest</Button>
          </div>
        </Container>
      )
    }
  }
}

export default withOktaAuth(Login);