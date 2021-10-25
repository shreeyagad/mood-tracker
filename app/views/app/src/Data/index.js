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
import { BlinkingCursorTextBuilder } from 'react-animated-text-builders';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css';

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 70
  },
});

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
        this.apiClient = null;
        this.state = {
          emotions: [],
        };
        this.handleClickDay = this.handleClickDay.bind(this);   
    }

    calendarStyle = ({
      fontWeight: 'bold',
    });

    updateState = () => {
        this.apiClient.getEmotions().then((data) =>
          this.setState({...this.state, emotions: data.data})
        );
    }

    componentDidMount() {
      const accessToken = this.props.authState.accessToken.accessToken;
      this.apiClient = new APIClient(accessToken);
    }

    handleClickDay(value, event) {
      let month = monthToMonthNum[value.toString().slice(4,7)];
      let day = value.toString().slice(8,10);
      let year = value.toString().slice(11,15);
      let dateString = [year, month, day].join('-');
      this.apiClient.getEmotions(dateString).then((data) => {
          this.setState({...this.state, emotions: data.data});
        }
      );
    }

    renderEmotions = (emotions) => {
      return (
          // <Grid container style={{ marginLeft: 15, paddingTop: 75}} spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 10 }}>
          <Container>
            {emotions.map((emotion) => (
                <Grid item xs={2} sm={4} md={3} style={{paddingBottom: 50}}>
                    <Emotion updateState={this.updateState} emotion={emotion} apiClient={this.apiClient} />
                </Grid>
            ))}
          {/* </Grid> */}
          </Container>
      );
    }

    render() {
        return (
            <div className={styles.root}>
              <Container>
                <EmotionNav></EmotionNav>
                <BlinkingCursorTextBuilder
                    textStyle={{fontWeight :"bold", fontSize : 50}}
                    style={{marginTop:"10", marginBottom :"10px"}}
                    cursorComponent={<div>|</div>}
                    blinkTimeAfterFinish={-1}>Data
                </BlinkingCursorTextBuilder>
                <h4 style={{textAlign: 'center', color: 'grey', marginBottom: 50}}>Click on day to see data.</h4>
                <Container>
                  <Row>
                    <Col sm={8}><Calendar style={{fontFamily: 'inherit'}}onClickDay={this.handleClickDay}/></Col>
                    <Col sm={4}>{ this.renderEmotions(this.state.emotions) }</Col>
                  </Row>
                </Container>
              </Container>
            </div>
        )
    }
}

export default withStyles(styles)(withOktaAuth(Data));