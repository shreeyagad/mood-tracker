import React from 'react';
import APIClient from '../apiClient';
import { withStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import { withOktaAuth } from '@okta/okta-react';
import Container from 'react-bootstrap/Container';
import EmotionNav from "../EmotionNav";
import Dropdown from 'react-bootstrap/Dropdown';
import { BlinkingCursorTextBuilder } from 'react-animated-text-builders';
import Radar from "../Radar";
import Form from 'react-bootstrap/Form';

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
const monthsToIndex = {}
for (let i = 0; i < months.length; i++) {
    let month = months[i];
    monthsToIndex[month] = i;
}

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
        let yearMonthPairs = {
            2020: new Set(),
            2021: new Set(),
            2022: new Set()
        }
        this.state = {
            yearMonthPairs: yearMonthPairs,
            radarEmotionData: []
        };
        const accessToken = this.props.authState.accessToken.accessToken;
        this.apiClient = new APIClient(accessToken);

        this.handleChange = this.handleChange.bind(this);
        this.getMonths = this.getMonths.bind(this);
    }

    handleChange = (year, month) => {
        let tempPairs = this.state.yearMonthPairs;
        if (tempPairs[year].has(month)) {
            tempPairs[year].delete(month);
        }
        else {
            tempPairs[year].add(month)
        }
        this.apiClient.generateRadarData(tempPairs).then(
            (data) => {
                this.setState({radarEmotionData: data.data});
                this.setState({yearMonthPairs: tempPairs});
            }
        );
    }

    getMonths() {
        let tempMonths = [];
        let tempPairs = this.state.yearMonthPairs;
        Object.keys(tempPairs).forEach((year) => 
            Array.from(tempPairs[year]).forEach(
                (m) => tempMonths.push(m + " " + year)
            ))
        return tempMonths;
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
                {([2020, 2021, 2022]).map(year => {
                    return (
                    <Dropdown className="d-inline mx-2" autoClose="outside">
                        <Dropdown.Toggle 
                            onToggle={() => {this.setState({year: year})}} 
                            variant="secondary" 
                            id="dropdown-autoclose-outside"
                        >
                            {year}
                        </Dropdown.Toggle>
                        <Dropdown.Menu variant="dark">{
                            months.map(month =>
                            <Dropdown.Item as="button">
                                <Form.Check 
                                    type={"checkbox"}
                                    id={month}
                                    label={month}
                                    onChange={() => this.handleChange(year, month)}
                                />
                            </Dropdown.Item>)
                        }
                        </Dropdown.Menu>
                    </Dropdown>);}
                )}
                <div style={{height: 500, paddingBottom: 10}}>
                <Radar months={this.getMonths()} data={this.state.radarEmotionData} />
                </div>
              </Container>
            </div>
        )
    }
}

export default withStyles(styles)(withOktaAuth(Statistics));