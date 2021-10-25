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
import Radar from "../Radar";

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 70
  },
});

class Statistics extends React.Component {
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

    generateData() {
        let emotionCounts = {
            "Anger": 0,
            "Fear": 0,
            "Surprise": 0,
            "Joy": 0,
            "Love": 0,
            "Sadness": 0,
        }
        for (const emotion of this.state.emotions) {
            emotionCounts[emotion.emotion] += 1;
        }
        for(var key in emotionCounts) {
            emotionCounts[key] = emotionCounts[key]/6;
          }
        return (
        [
            {
                "emotion": "Anger",
                "October": emotionCounts["Anger"],
            },
            {
                "emotion": "Love",
                "October": emotionCounts["Love"],
            },
            {
                "emotion": "Sadness",
                "October": emotionCounts["Sadness"],
            },
            {
                "emotion": "Fear",
                "October": emotionCounts["Fear"],
            },
            {
                "emotion": "Surprise",
                "October": emotionCounts["Surprise"],
            },
            {
                "emotion": "Joy",
                "October": emotionCounts["Joy"],
            }
        ]
        )
    }

    render() {
        return (
            <div className={styles.root}>
              <Container>
                <EmotionNav></EmotionNav>
                <BlinkingCursorTextBuilder
                    textStyle={{fontWeight :"bold", fontSize : "50px"}}
                    style={{marginTop:"10", marginBottom :"10px"}}
                    cursorComponent={<div>|</div>}
                    blinkTimeAfterFinish={-1}>Statistics
                </BlinkingCursorTextBuilder>
                <div style={{height: 600, marginTop: 20}}>
                <Radar data={this.generateData(this.state.emotions)} />
                </div>
              </Container>
            </div>
        )
    }
}

export default withStyles(styles)(withOktaAuth(Statistics));