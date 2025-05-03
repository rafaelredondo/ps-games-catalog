class Game {
  constructor(id, name, platform, mediaType, coverUrl = '', rating = '', playtime = '', priority = '') {
    this.id = id;
    this.name = name;
    this.platform = platform;
    this.mediaType = mediaType;
    this.coverUrl = coverUrl;
    this.rating = rating;
    this.playtime = playtime;
    this.priority = priority;
  }
}

export default Game; 