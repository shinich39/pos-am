'use strict';

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from 'node:url';
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import ffmpeg from "fluent-ffmpeg";
import Web from "./libs/web.js";
import util from "./libs/util.js";
import { get } from "node:https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_PATH = path.join(__dirname, "tmp");
const SCRAPING_COUNT = 3;

const CRAWLERS = {
  ytdVideos: function(str) {
    const url = `https://www.youtube.com/results?search_query=${str}&sp=EgIQAQ%253D%253D`
  },
  ytdChannels: function(str) {
    const url = `https://www.youtube.com/results?search_query=${str}&sp=EgIQAg%253D%253D`
  },
  ytdPlaylists: function(str) {
    const url = `https://www.youtube.com/results?search_query=${str}&sp=EgIQAw%253D%253D`
  },
  sptMusics: function(str) {
    const url = `https://open.spotify.com/search/${str}/tracks`;
  },
  sptArtists: function(str) {
    const url = `https://open.spotify.com/search/${str}/artists`;
  },
  sptPlaylists: function(str) {
    const url = `https://open.spotify.com/search/${str}/playlists`;
  },
  sptAlbums: function(str) {
    const url = `https://open.spotify.com/search/${str}/albums`;
  },
}

function chkDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p);
  }
}

function getFiles(dirPath) {
  return fs.readdirSync(dirPath).reduce(function(prev, curr) {
    return fs.statSync(path.join(dirPath, curr)).isFile() ? 
      [path.join(dirPath, curr), ...prev] :
      [...prev, ...getFiles(path.join(dirPath, curr))]
  }, []);
}

function setTags(srcPath, dstPath, tags) {
  return new Promise(async function(resolve, reject) {
    let command = new ffmpeg();
    command.addInput(srcPath);

    if (tags.cover) {
      try {
        const c = await downloadCover(tags.cover);
        console.log(`> cover: ${c}`);
        command.addInput(c);
      } catch(err) {
        console.error(err);
      }
    }

    // command.audioCodec('libfaac');
    command.audioCodec('libmp3lame');
    command.audioBitrate(320);
    // command.audioQuality(0);

    command.addOutputOptions([
      // '-c', 'copy',
      "-map", "0", 
      "-map", "1",
      // '-map_metadata', "0",
      '-id3v2_version', "3",
      `-metadata`, `title= ${tags.title} `,
      `-metadata`, `artist= ${tags.artist} `,
      `-metadata`, `album_artist= ${tags.artist} `,
      // `-metadata`, `composer=${tags.artist}`,
      `-metadata`, `album= ${tags.album || ""} `,
    ]);

    command.on('end', resolve);
    command.on('error', reject);
    command.output(dstPath).run();
  });
}

// 01 title
// 01. title
// 01_title
function hasTrackNumber(filename) {
  return /^[0-9]+(\s|\_|\.)+/.test(filename);
}

function removeTrackNumber(filename) {
  return filename.replace(/^[0-9]+(\s|\_|\.)+/, "");
}

function parseFilePath(filePath) {
  let result = [];

  // normalize
  filePath = util.toHalfWidth(filePath).toLowerCase()
    .replace(/\s[-_]\s/g, "\/") // split artist - title
    .replace(/[\\\/]+/g, "\/");
  
  const parsedPath = path.parse(filePath);

  let filename = parsedPath.name;
  const dirs = parsedPath.dir.split(/[\\\/]+/).filter(function(item) {
    // remove directory Disk 1...Disk 2...
    // remove directory 01...02...03...
    return item.trim() !== "" && !(/^(disc.\d+|\d+)$/i.test(item));
  });

  // 01. title.mp3 => title.mp3
  if (hasTrackNumber(filename)) {
    filename = removeTrackNumber(filename);
  }

  // /artist/album/title.mp3
  // /artist - album/title.mp3
  // /artist/title.mp3

  if (dirs.length > 0) {
    for (const dir of dirs) {
      result.push({ title: filename, artist: dir });
    }
  } else {
    result.push({ title: filename, artist: null });
  }

  return result;
}

