const toInt = (str) => {
  const k = parseInt(str , 10);
  return k;
};

const urlify = async(text) =>{
  const urls = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  text.replace(urlRegex , (url) =>{
    urls.push(url)
  });
  return Promise.all(urls);
};

const getIframeURL = async($) =>{
  const iframe = await $.html().match(/(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))/g)[0];//[0].match(/(?<=src=").*?(?=[\?"])/g)
  const _url = await urlify(iframe)
  const url = String(_url[0]);

  return Promise.resolve(url);
};


module.exports = {
  toInt,
  getIframeURL
};