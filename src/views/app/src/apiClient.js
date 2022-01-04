import axios from 'axios';

const BASE_URI = 'http://localhost:4433';
// const BASE_URI = 'https://mood-tracker-sg.herokuapp.com';
// const BASE_URI = 'http://0.0.0.0:5000';

const client = axios.create({
 baseURL: BASE_URI,
 json: true
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

const offset = new Date().getTimezoneOffset();

class APIClient {
  constructor(accessToken=null) {
    if (accessToken) {
      this.accessToken = accessToken;
    }
    else {
      this.accessToken = "00Fxtkb5hq6kcmJKw98IpZTDiPIIEm4fuOjY20kTL2";
    }
  }

  createEmotion(emotion) {
    return this.perform('post', `/emotions/${offset}/`, emotion);
  }

  getEmotions() {
    return this.perform('get', `/emotions/${offset}/`);
  }

  updateEmotion(emotion_id, emotion_name) {
    let obj = Object({"emotion_name": emotion_name});
    return this.perform('put', `/emotions/${emotion_id}/${offset}/`, obj);
  }

  deleteEmotion(emotion_id) {
    return this.perform('delete', `/emotions/${emotion_id}/${offset}/`);
  }

  getEmotionsByDate(year, month, day) {
    return this.perform('get', `/emotions/${year}/${month}/${day}/${offset}/`);
  }

  getEmotionsByMonthAndYear(year, month) {
    return this.perform('get', `/emotions/${year}/${month}/${offset}/`);
  }

  getEmotionsByYear(year) {
    return this.perform('get', `/emotions/${year}/${offset}/`);
  }

  downloadModel() {
    return this.perform('get', `/download_model/`);
  }

  uploadStatus(emotion_id, status, emotion_name=null) {
    let obj = Object({"emotion_id": emotion_id, "status": status, "emotion_name": emotion_name});
    return this.perform('post', `/upload_status/`, obj);
  }

  uploadModel() {
    return this.perform('get', `/upload_model/`);
  }

  generateRadarData(yearMonthPairs) {
    let apiData = {};
    for (let y in yearMonthPairs) {
      apiData[y] = Array.from(yearMonthPairs[y]); // python does not accept Set()
    }
    return this.perform('post', `/generate_radar_data/${offset}/`, apiData);
  }

  async perform (method, resource, data) {
    return client({
      method,
      url: resource,
      data,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    }).then(resp => {
      return resp.data ? resp.data : resp.error;
    })
  }
}

export default APIClient;