async function getTagsFromFilePath(filePath) {
  let queries = parseFilePath(filePath);
  let result = []
  for (const query of queries) {
    const queryString = query.artist ? `${query.artist} - ${query.title}` : `${query.title}`;
    let a = [], b = [], c = [], d = [];

    try {
      a = await getSpotifyData(queryString);
    } catch(err) {
      console.error(err);
    }

    try {
      b = await getAppleMusicData(queryString, "us");
    } catch(err) {
      console.error(err);
    }

    try {
      c = await getAppleMusicData(queryString, "jp");
    } catch(err) {
      console.error(err);
    }

    try {
      d = await getAppleMusicData(queryString, "kr");
    } catch(err) {
      console.error(err);
    }

    for (let i = 0; i < SCRAPING_COUNT; i++) {
      result.push(a[i], b[i], c[i], d[i]);
    }
  }

  result = result.filter(function(item) {
    return item;
  });

  result.forEach(function(item) {
    item.acc = 0;
    for (const query of queries) {
      const acc = query.artist ? 
        compare(`${query.artist}/${query.title}`, `${item.artist}/${item.title}`) :
        compare(`${query.title}`, `${item.title}`);
      if (item.acc < acc) {
        item.acc = acc;
      }
    }
  });

  result.sort(function(a, b) {
    return b.acc - a.acc;
  });

  return result[0];
}

function compare(a, b) {
  try {
    if (a.trim().legnth < 1 || b.trim().length < 1) {
      throw new Error("Arguments must be at least 1 characters.");
    }
    a = util.toHalfWidth(a).toLowerCase().replace(/\s/g, "");
    b = util.toHalfWidth(b).toLowerCase().replace(/\s/g, "");
    return util.diff(a, b).acc;
  } catch(err) {
    return 0;
  }
}

async function getSpotifyData(query) {
  const web = new Web();
  await web.init();
  await web.get(`https://open.spotify.com/search/${query}/tracks`);
  const $ = await web.toObject();
  const rows = $("div[data-testid='tracklist-row']").toArray();
  let data = [];
  for (let i = 0; i < Math.min(SCRAPING_COUNT, rows.length); i++) {
    const row = rows[i];
    const $$ = web.load(row);
    const links = $$("a").toArray();

    const titleLink = links.find(function(item) {
      return /^\/track\//.test(item.attribs?.href);
    });

    const aristLink = links.find(function(item) {
      return /^\/artist\//.test(item.attribs?.href);
    });

    const albumLink = links.find(function(item) {
      return /^\/album\//.test(item.attribs?.href);
    });

    const titleText = web.load(titleLink).text();
    const artistText = web.load(aristLink).text();
    const albumText = web.load(albumLink).text();

    await web.get(`https://open.spotify.com${titleLink.attribs.href}`);

    const $$$ = await web.toObject();
    // const titleText = $$$("[data-testid='entityTitle']").text();
    // const artistText = $$$("[data-testid='creator-link']").text();
    // const albumText = $$$("[data-testid='creator-link']").parent().parent().next().find("a").text();
    const coverSrc = $$$("img.mMx2LUixlnN_Fu45JpFB.CmkY1Ag0tJDfnFXbGgju._EShSNaBK1wUIaZQFJJQ.Yn2Ei5QZn19gria6LjZj")?.first().attr("src");

    data.push({
      provider: "Spotify",
      title: titleText.trim(),
      artist: artistText.trim(),
      album: albumText.trim(),
      cover: coverSrc,
    });
  }

  await web.destory();

  return data;
}

