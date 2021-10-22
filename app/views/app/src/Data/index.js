import React from 'react';
import APIClient from '../apiClient';
import { withStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import { withOktaAuth } from '@okta/okta-react';
import Container from 'react-bootstrap/Container';
import EmotionNav from "../EmotionNav";
import Grid from '@material-ui/core/Grid';
import Emotion from "../Emotion";
import { BlinkingCursorTextBuilder } from 'react-animated-text-builders';

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 70
  },
});

class Data extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          emotions: [],
          apiClient: null,
        };
    }

    updateState = () => {
        this.state.apiClient.getEmotions().then((data) =>
          this.setState({...this.state, emotions: data.data})
        );
    }

    componentDidMount() {
        const accessToken = this.props.authState.accessToken.accessToken;
        const apiClient = new APIClient(accessToken);
        this.setState({ apiClient: apiClient });
        apiClient.getEmotions().then((data) =>
          this.setState({...this.state, emotions: data.data})
        );
    }

    renderEmotions = (emotions) => {
        // if (emotions.length > 0) { 
        //   return (
        //     emotions.map((emotion) => {
        //       return (
        //         <Emotion updateState={this.updateState} emotion={emotion} apiClient={this.state.apiClient} />
        //       );
        //     })
        //   )
        // }
        return (
            <Grid container style={{ marginLeft: 15, paddingTop: 75}} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 10 }}>
                {emotions.map((emotion) => (
                    <Grid item xs={2} sm={4} md={3} style={{paddingBottom: 50}}>
                        <Emotion updateState={this.updateState} emotion={emotion} apiClient={this.state.apiClient} />
                    </Grid>
                ))}
            </Grid>
        );




        // return (<h2 style={{textAlign: 'center'}}>You have no emotions logged. Start today!</h2>);
      }

    // add song recommender?

    // add a button that opens a modal that explains how the classifier works!


    render() {
        return (
            <div className={styles.root}>
              <Container>
                <EmotionNav></EmotionNav>
                <BlinkingCursorTextBuilder
                    textStyle={{fontWeight :"bold", fontSize : "50px"}}
                    style={{marginTop:"10", marginBottom :"10px"}}
                    cursorComponent={<div>|</div>}
                    blinkTimeAfterFinish={-1}>Data
                </BlinkingCursorTextBuilder>
                { this.renderEmotions(this.state.emotions) }
              </Container>
            </div>
        )
    }
}

export default withStyles(styles)(withOktaAuth(Data));