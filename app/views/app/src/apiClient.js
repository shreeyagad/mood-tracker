import axios from 'axios';

// const BASE_URI = 'http://localhost:4433';
const BASE_URI = 'https://mood-tracker-sg.herokuapp.com';

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

class APIClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  createEmotion(emotion) {
    return this.perform('post', '/emotions/', emotion);
  }

  deleteEmotion(emotion_id) {
    return this.perform('delete', `/emotions/${emotion_id}/`);
  }

  getEmotions() {
    return this.perform('get', `/emotions/`);
  }

  getEmotionsByDate(year, month, day) {
    return this.perform('get', `/emotions/${year}/${month}/${day}/`);
  }

  getEmotionsByMonthAndYear(year, month) {
    return this.perform('get', `/emotions/${year}/${month}/`);
  }

  getEmotionsByYear(year) {
    return this.perform('get', `/emotions/${year}/`);
  }

  getUserData() {
    return this.perform('get', '/user/');
  }

  // dateExists() {
  //   let date = new Date();
  //   let dateObjects = [date.getFullYear(), date.getMonth()+1,  date.getDate()];
  //   let dateString = dateObjects.join('-');
  //   return this.perform('get', `/emotions/${dateString}/`);
  // }

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