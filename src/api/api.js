const cheerio = require('cheerio');
const {client} = require('../client/client');
const {toInt} = require('./utils/index');
const {BASE_URL} = require('./url/index');

const mostPopularSeries = async() =>{
  const res = await client.get('https://seriesflix.co/');
  const $ = cheerio.load(res);

  const promise = $('div.Main section div.MovieListTop div.TPostMv div.TPost')
    .map((index , element) => new Promise(async(resolve, reject) =>{
    const $element = $(element);
    const id = 'series/'.concat($element.find('a').attr('href').split('/')[4]).trim();
    const title = $element.find('a h2.Title').text().trim();
    const poster = $element.find('div.Image figure img').attr('data-src');
    const type = $element.find('div.Image span.Qlty').text().trim();
    const extra = await contentHandler(id);

    resolve({
      id: id || null,
      title: title || null,
      poster: poster || null,
      type: type || null,
      extra: extra || null
    });
  }));

  const data = promise.get();

  return Promise.all(data);
}

const contentHandler = async(id) =>{
  const res = await client.get(`${BASE_URL}/${id}`);
  const $ = cheerio.load(res);

  const promise = $('article.TPost header.Container').map((index , element) => new Promise((resolve, reject) =>{
    const $element = $(element);
    const seasons = toInt($element.find('div.TPMvCn p.SubTitle span').eq(0).text().trim());
    const year = toInt($element.find('div.TPMvCn div.Info span.Date').text().trim());
    const active = $element.find('div.TPMvCn div.Info span.Qlty').text().trim();
    const background_img = 'https:'.concat($element.find('div.Image figure.Objf img.TPostBg ').attr('data-src')).trim();
    const time = $element.find('div.TPMvCn div.Info span.Time').text().trim();
    const desc = $element.find('div.TPMvCn div.Description p').text().trim();
    const directors = [];
    $element.find('div.TPMvCn div.Description p.Director tt.tt-at').each((index , el) =>{
      const $el = $(el);
      const name = $el.find('a').text().trim();
      directors.push({name});
    });
    const genres = [];
    $element.find('div.TPMvCn div.Description p.Genre a').each((index , el) =>{
      const $el = $(el);
      const genre = $el.attr('href').split('/')[4]
      genres.push({genre});
    });
    const casts = [];
    $element.find('div.TPMvCn div.Description p.Cast a').each((index , el) =>{
      const $el = $(el);
      const name = $el.text().trim();
      casts.push({name});
    });
    resolve({
      background_img: background_img || null,
      seasons: seasons || null,
      desc: desc || null,
      year: year || null,
      active: active || null,
      time: time || null,
      directors: directors || null,
      genres: genres || null,
      cast: casts || null,
    });
  }));

  const _episodes = $('div.Main div.TpRwCont main section.SeasonBx').map((index , element) => new Promise(async(resolve, reject) =>{
    const $element = $(element);
    const id = 'temporada/'.concat($element.find('div.Title a').attr('href').split('/')[4]).trim();
    const episodes = await seasonHanlder(id);
    resolve({ 
      season: index + 1 , 
      episodes: episodes
    });
  }));

  const episodes = Promise.all(_episodes.get());
  const data = Promise.all(promise.get());
  const _result = (await data).map((doc) => new Promise(async(resolve, reject) =>{
    resolve({
      background_img: doc.background_img || null,
      seasons: doc.seasons || null,
      desc: doc.desc || null,
      year: doc.year || null,
      active: doc.active || null,
      time: doc.time || null,
      directors: doc.directors || null,
      genres: doc.genres || null,
      cast: doc.cast || null,
      episodes: await episodes || null,
    });
  }));
  
  const result = await Promise.all(_result);

  return Promise.all(result);
}

const seasonHanlder = async(id) =>{
  const res = await client.get(`${BASE_URL}/${id}`);
  const $ = cheerio.load(res);

  const promise = $('table tbody tr.Viewed').map((index , element) => new Promise((resolve, reject) =>{
    const $element = $(element);
    const episode = $element.find('td.MvTbTtl a').text().trim();
    const preview_img = 'https:'.concat($element.find('td.MvTbImg a.MvTbImg img.imglazy').attr('data-src')).trim();
    const episode_id = 'episodio/'.concat($element.find('td.MvTbTtl a').attr('href').split('/')[4]).trim();
    const date = $element.find('td.MvTbTtl span').text().trim();
    resolve({
      episode: episode || null,
      episode_id: episode_id || null,
      preview_img: preview_img || null,
      date: date || null
    });
  }));

  const data = promise.get();

  return Promise.all(data);
};