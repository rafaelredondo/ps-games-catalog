class Game {
  constructor(
    id, 
    name, 
    platforms = [], 
    mediaTypes = [], 
    coverUrl = '', 
    released = '', 
    metacritic = null,
    genres = [],
    publishers = [],
    description = '',
    completed = false,
    playTime = null
  ) {
    this.id = id;
    this.name = name;
    this.platforms = platforms;
    this.mediaTypes = mediaTypes;
    this.coverUrl = coverUrl;
    this.released = released;
    this.metacritic = metacritic;
    this.genres = genres;
    this.publishers = publishers;
    this.description = description;
    this.completed = completed;
    this.playTime = playTime;
  }
}

export default Game; 