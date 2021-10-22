import axios from 'axios';

const BASE_URI = 'http://localhost:4433';

const client = axios.create({
 baseURL: BASE_URI,
 json: true
});

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
    return this.perform('get', '/emotions/');
  }

  getUserData() {
    return this.perform('get', '/user/');
  }

  dateExists() {
    let date = new Date();
    let dateObjects = [date.getFullYear(), date.getMonth()+1,  date.getDate()];
    let dateString = dateObjects.join('-');
    return this.perform('get', `/emotions/${dateString}/`);
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