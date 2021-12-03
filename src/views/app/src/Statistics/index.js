import React from 'react';
import APIClient from '../apiClient';
import { withStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import { withOktaAuth } from '@okta/okta-react';
import Container from 'react-bootstrap/Container';
import EmotionNav from "../EmotionNav";
import Grid from '@material-ui/core/Grid';
import Emotion from "../Emotion";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { BlinkingCursorTextBuilder } from 'react-animated-text-builders';
import Radar from "../Radar";

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 70
  },
});

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

const emotionToColor = {
    "Anger": "#e8c1a0",
    "Fear": "#f47560",
    "Joy": "#f1e15b",
    "Love": "#e8a838",
    "Sadness": "#61cdbb",
    "Surprise": "#97e3d5",
  }


class Statistics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          emotions: [],
          year: 2021,
        };
    }

    updateState = () => {
        this.apiClient.getEmotionsByYear(this.state.year).then(
            (data) => this.setState({...this.state, emotions: data.data})
        );
    }

    componentDidMount() {
        const accessToken = this.props.authState.accessToken.accessToken;
        this.apiClient = new APIClient(accessToken);
        this.apiClient.getEmotionsByYear(2021).then(
            (data) => {
                this.setState({...this.state, emotions: data.data});
            }
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
            for (var e in emotionToColor) {
                emotionCounts[e] += (emotion.emotion_data[e]/this.state.emotions.length);
            }
        }
        return (
            Object.keys(emotionCounts).map((emotion) => (
                    {
                        "emotion": emotion,
                        "December": emotionCounts[emotion],
                    }
                )
            )
        )
    }

    render() {
        return (
            <div className={styles.root}>
              <Container>
                <EmotionNav oktaAuth={this.props.oktaAuth} apiClient={this.apiClient}></EmotionNav>
                <BlinkingCursorTextBuilder
                    textStyle={{fontWeight :"bold", fontSize : "50px"}}
                    style={{marginTop:"10", marginBottom :"10px"}}
                    cursorComponent={<div>|</div>}
                    blinkTimeAfterFinish={-1}>Statistics
                </BlinkingCursorTextBuilder>
                <ButtonGroup style={{paddingLeft: 100}}aria-label="Basic example">
                    <DropdownButton variant="secondary" as={ButtonGroup} title="2019" id="bg-nested-dropdown" onClick={() => this.setState({ year: 2019 })}>
                        { months.map((m) =>
                        <Dropdown.Item eventKey={m}>{m}</Dropdown.Item>)}
                    </DropdownButton>
                    <DropdownButton variant="secondary" as={ButtonGroup} title="2020" id="bg-nested-dropdown" onClick={() => this.setState({ year: 2020 })}>
                    { months.map((m) =>
                        <Dropdown.Item eventKey={m}>{m}</Dropdown.Item>)}
                    </DropdownButton>
                    <DropdownButton variant="secondary" as={ButtonGroup} title="2021" id="bg-nested-dropdown" onClick={() => this.setState({ year: 2021 })}>
                    { months.map((m) =>
                        <Dropdown.Item eventKey={m}>{m}</Dropdown.Item>)}
                    </DropdownButton>
                </ButtonGroup>
                <div style={{height: 500, paddingBottom: 10}}>
                <Radar data={this.generateData()} />
                </div>
              </Container>
            </div>
        )
    }
}

export default withStyles(styles)(withOktaAuth(Statistics));