async function getAppleMusicData(query, locale) {
  const web = new Web();
  await web.init();
  await web.get(`https://music.apple.com/${locale}/search?term=${query}`);
  const $ = await web.toObject();
  const cards = $(".top-search-lockup-wrapper").toArray();
  let data = [];
  for (let i = 0; i < Math.min(SCRAPING_COUNT, cards.length); i++) {
    const card = cards[i];
    const $$ = web.load(card);
    const albumLink = $$("[data-testid='click-action']").attr('href');
    const titleText = $$(".top-search-lockup__primary").text();

    // is not song
    if (albumLink.indexOf(`\/${locale}\/album\/`) === -1) {
      continue;
    }

    await web.get(albumLink);
    const $$$ = await web.toObject();
    const albumText = $$$(".headings__title").text().trim();
    const artistText = $$$(".headings__subtitles").text().trim();
    const coverSrcset = $$$(".container-detail-header img.artwork-component__image")?.first().prev().attr("srcset");
    const coverSrc = coverSrcset.split(",")?.map(function(item) {
      return {
        src: item.split(" ")[0],
        width: item.split(" ")[1],
      }
    })?.sort(function(a, b) {
      return a.width.localeCompare(b.width, {
        numeric: true,
      });
    })?.pop()?.src;

    data.push({
      provider: `Apple Music (${locale})`,
      title: titleText.trim(),
      artist: artistText.trim(),
      album: albumText.trim(),
      cover: coverSrc,
    });
  }

  await web.destory();

  return data;
}

async function downloadCover(url) {
  chkDir(TMP_PATH);

  const dstPath = path.join(TMP_PATH, util.id() + ".jpg");
  const stream = fs.createWriteStream(dstPath, { flags: 'wx' });
  const { body } = await fetch(url);
  await finished(Readable.fromWeb(body).pipe(stream));

  return dstPath;
}

function getMetadata(srcPath) {
  return new Promise(function(resolve, reject) {
    ffmpeg.ffprobe(srcPath, function(err, metadata) {
      if (err) {
        reject(err);
        return;
      }
      resolve(parseMetadata(metadata));
    });
  });
}

function parseMetadata(metadata) {
  const title = metadata?.format?.tags?.title;
  const artist = metadata?.format?.tags?.artist;
  const composer = metadata?.format?.tags?.composer;
  const album = metadata?.format?.tags?.album;
  const genre = metadata?.format?.tags?.genre;
  const track = metadata?.format?.tags?.track;

  return {
    title,
    artist,
    composer,
    album,
    genre,
    track,
  }
}

async function exec(srcPath, dstPath, force) {
  chkDir(srcPath);
  chkDir(dstPath);

  // iTunes supported types
  // MP3
  // AAC
  // AIFF
  // WAV
  // Audible .aa files
  // M4A (purchased)
  // M4P (purchased)
  const filePaths = getFiles(srcPath)
    .filter(function(item) {
      return [".mp3",".wav"].indexOf(path.extname(item)) > -1;
    });

  // title(track), album, artist
  // album/track_number title
  // artist/album/track_number title
  let data = [];
  for (const filePath of filePaths) {
    if (!force) {
      try {
        const metadata = await getMetadata(filePath);
        if (metadata.title && (metadata.artist || metadata.composer)) {
          data.push({
            path: filePath,
            tags: {
              title: metadata.title,
              album: metadata.album,
              artist: metadata.artist || metadata.composer,
            }
          });
          continue;
        }
      } catch(err) {
        console.error(err);
      }
    }

    const relativePath = path.relative(srcPath, filePath);
    try {
      const tags = await getTagsFromFilePath(relativePath);
      if (!tags) {
        throw new Error("Tag not found.");
      }

      data.push({
        path: filePath,
        tags: {
          title: tags.title,
          album: tags.album,
          artist: tags.artist,
          cover: tags.cover,
        }
      });
    } catch(err) {
      console.error(err);

      data.push({
        path: filePath,
        tags: null
      });
    }
  }

  for (const d of data) {
    try {
      console.log("> path:", d.path);
      console.log("> title:", d.tags.title);
      console.log("> artist:", d.tags.artist);
      console.log("> album:", d.tags.album);
  
      const src = d.path;
      let dst = path.join(dstPath, `${d.tags.artist} - ${d.tags.title}.mp3`);
      let idx = 0;
      while(fs.existsSync(dst)) {
        dst = path.join(dstPath, `${d.tags.artist} - ${d.tags.title} (${++idx}).mp3`);
      }

      // add tags
      await setTags(src, dst, d.tags);
    } catch(err) {
      console.error(err);
    }
  }

  fs.rmSync(TMP_PATH, { recursive: true, force: true });
}

const __module__ = {
  exec,
}

// esm
export default __module__;

// cjs
// module.exports = __module__;

// browser
// window.jsm = __module__;