// Cross-language synonym groups for search matching
// Each array contains words that should match each other across languages
const synonymGroups: string[][] = [
  ['mulher', 'woman', 'women', 'weman', 'mujer', 'femme', 'donna', 'female', 'feminina', 'feminino'],
  ['homem', 'man', 'men', 'hombre', 'homme', 'uomo', 'male', 'masculino', 'masculina'],
  ['criança', 'crianca', 'child', 'children', 'kid', 'kids', 'niño', 'niña', 'enfant'],
  ['retrato', 'portrait', 'retrato', 'ritratto'],
  ['paisagem', 'landscape', 'paysage', 'paesaggio', 'paisaje'],
  ['noite', 'night', 'noche', 'nuit', 'notte'],
  ['dia', 'day', 'día', 'jour', 'giorno'],
  ['luz', 'light', 'lumière', 'luce'],
  ['escuro', 'dark', 'darkness', 'oscuro', 'sombre'],
  ['cidade', 'city', 'ciudad', 'ville', 'città', 'urban'],
  ['natureza', 'nature', 'naturaleza', 'natura'],
  ['agua', 'água', 'water', 'eau', 'acqua'],
  ['fogo', 'fire', 'fuego', 'feu', 'fuoco'],
  ['flor', 'flower', 'flowers', 'fleur', 'fiore', 'flores'],
  ['animal', 'animals', 'animais', 'animales', 'animaux'],
  ['cão', 'cao', 'cachorro', 'dog', 'dogs', 'perro', 'chien'],
  ['gato', 'cat', 'cats', 'gatto', 'chat'],
  ['cavalo', 'horse', 'horses', 'caballo', 'cheval'],
  ['céu', 'ceu', 'sky', 'cielo', 'ciel'],
  ['sol', 'sun', 'soleil', 'sole'],
  ['lua', 'moon', 'lune', 'luna'],
  ['estrela', 'estrelas', 'star', 'stars', 'estrella', 'étoile', 'stella'],
  ['mar', 'sea', 'ocean', 'oceano', 'mer', 'mare'],
  ['praia', 'beach', 'playa', 'plage', 'spiaggia'],
  ['montanha', 'mountain', 'mountains', 'montaña', 'montagne', 'montagna'],
  ['floresta', 'forest', 'bosque', 'forêt', 'foresta'],
  ['rio', 'river', 'río', 'rivière', 'fiume'],
  ['chuva', 'rain', 'lluvia', 'pluie', 'pioggia'],
  ['neve', 'snow', 'nieve', 'neige'],
  ['vento', 'wind', 'viento', 'vent'],
  ['casa', 'house', 'home', 'maison', 'casa'],
  ['rua', 'street', 'calle', 'rue', 'strada'],
  ['carro', 'car', 'coche', 'voiture', 'macchina'],
  ['vestido', 'dress', 'vestido', 'robe', 'abito'],
  ['roupa', 'clothes', 'clothing', 'ropa', 'vêtements'],
  ['cabelo', 'hair', 'pelo', 'cheveux', 'capelli'],
  ['olho', 'olhos', 'eye', 'eyes', 'ojo', 'ojos', 'yeux', 'occhi'],
  ['mão', 'mao', 'mãos', 'hand', 'hands', 'mano', 'manos', 'main', 'mains'],
  ['rosto', 'face', 'rostro', 'visage', 'viso', 'cara'],
  ['corpo', 'body', 'cuerpo', 'corps', 'corpo'],
  ['casal', 'couple', 'pareja', 'coppia'],
  ['família', 'familia', 'family', 'famille', 'famiglia'],
  ['amor', 'love', 'amore', 'amour'],
  ['beleza', 'beauty', 'beautiful', 'bela', 'belo', 'linda', 'lindo', 'hermosa', 'belle', 'bella'],
  ['moda', 'fashion', 'mode'],
  ['arte', 'art', 'arte'],
  ['foto', 'fotografia', 'photo', 'photography', 'fotografía', 'photographie'],
  ['ensaio', 'photoshoot', 'session', 'sesión', 'séance'],
  ['casamento', 'wedding', 'boda', 'mariage', 'matrimonio'],
  ['modelo', 'model', 'modèle', 'modello'],
  ['estudio', 'estúdio', 'studio'],
  ['vintage', 'retro', 'antiguo', 'ancien'],
  ['moderno', 'modern', 'moderne', 'moderno'],
  ['preto', 'black', 'negro', 'noir', 'nero'],
  ['branco', 'white', 'blanco', 'blanc', 'bianco'],
  ['vermelho', 'red', 'rojo', 'rouge', 'rosso'],
  ['azul', 'blue', 'bleu', 'blu'],
  ['verde', 'green', 'vert'],
  ['amarelo', 'yellow', 'amarillo', 'jaune', 'giallo'],
  ['dourado', 'gold', 'golden', 'dorado', 'doré', 'oro'],
  ['prata', 'silver', 'plata', 'argent', 'argento'],
  ['sombra', 'shadow', 'shadows', 'sombra', 'ombre', 'ombra'],
  ['reflexo', 'reflection', 'reflejo', 'reflet', 'riflesso'],
  ['sensual', 'sexy', 'sensuelle', 'sensuale'],
  ['elegante', 'elegant', 'élégant'],
  ['dramático', 'dramatico', 'dramatic', 'dramático', 'dramatique', 'drammatico'],
  ['suave', 'soft', 'douce', 'morbido'],
  ['forte', 'strong', 'fuerte', 'fort'],
  ['jovem', 'young', 'youth', 'joven', 'jeune', 'giovane'],
  ['idoso', 'elderly', 'old', 'anciano', 'âgé', 'anziano'],
  ['bebê', 'bebe', 'baby', 'bebé', 'bébé', 'bambino'],
  ['gravida', 'grávida', 'pregnant', 'embarazada', 'enceinte', 'incinta'],
  ['noiva', 'bride', 'novia', 'mariée', 'sposa'],
  ['noivo', 'groom', 'novio', 'marié', 'sposo'],
];

// Build a lookup map: word -> set of synonyms
const synonymMap = new Map<string, Set<string>>();

for (const group of synonymGroups) {
  const normalizedGroup = group.map(w => w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  const fullSet = new Set(normalizedGroup);
  for (const word of normalizedGroup) {
    const existing = synonymMap.get(word);
    if (existing) {
      for (const w of fullSet) existing.add(w);
    } else {
      synonymMap.set(word, new Set(fullSet));
    }
  }
}

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Given a search query, returns an expanded set of search terms
 * including cross-language synonyms.
 */
export function expandSearchTerms(query: string): string[] {
  const normalized = normalize(query);
  const words = normalized.split(/\s+/).filter(Boolean);
  const allTerms = new Set<string>();

  for (const word of words) {
    allTerms.add(word);
    // Check exact match
    const synonyms = synonymMap.get(word);
    if (synonyms) {
      for (const syn of synonyms) allTerms.add(syn);
    }
    // Check fuzzy: if the word is similar to a key (Levenshtein distance <= 2)
    for (const [key, syns] of synonymMap) {
      if (levenshtein(word, key) <= 2 && word.length >= 3) {
        for (const syn of syns) allTerms.add(syn);
      }
    }
  }

  return Array.from(allTerms);
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (Math.abs(a.length - b.length) > 2) return 3; // early exit

  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}
