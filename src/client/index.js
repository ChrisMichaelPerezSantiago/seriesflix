const cloudscraper = require('cloudscraper');

class Client{
  get(url , conf = {}){
    return cloudscraper.get(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  }
}

module.exports = {
  Client
};