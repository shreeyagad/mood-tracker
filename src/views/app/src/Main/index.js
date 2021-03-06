import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'
import { Security, LoginCallback, SecureRoute } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import Login from '../Login'
import Home from '../Home'
import Data from '../Data'
import Statistics from '../Statistics';

class Main extends Component {
  
  constructor(props) {
    super(props);
    this.oktaAuth = new OktaAuth({
      issuer: 'https://dev-51511124.okta.com/oauth2/default',
      clientId: '0oa2lchc6k2h1T0Ug5d7',
      redirectUri: window.location.origin + '/callback'
    });
    this.restoreOriginalUri = async (_oktaAuth, originalUri) => {
      props.history.replace(toRelativeUrl(originalUri, window.location.origin));
    };
  }
  
  render() {
    return (
      <Security oktaAuth={this.oktaAuth} restoreOriginalUri={this.restoreOriginalUri}>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/callback" component={LoginCallback} />
          <SecureRoute path="/home" component={Home} render={(props) => <Home {...props}/>}/>
          <SecureRoute path="/data" component={Data} render={(props) => <Data {...props}/>}/>
          <SecureRoute path="/statistics" component={Statistics} render={(props) => <Statistics {...props}/>}/>
        </Switch>
      </Security>
    );
  }
}

export default Main;