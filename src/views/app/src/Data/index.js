import React from 'react';
import APIClient from '../apiClient';
import { withStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import { withOktaAuth } from '@okta/okta-react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import EmotionNav from "../EmotionNav";
import Grid from '@material-ui/core/Grid';
import Emotion from "../Emotion";
import PieChart from "../PieChart";
import { BlinkingCursorTextBuilder } from 'react-animated-text-builders';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css';

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 70
  },
});

const emotionToColor = {
  "Anger": "#f47560",
  "Fear": "#e8c1a0",
  "Joy": "#f1e15b",
  "Love": "#e8a838",
  "Sadness": "#61cdbb",
  "Surprise": "#97e3d5",
}

const monthToMonthNum = {
  "Jan": "01",
  "Feb": "02",
  "Mar": "03",
  "Apr": "04",
  "May": "05",
  "Jun": "06",
  "Jul": "07",
  "Aug": "08",
  "Sep": "09",
  "Oct": "10",
  "Nov": "11",
  "Dec": "12",
};

class Data extends React.Component {
    constructor(props) {
        super(props);
        const accessToken = this.props.authState.accessToken.accessToken;
        this.apiClient = new APIClient(accessToken);
        this.state = {
          emotions: [],
          aggregateData: [],
          currentDay: [],
        };
        this.handleClickDay = this.handleClickDay.bind(this);   
        this.getAggregateData = this.getAggregateData.bind(this);
    }

    calendarStyle = ({
      fontWeight: 'bold',
    });

    updateState = (currentDay) => {
      currentDay = currentDay ? currentDay : this.state.currentDay;
      this.apiClient.getEmotionsByDate(...currentDay).then((data) => {
          this.setState({...this.state, emotions: data.data});
          this.setState({...this.state, aggregateData: this.getAggregateData(data.data)});
        }
      )
    }

    componentDidMount = () => {
      let today = new Date();
      let currentDay = [today.getFullYear(), today.getMonth()+1, today.getDate()];
      this.setState({currentDay: currentDay});
      this.updateState(currentDay);
    }

    handleClickDay = (value) => {
      let month = parseInt(monthToMonthNum[value.toString().slice(4,7)]);
      let day = parseInt(value.toString().slice(8,10));
      let year = parseInt(value.toString().slice(11,15));
      this.setState({currentDay: [year, month, day]});
      this.apiClient.getEmotionsByDate(year, month, day).then((data) => {
          this.setState({...this.state, emotions: data.data});
          this.setState({...this.state, aggregateData: this.getAggregateData(data.data)});
        }
    );
    }

    getAggregateData(emotions) {
      if (emotions.length <= 0) {
        return [];
      }
      function transformNum(num) {return parseFloat(num).toFixed(2)}
      var aggregateData = {}
      for (var e1 in emotionToColor) { // set up dict
        aggregateData[e1] = {
          "id": e1,
          "label": e1,
          "value": 0,
          "color": emotionToColor[e1],
        }
      }
      for (const emotion of emotions) {
        Object.keys(emotionToColor).map(key => ( // aggregate the data
          aggregateData[key]["value"] += emotion.emotion_data[key]
        ))
      }
      for (var e2 in emotionToColor) {
        aggregateData[e2]["value"] = transformNum(aggregateData[e2]["value"] / emotions.length); // normalize the data
      }
      return Object.values(aggregateData);
    }

    renderEmotions = (emotions) => {
      return (
        <Container>
          {emotions.map((emotion) => (
          <Grid style={{paddingBottom: 25}}>
            <Emotion key={emotion.aws_id} updateState={this.updateState} emotion={emotion} apiClient={this.apiClient} />
          </Grid>
          ))}
        </Container>
      );
    }

    render() {
      return (
          <div className={styles.root}>
            <Container>
              <EmotionNav oktaAuth={this.props.oktaAuth} apiClient={this.apiClient}></EmotionNav>
              <BlinkingCursorTextBuilder
                  textStyle={{fontWeight :"bold", fontSize : 50}}
                  style={{marginTop:"10", marginBottom :"10px"}}
                  cursorComponent={<div>|</div>}
                  blinkTimeAfterFinish={-1}>Data
              </BlinkingCursorTextBuilder>
              <h4 style={{textAlign: 'center', color: 'grey', marginBottom: 50}}>Click on day to see data.</h4>
              <Container>
                <Row>
                  <Col sm={4} style={{padding: 0}}><Calendar style={{fontFamily: 'inherit'}} onClickDay={this.handleClickDay}/></Col>
                  <Col sm={6}><Container style={{height: 400, position: 'relative', left: -100}}><PieChart data={this.state.aggregateData}/></Container></Col>
                  <Col sm={2} style={{position: 'relative', left: -150}}>
                    { this.renderEmotions(this.state.emotions) }
                  </Col>
                </Row>
              </Container>
            </Container>
          </div>
      )
    }
}

export default withStyles(styles)(withOktaAuth(Data));