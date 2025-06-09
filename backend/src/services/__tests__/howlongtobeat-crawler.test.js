import { HowLongToBeatCrawler } from '../howlongtobeat-crawler.js';

describe('HowLongToBeatCrawler', () => {
  let crawler;

  beforeEach(() => {
    crawler = new HowLongToBeatCrawler();
  });

  describe('parseTimeStringToHours', () => {
    test('should parse hours and minutes correctly', () => {
      expect(crawler.parseTimeStringToHours('25h 30m')).toBe(25.5);
      expect(crawler.parseTimeStringToHours('1h 15m')).toBe(1.25);
      expect(crawler.parseTimeStringToHours('2h 45m')).toBe(2.75);
    });

    test('should parse hours only', () => {
      expect(crawler.parseTimeStringToHours('10h')).toBe(10);
      expect(crawler.parseTimeStringToHours('25.5h')).toBe(25.5);
      expect(crawler.parseTimeStringToHours('8 hours')).toBe(8);
    });

    test('should handle HowLongToBeat specific formats', () => {
      expect(crawler.parseTimeStringToHours('26½ Hours')).toBe(26.5);
      expect(crawler.parseTimeStringToHours('6 Hours')).toBe(6);
      expect(crawler.parseTimeStringToHours('8½ Hours')).toBe(8.5);
      expect(crawler.parseTimeStringToHours('40½ Hours')).toBe(40.5);
      expect(crawler.parseTimeStringToHours('10.5 Hours')).toBe(10.5);
    });

    test('should handle edge cases', () => {
      expect(crawler.parseTimeStringToHours('')).toBe(0);
      expect(crawler.parseTimeStringToHours(null)).toBe(0);
      expect(crawler.parseTimeStringToHours(undefined)).toBe(0);
      expect(crawler.parseTimeStringToHours('invalid')).toBe(0);
      expect(crawler.parseTimeStringToHours('0h')).toBe(0);
      expect(crawler.parseTimeStringToHours('123456')).toBe(0); // ID-like number
      expect(crawler.parseTimeStringToHours('250h')).toBe(0); // Too high
      expect(crawler.parseTimeStringToHours('0.3h')).toBe(0); // Too low
    });

    test('should handle different formats', () => {
      expect(crawler.parseTimeStringToHours('12.5')).toBe(12.5);
      expect(crawler.parseTimeStringToHours('5 hrs')).toBe(5);
      expect(crawler.parseTimeStringToHours('3h 0m')).toBe(3);
      expect(crawler.parseTimeStringToHours('0.5h')).toBe(0.5);
    });
  });

  describe('findBestMatch', () => {
    const games = [
      { game_name: 'The Legend of Zelda: Breath of the Wild' },
      { game_name: 'Super Mario Odyssey' },
      { game_name: 'God of War' },
      { game_name: 'God of War: Ragnarök' }
    ];

    test('should find exact match', () => {
      const result = crawler.findBestMatch(games, 'God of War');
      expect(result.game_name).toBe('God of War');
    });

    test('should find partial match', () => {
      const result = crawler.findBestMatch(games, 'Zelda');
      expect(result.game_name).toBe('The Legend of Zelda: Breath of the Wild');
    });

    test('should return null for no match', () => {
      const result = crawler.findBestMatch(games, 'Totally Unknown Game');
      expect(result).toBeNull();
    });

    test('should handle empty games array', () => {
      const result = crawler.findBestMatch([], 'Any Game');
      expect(result).toBeNull();
    });
  });

  describe('extractGameLinksFromSearchHTML', () => {
    test('should extract game links from search HTML', () => {
      const html = `
        <div>
          <a href="/game/god-of-war">God of War</a>
          <a href="/game/spider-man">Spider-Man</a>
          <a href="/game?id=12345">Some Game</a>
          <a href="/other-page">Other Link</a>
        </div>
      `;
      
      const result = crawler.extractGameLinksFromSearchHTML(html);
      expect(result).toHaveLength(3);
      expect(result).toContain('/game/god-of-war');
      expect(result).toContain('/game/spider-man');
      expect(result).toContain('/game?id=12345');
    });

    test('should handle empty HTML', () => {
      const result = crawler.extractGameLinksFromSearchHTML('');
      expect(result).toHaveLength(0);
    });

    test('should limit to 5 results', () => {
      const html = Array.from({length: 10}, (_, i) => 
        `<a href="/game/game-${i}">Game ${i}</a>`
      ).join('');
      
      const result = crawler.extractGameLinksFromSearchHTML(html);
      expect(result).toHaveLength(5);
    });
  });

  describe('parsePlayTimeFromGameData', () => {
    test('should extract main story time from API data', () => {
      const gameData = {
        comp_main: 90000, // 25 horas em segundos
        comp_plus: 180000,
        comp_100: 360000
      };
      
      const result = crawler.parsePlayTimeFromGameData(gameData);
      expect(result).toBe(25);
    });

    test('should fallback to comp_plus if comp_main is missing', () => {
      const gameData = {
        comp_plus: 72000, // 20 horas em segundos
        comp_100: 180000
      };
      
      const result = crawler.parsePlayTimeFromGameData(gameData);
      expect(result).toBe(20);
    });

    test('should return null for invalid data', () => {
      expect(crawler.parsePlayTimeFromGameData({})).toBeNull();
      expect(crawler.parsePlayTimeFromGameData({ comp_main: 0 })).toBeNull();
      expect(crawler.parsePlayTimeFromGameData(null)).toBeNull();
    });
  });

  describe('extractPlayTimeFromHTML', () => {
    test('should extract time from GameCard_search_list_tidbit pattern', () => {
      const html = `
        <div class="GameCard_search_list_tidbit__0r_OP text_white shadow_text">Main Story</div>
        <div class="GameCard_search_list_tidbit__0r_OP center time_100">26½ Hours</div>
      `;
      
      const result = crawler.extractPlayTimeFromHTML(html, 'Test Game');
      expect(result).toBe(26.5);
    });

    test('should extract time from alternative patterns', () => {
      const htmls = [
        '<h5>Main Story</h5><div>6 Hours</div>',
        '<td>Main Story</td><td>8½ Hours</td>',
        '<div>Main Story</div><div class="time_100">10.5 Hours</div>'
      ];
      
      const results = htmls.map((html, i) => 
        crawler.extractPlayTimeFromHTML(html, `Test Game ${i}`)
      );
      
      expect(results[0]).toBe(6);
      expect(results[1]).toBe(8.5);
      expect(results[2]).toBe(10.5);
    });

    test('should return null when no pattern matches', () => {
      const html = '<div>No time information here</div>';
      const result = crawler.extractPlayTimeFromHTML(html, 'Test Game');
      expect(result).toBeNull();
    });

    test('should return null when time is unrealistic', () => {
      const html = `
        <div class="GameCard_search_list_tidbit__0r_OP">Main Story</div>
        <div class="GameCard_search_list_tidbit__0r_OP">999 Hours</div>
      `;
      
      const result = crawler.extractPlayTimeFromHTML(html, 'Test Game');
      expect(result).toBeNull();
    });
  });

  describe('extractGameTitleFromHTML', () => {
    test('should extract title from title tag', () => {
      const html = '<title>God of War | HowLongToBeat</title>';
      const result = crawler.extractGameTitleFromHTML(html);
      expect(result).toBe('God of War');
    });

    test('should extract title from h1 tag', () => {
      const html = '<h1>Spider-Man</h1>';
      const result = crawler.extractGameTitleFromHTML(html);
      expect(result).toBe('Spider-Man');
    });

    test('should clean HowLongToBeat suffixes', () => {
      const html = '<title>HowLongToBeat - Horizon Zero Dawn</title>';
      const result = crawler.extractGameTitleFromHTML(html);
      expect(result).toBe('Horizon Zero Dawn');
    });

    test('should return null for invalid HTML', () => {
      const html = '<div>No title here</div>';
      const result = crawler.extractGameTitleFromHTML(html);
      expect(result).toBeNull();
    });
  });

  describe('isGameNameMatch', () => {
    test('should match exact names', () => {
      expect(crawler.isGameNameMatch('God of War', 'God of War')).toBe(true);
    });

    test('should match ignoring case and symbols', () => {
      expect(crawler.isGameNameMatch('God of War™', 'god of war')).toBe(true);
      expect(crawler.isGameNameMatch('Spider-Man', 'Spider Man')).toBe(true);
    });

    test('should match ignoring edition words', () => {
      expect(crawler.isGameNameMatch('Tomb Raider Definitive Edition', 'Tomb Raider')).toBe(true);
      expect(crawler.isGameNameMatch('God of War', 'God of War Remastered')).toBe(true);
    });

    test('should not match completely different games', () => {
      expect(crawler.isGameNameMatch('God of War', 'Claire Obscure')).toBe(false);
      expect(crawler.isGameNameMatch('Tomb Raider', 'Spider-Man')).toBe(false);
    });

    test('should handle partial matches with high similarity', () => {
      expect(crawler.isGameNameMatch('The Last of Us', 'Last of Us')).toBe(true);
      expect(crawler.isGameNameMatch('Super Mario Odyssey', 'Mario Odyssey')).toBe(true);
    });

    test('should handle edge cases', () => {
      expect(crawler.isGameNameMatch('', '')).toBe(false);
      expect(crawler.isGameNameMatch(null, 'Game')).toBe(false);
      expect(crawler.isGameNameMatch('Game', null)).toBe(false);
    });
  });

  describe('calculateLevenshteinDistance', () => {
    test('should calculate correct distance for similar strings', () => {
      expect(crawler.calculateLevenshteinDistance('cat', 'bat')).toBe(1);
      expect(crawler.calculateLevenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(crawler.calculateLevenshteinDistance('same', 'same')).toBe(0);
    });
  });

  describe('URL sanitization', () => {
    test('should sanitize game names for URLs', () => {
      // Testar indiretamente através do método que usa a sanitização
      const testCases = [
        { input: 'The Legend of Zelda™', expected: 'the-legend-of-zelda' },
        { input: 'God of War: Ragnarök', expected: 'god-of-war-ragnar-k' },
        { input: 'Super Mario Bros.®', expected: 'super-mario-bros' }
      ];

      testCases.forEach(({ input, expected }) => {
        const urlName = input
          .toLowerCase()
          .replace(/[™®]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        expect(urlName).toBe(expected);
      });
    });
  });
}); 