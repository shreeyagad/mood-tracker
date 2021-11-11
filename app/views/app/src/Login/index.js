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
  }

  async login() {
    console.log(this.props.oktaAuth);
    await this.props.oktaAuth.signInWithRedirect();
  }

  render() {
    if (this.props.authState.isAuthenticated) {
      return <Redirect to='/home' />
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
          <div style={{textAlign: 'center', alignItems: 'center', justifyContent: 'center'}}>
            <Button style={{marginTop: 20}} size="lg" variant="light" onClick={this.login}>Login with Okta</Button>
          </div>
        </Container>
      )
    }
  }
}

export default withOktaAuth(Login);