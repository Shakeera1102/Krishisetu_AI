const MANDI_IMAGE_MAP = {
  'm-1': 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80',
  'm-2': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'm-3': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
  'm-4': 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80',
  'm-5': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
  'm-6': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  'm-7': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  'm-8': 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80'
};

const DEFAULT_MANDI_PHOTOS = Object.values(MANDI_IMAGE_MAP);

export function getMandiImage(mandiId, mandiName = '') {
  if (mandiId && MANDI_IMAGE_MAP[mandiId]) {
    return MANDI_IMAGE_MAP[mandiId];
  }

  const nameStr = String(mandiName).toLowerCase();
  if (nameStr.includes('pimplegaon')) return MANDI_IMAGE_MAP['m-3'];
  if (nameStr.includes('lasalgaon')) return MANDI_IMAGE_MAP['m-1'];
  if (nameStr.includes('dindori') || nameStr.includes('nashik')) return MANDI_IMAGE_MAP['m-2'];
  if (nameStr.includes('pune') || nameStr.includes('gultekdi')) return MANDI_IMAGE_MAP['m-4'];
  if (nameStr.includes('vashi') || nameStr.includes('mumbai')) return MANDI_IMAGE_MAP['m-5'];
  if (nameStr.includes('nagpur')) return MANDI_IMAGE_MAP['m-6'];
  if (nameStr.includes('solapur')) return MANDI_IMAGE_MAP['m-7'];
  if (nameStr.includes('kolhapur')) return MANDI_IMAGE_MAP['m-8'];

  // Hash string fallback for consistent mapping
  let hash = 0;
  for (let i = 0; i < nameStr.length; i++) {
    hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % DEFAULT_MANDI_PHOTOS.length;
  return DEFAULT_MANDI_PHOTOS[idx];
}

export default getMandiImage;
