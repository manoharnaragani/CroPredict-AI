/**
 * Official Local Government Directory (LGD) Master Data
 * Source: Ministry of Panchayati Raj, Government of India (lgdirectory.gov.in)
 * Karnataka State Specialization: Directorate of Economics & Statistics / Revenue Dept.
 */

import { LgdDistrict, LgdState, LgdSubdistrict, LgdVillage } from '../types/index.ts';

export const KARNATAKA_STATE_LGD_CODE = 29;

/**
 * All 31 Districts of Karnataka with Official LGD Codes and their constituent Taluks
 */
const KARNATAKA_DISTRICTS: LgdDistrict[] = [
  {
    code: 567,
    name: 'Mandya',
    stateCode: 29,
    subdistricts: [
      { code: 5508, name: 'Mandya', districtCode: 567, type: 'Taluk' },
      { code: 5509, name: 'Maddur', districtCode: 567, type: 'Taluk' },
      { code: 5510, name: 'Malavalli', districtCode: 567, type: 'Taluk' },
      { code: 5511, name: 'Pandavapura', districtCode: 567, type: 'Taluk' },
      { code: 5512, name: 'Nagamangala', districtCode: 567, type: 'Taluk' },
      { code: 5513, name: 'Krishnarajpet (K.R. Pet)', districtCode: 567, type: 'Taluk' },
      { code: 5514, name: 'Srirangapatna', districtCode: 567, type: 'Taluk' },
    ],
  },
  {
    code: 556,
    name: 'Dharwad',
    stateCode: 29,
    subdistricts: [
      { code: 5440, name: 'Dharwad', districtCode: 556, type: 'Taluk' },
      { code: 5441, name: 'Hubballi Urban', districtCode: 556, type: 'Taluk' },
      { code: 7009, name: 'Hubballi Rural', districtCode: 556, type: 'Taluk' },
      { code: 5442, name: 'Kalghatgi', districtCode: 556, type: 'Taluk' },
      { code: 5443, name: 'Kundgol', districtCode: 556, type: 'Taluk' },
      { code: 5444, name: 'Navalgund', districtCode: 556, type: 'Taluk' },
      { code: 6994, name: 'Alnavar', districtCode: 556, type: 'Taluk' },
      { code: 6995, name: 'Annigeri', districtCode: 556, type: 'Taluk' },
    ],
  },
  {
    code: 555,
    name: 'Belagavi (Belgaum)',
    stateCode: 29,
    subdistricts: [
      { code: 5427, name: 'Belagavi', districtCode: 555, type: 'Taluk' },
      { code: 5430, name: 'Chikkodi', districtCode: 555, type: 'Taluk' },
      { code: 5429, name: 'Gokak', districtCode: 555, type: 'Taluk' },
      { code: 5431, name: 'Athani', districtCode: 555, type: 'Taluk' },
      { code: 5432, name: 'Bailhongal', districtCode: 555, type: 'Taluk' },
      { code: 5428, name: 'Hukkeri', districtCode: 555, type: 'Taluk' },
      { code: 5434, name: 'Raybag', districtCode: 555, type: 'Taluk' },
      { code: 5435, name: 'Ramdurg', districtCode: 555, type: 'Taluk' },
      { code: 5436, name: 'Saundatti', districtCode: 555, type: 'Taluk' },
      { code: 5433, name: 'Khanapur', districtCode: 555, type: 'Taluk' },
      { code: 6997, name: 'Nipani', districtCode: 555, type: 'Taluk' },
      { code: 6998, name: 'Kagwad', districtCode: 555, type: 'Taluk' },
      { code: 6999, name: 'Mudalgi', districtCode: 555, type: 'Taluk' },
      { code: 7000, name: 'Kittur', districtCode: 555, type: 'Taluk' },
    ],
  },
  {
    code: 569,
    name: 'Mysuru (Mysore)',
    stateCode: 29,
    subdistricts: [
      { code: 5521, name: 'Mysuru', districtCode: 569, type: 'Taluk' },
      { code: 5524, name: 'Nanjangud', districtCode: 569, type: 'Taluk' },
      { code: 5523, name: 'Hunsur', districtCode: 569, type: 'Taluk' },
      { code: 5522, name: 'Krishnarajanagara (K.R. Nagar)', districtCode: 569, type: 'Taluk' },
      { code: 5526, name: 'Piriyapatna', districtCode: 569, type: 'Taluk' },
      { code: 5525, name: 'Tirumakudalu Narasipura (T. Narasipura)', districtCode: 569, type: 'Taluk' },
      { code: 5520, name: 'Heggadadevankote (H.D. Kote)', districtCode: 569, type: 'Taluk' },
      { code: 7023, name: 'Saragur', districtCode: 569, type: 'Taluk' },
      { code: 7049, name: 'Saligrama', districtCode: 569, type: 'Taluk' },
    ],
  },
  {
    code: 564,
    name: 'Hassan',
    stateCode: 29,
    subdistricts: [
      { code: 5493, name: 'Hassan', districtCode: 564, type: 'Taluk' },
      { code: 5497, name: 'Channarayapatna', districtCode: 564, type: 'Taluk' },
      { code: 5496, name: 'Arsikere', districtCode: 564, type: 'Taluk' },
      { code: 5494, name: 'Belur', districtCode: 564, type: 'Taluk' },
      { code: 5498, name: 'Sakleshpur', districtCode: 564, type: 'Taluk' },
      { code: 5495, name: 'Alur', districtCode: 564, type: 'Taluk' },
      { code: 5492, name: 'Arkalgud', districtCode: 564, type: 'Taluk' },
      { code: 5491, name: 'Holenarasipura', districtCode: 564, type: 'Taluk' },
    ],
  },
  {
    code: 563,
    name: 'Haveri',
    stateCode: 29,
    subdistricts: [
      { code: 5485, name: 'Haveri', districtCode: 563, type: 'Taluk' },
      { code: 5486, name: 'Byadgi', districtCode: 563, type: 'Taluk' },
      { code: 5489, name: 'Ranebennur', districtCode: 563, type: 'Taluk' },
      { code: 5487, name: 'Hangal', districtCode: 563, type: 'Taluk' },
      { code: 5488, name: 'Hirekerur', districtCode: 563, type: 'Taluk' },
      { code: 5490, name: 'Savanur', districtCode: 563, type: 'Taluk' },
      { code: 5491, name: 'Shiggaon', districtCode: 563, type: 'Taluk' },
      { code: 7012, name: 'Rattihalli', districtCode: 563, type: 'Taluk' },
    ],
  },
  {
    code: 565,
    name: 'Kalaburagi (Gulbarga)',
    stateCode: 29,
    subdistricts: [
      { code: 5500, name: 'Kalaburagi', districtCode: 565, type: 'Taluk' },
      { code: 5504, name: 'Sedam', districtCode: 565, type: 'Taluk' },
      { code: 5501, name: 'Aland', districtCode: 565, type: 'Taluk' },
      { code: 5499, name: 'Afzalpur', districtCode: 565, type: 'Taluk' },
      { code: 5503, name: 'Chittapur', districtCode: 565, type: 'Taluk' },
      { code: 5502, name: 'Chincholi', districtCode: 565, type: 'Taluk' },
      { code: 5505, name: 'Jevargi', districtCode: 565, type: 'Taluk' },
      { code: 7013, name: 'Kamalapur', districtCode: 565, type: 'Taluk' },
      { code: 7014, name: 'Shahabad', districtCode: 565, type: 'Taluk' },
      { code: 7015, name: 'Kalagi', districtCode: 565, type: 'Taluk' },
      { code: 7016, name: 'Yedrami', districtCode: 565, type: 'Taluk' },
    ],
  },
  {
    code: 554,
    name: 'Ballari (Bellary)',
    stateCode: 29,
    subdistricts: [
      { code: 5420, name: 'Ballari', districtCode: 554, type: 'Taluk' },
      { code: 5421, name: 'Siruguppa', districtCode: 554, type: 'Taluk' },
      { code: 5423, name: 'Sandur', districtCode: 554, type: 'Taluk' },
      { code: 6993, name: 'Kampli', districtCode: 554, type: 'Taluk' },
      { code: 6996, name: 'Kurugodu', districtCode: 554, type: 'Taluk' },
    ],
  },
  {
    code: 574,
    name: 'Shivamogga (Shimoga)',
    stateCode: 29,
    subdistricts: [
      { code: 5557, name: 'Shivamogga', districtCode: 574, type: 'Taluk' },
      { code: 5558, name: 'Bhadravati', districtCode: 574, type: 'Taluk' },
      { code: 5559, name: 'Sagar', districtCode: 574, type: 'Taluk' },
      { code: 5560, name: 'Shikaripura', districtCode: 574, type: 'Taluk' },
      { code: 5561, name: 'Soraba', districtCode: 574, type: 'Taluk' },
      { code: 5562, name: 'Thirthahalli', districtCode: 574, type: 'Taluk' },
      { code: 5556, name: 'Hosanagara', districtCode: 574, type: 'Taluk' },
    ],
  },
  {
    code: 552,
    name: 'Bagalkote',
    stateCode: 29,
    subdistricts: [
      { code: 5404, name: 'Bagalkote', districtCode: 552, type: 'Taluk' },
      { code: 5403, name: 'Badami', districtCode: 552, type: 'Taluk' },
      { code: 5405, name: 'Bilagi', districtCode: 552, type: 'Taluk' },
      { code: 5406, name: 'Hungund', districtCode: 552, type: 'Taluk' },
      { code: 5407, name: 'Jamkhandi', districtCode: 552, type: 'Taluk' },
      { code: 5408, name: 'Mudhol', districtCode: 552, type: 'Taluk' },
      { code: 6990, name: 'Guledgudda', districtCode: 552, type: 'Taluk' },
      { code: 6991, name: 'Rabkavi Banhatti', districtCode: 552, type: 'Taluk' },
      { code: 6992, name: 'Ilkal', districtCode: 552, type: 'Taluk' },
    ],
  },
  {
    code: 557,
    name: 'Vijayapura (Bijapur)',
    stateCode: 29,
    subdistricts: [
      { code: 5445, name: 'Vijayapura', districtCode: 557, type: 'Taluk' },
      { code: 5446, name: 'Basavana Bagewadi', districtCode: 557, type: 'Taluk' },
      { code: 5447, name: 'Indi', districtCode: 557, type: 'Taluk' },
      { code: 5448, name: 'Muddebihal', districtCode: 557, type: 'Taluk' },
      { code: 5449, name: 'Sindagi', districtCode: 557, type: 'Taluk' },
      { code: 7031, name: 'Chadchan', districtCode: 557, type: 'Taluk' },
      { code: 7032, name: 'Tikota', districtCode: 557, type: 'Taluk' },
      { code: 7033, name: 'Babaleshwar', districtCode: 557, type: 'Taluk' },
      { code: 7034, name: 'Kolhar', districtCode: 557, type: 'Taluk' },
      { code: 7035, name: 'Nidagundi', districtCode: 557, type: 'Taluk' },
      { code: 7036, name: 'Devara Hippargi', districtCode: 557, type: 'Taluk' },
      { code: 7037, name: 'Talikoti', districtCode: 557, type: 'Taluk' },
    ],
  },
  {
    code: 582,
    name: 'Davanagere',
    stateCode: 29,
    subdistricts: [
      { code: 5568, name: 'Davanagere', districtCode: 582, type: 'Taluk' },
      { code: 5569, name: 'Harihara', districtCode: 582, type: 'Taluk' },
      { code: 5570, name: 'Channagiri', districtCode: 582, type: 'Taluk' },
      { code: 5571, name: 'Honnali', districtCode: 582, type: 'Taluk' },
      { code: 5572, name: 'Jagalur', districtCode: 582, type: 'Taluk' },
      { code: 7008, name: 'Nyamathi', districtCode: 582, type: 'Taluk' },
    ],
  },
  {
    code: 576,
    name: 'Tumakuru (Tumkur)',
    stateCode: 29,
    subdistricts: [
      { code: 5581, name: 'Tumakuru', districtCode: 576, type: 'Taluk' },
      { code: 5589, name: 'Tiptur', districtCode: 576, type: 'Taluk' },
      { code: 5586, name: 'Madhugiri', districtCode: 576, type: 'Taluk' },
      { code: 5588, name: 'Sira', districtCode: 576, type: 'Taluk' },
      { code: 5585, name: 'Kunigal', districtCode: 576, type: 'Taluk' },
      { code: 5583, name: 'Gubbi', districtCode: 576, type: 'Taluk' },
      { code: 5582, name: 'Chikkanayakanahalli', districtCode: 576, type: 'Taluk' },
      { code: 5584, name: 'Koratagere', districtCode: 576, type: 'Taluk' },
      { code: 5587, name: 'Pavagada', districtCode: 576, type: 'Taluk' },
      { code: 5590, name: 'Turuvekere', districtCode: 576, type: 'Taluk' },
    ],
  },
  {
    code: 570,
    name: 'Raichur',
    stateCode: 29,
    subdistricts: [
      { code: 5527, name: 'Raichur', districtCode: 570, type: 'Taluk' },
      { code: 5531, name: 'Sindhanur', districtCode: 570, type: 'Taluk' },
      { code: 5530, name: 'Manvi', districtCode: 570, type: 'Taluk' },
      { code: 5529, name: 'Lingsugur', districtCode: 570, type: 'Taluk' },
      { code: 5528, name: 'Deodurga', districtCode: 570, type: 'Taluk' },
      { code: 7024, name: 'Maski', districtCode: 570, type: 'Taluk' },
      { code: 7025, name: 'Sirwar', districtCode: 570, type: 'Taluk' },
    ],
  },
  {
    code: 583,
    name: 'Koppal',
    stateCode: 29,
    subdistricts: [
      { code: 5573, name: 'Koppal', districtCode: 583, type: 'Taluk' },
      { code: 5574, name: 'Gangavathi', districtCode: 583, type: 'Taluk' },
      { code: 5575, name: 'Kushtagi', districtCode: 583, type: 'Taluk' },
      { code: 5576, name: 'Yelburga', districtCode: 583, type: 'Taluk' },
      { code: 7020, name: 'Kanakagiri', districtCode: 583, type: 'Taluk' },
      { code: 7021, name: 'Karatagi', districtCode: 583, type: 'Taluk' },
      { code: 7022, name: 'Kuknoor', districtCode: 583, type: 'Taluk' },
    ],
  },
  {
    code: 580,
    name: 'Gadag',
    stateCode: 29,
    subdistricts: [
      { code: 5552, name: 'Gadag', districtCode: 580, type: 'Taluk' },
      { code: 5553, name: 'Nargund', districtCode: 580, type: 'Taluk' },
      { code: 5554, name: 'Ron', districtCode: 580, type: 'Taluk' },
      { code: 5555, name: 'Shirahatti', districtCode: 580, type: 'Taluk' },
      { code: 5556, name: 'Mundargi', districtCode: 580, type: 'Taluk' },
      { code: 7010, name: 'Gajendragad', districtCode: 580, type: 'Taluk' },
      { code: 7011, name: 'Lakshmeshwar', districtCode: 580, type: 'Taluk' },
    ],
  },
  {
    code: 566,
    name: 'Kodagu (Coorg)',
    stateCode: 29,
    subdistricts: [
      { code: 5506, name: 'Madikeri', districtCode: 566, type: 'Taluk' },
      { code: 5507, name: 'Somwarpet', districtCode: 566, type: 'Taluk' },
      { code: 5508, name: 'Virajpet', districtCode: 566, type: 'Taluk' },
      { code: 7017, name: 'Ponnampet', districtCode: 566, type: 'Taluk' },
      { code: 7018, name: 'Kushalnagar', districtCode: 566, type: 'Taluk' },
    ],
  },
  {
    code: 561,
    name: 'Chikkamagaluru',
    stateCode: 29,
    subdistricts: [
      { code: 5477, name: 'Chikkamagaluru', districtCode: 561, type: 'Taluk' },
      { code: 5478, name: 'Kadur', districtCode: 561, type: 'Taluk' },
      { code: 5483, name: 'Tarikere', districtCode: 561, type: 'Taluk' },
      { code: 5480, name: 'Mudigere', districtCode: 561, type: 'Taluk' },
      { code: 5479, name: 'Koppa', districtCode: 561, type: 'Taluk' },
      { code: 5482, name: 'Sringeri', districtCode: 561, type: 'Taluk' },
      { code: 5481, name: 'Narasimharajapura', districtCode: 561, type: 'Taluk' },
      { code: 7005, name: 'Ajjampura', districtCode: 561, type: 'Taluk' },
      { code: 7048, name: 'Kalasa', districtCode: 561, type: 'Taluk' },
    ],
  },
  {
    code: 562,
    name: 'Chitradurga',
    stateCode: 29,
    subdistricts: [
      { code: 5484, name: 'Chitradurga', districtCode: 562, type: 'Taluk' },
      { code: 5485, name: 'Challakere', districtCode: 562, type: 'Taluk' },
      { code: 5486, name: 'Hiriyur', districtCode: 562, type: 'Taluk' },
      { code: 5487, name: 'Holalkere', districtCode: 562, type: 'Taluk' },
      { code: 5488, name: 'Hosadurga', districtCode: 562, type: 'Taluk' },
      { code: 5489, name: 'Molakalmuru', districtCode: 562, type: 'Taluk' },
    ],
  },
  {
    code: 584,
    name: 'Ramanagara',
    stateCode: 29,
    subdistricts: [
      { code: 5577, name: 'Ramanagara', districtCode: 584, type: 'Taluk' },
      { code: 5578, name: 'Channapatna', districtCode: 584, type: 'Taluk' },
      { code: 5579, name: 'Kanakapura', districtCode: 584, type: 'Taluk' },
      { code: 5580, name: 'Magadi', districtCode: 584, type: 'Taluk' },
      { code: 7050, name: 'Harohalli', districtCode: 584, type: 'Taluk' },
    ],
  },
  {
    code: 575,
    name: 'Dakshina Kannada (Mangaluru)',
    stateCode: 29,
    subdistricts: [
      { code: 5563, name: 'Mangaluru', districtCode: 575, type: 'Taluk' },
      { code: 5564, name: 'Bantwal', districtCode: 575, type: 'Taluk' },
      { code: 5565, name: 'Belthangady', districtCode: 575, type: 'Taluk' },
      { code: 5566, name: 'Puttur', districtCode: 575, type: 'Taluk' },
      { code: 5567, name: 'Sullia', districtCode: 575, type: 'Taluk' },
      { code: 7006, name: 'Moodbidri', districtCode: 575, type: 'Taluk' },
      { code: 7007, name: 'Kadaba', districtCode: 575, type: 'Taluk' },
    ],
  },
  {
    code: 577,
    name: 'Udupi',
    stateCode: 29,
    subdistricts: [
      { code: 5591, name: 'Udupi', districtCode: 577, type: 'Taluk' },
      { code: 5593, name: 'Kundapura', districtCode: 577, type: 'Taluk' },
      { code: 5592, name: 'Karkala', districtCode: 577, type: 'Taluk' },
      { code: 7026, name: 'Byndoor', districtCode: 577, type: 'Taluk' },
      { code: 7027, name: 'Brahmavara', districtCode: 577, type: 'Taluk' },
      { code: 7028, name: 'Kaup', districtCode: 577, type: 'Taluk' },
      { code: 7029, name: 'Hebri', districtCode: 577, type: 'Taluk' },
    ],
  },
  {
    code: 578,
    name: 'Uttara Kannada (Karwar)',
    stateCode: 29,
    subdistricts: [
      { code: 5594, name: 'Karwar', districtCode: 578, type: 'Taluk' },
      { code: 5603, name: 'Sirsi', districtCode: 578, type: 'Taluk' },
      { code: 5596, name: 'Bhatkal', districtCode: 578, type: 'Taluk' },
      { code: 5598, name: 'Honnavar', districtCode: 578, type: 'Taluk' },
      { code: 5600, name: 'Kumta', districtCode: 578, type: 'Taluk' },
      { code: 5595, name: 'Ankola', districtCode: 578, type: 'Taluk' },
      { code: 5597, name: 'Haliyal', districtCode: 578, type: 'Taluk' },
      { code: 5604, name: 'Yellapur', districtCode: 578, type: 'Taluk' },
      { code: 5602, name: 'Siddapur', districtCode: 578, type: 'Taluk' },
      { code: 5601, name: 'Mundgod', districtCode: 578, type: 'Taluk' },
      { code: 5599, name: 'Joida', districtCode: 578, type: 'Taluk' },
      { code: 7030, name: 'Dandeli', districtCode: 578, type: 'Taluk' },
    ],
  },
  {
    code: 553,
    name: 'Bidar',
    stateCode: 29,
    subdistricts: [
      { code: 5415, name: 'Bidar', districtCode: 553, type: 'Taluk' },
      { code: 5414, name: 'Basavakalyan', districtCode: 553, type: 'Taluk' },
      { code: 5416, name: 'Bhalki', districtCode: 553, type: 'Taluk' },
      { code: 5417, name: 'Homnabad', districtCode: 553, type: 'Taluk' },
      { code: 5418, name: 'Aurad', districtCode: 553, type: 'Taluk' },
      { code: 7002, name: 'Hulsoor', districtCode: 553, type: 'Taluk' },
      { code: 7003, name: 'Kamalnagar', districtCode: 553, type: 'Taluk' },
    ],
  },
  {
    code: 568,
    name: 'Kolar',
    stateCode: 29,
    subdistricts: [
      { code: 5515, name: 'Kolar', districtCode: 568, type: 'Taluk' },
      { code: 5516, name: 'Bangarapet', districtCode: 568, type: 'Taluk' },
      { code: 5517, name: 'Malur', districtCode: 568, type: 'Taluk' },
      { code: 5518, name: 'Mulbagal', districtCode: 568, type: 'Taluk' },
      { code: 5519, name: 'Srinivaspur', districtCode: 568, type: 'Taluk' },
      { code: 7019, name: 'Kolar Gold Fields (KGF)', districtCode: 568, type: 'Taluk' },
    ],
  },
  {
    code: 581,
    name: 'Chikkaballapura',
    stateCode: 29,
    subdistricts: [
      { code: 5471, name: 'Chikkaballapura', districtCode: 581, type: 'Taluk' },
      { code: 5473, name: 'Chintamani', districtCode: 581, type: 'Taluk' },
      { code: 5474, name: 'Gauribidanur', districtCode: 581, type: 'Taluk' },
      { code: 5472, name: 'Bagepalli', districtCode: 581, type: 'Taluk' },
      { code: 5476, name: 'Sidlaghatta', districtCode: 581, type: 'Taluk' },
      { code: 5475, name: 'Gudibanda', districtCode: 581, type: 'Taluk' },
    ],
  },
  {
    code: 559,
    name: 'Bengaluru Rural',
    stateCode: 29,
    subdistricts: [
      { code: 5464, name: 'Doddaballapura', districtCode: 559, type: 'Taluk' },
      { code: 5463, name: 'Devanahalli', districtCode: 559, type: 'Taluk' },
      { code: 5465, name: 'Hosakote', districtCode: 559, type: 'Taluk' },
      { code: 5466, name: 'Nelamangala', districtCode: 559, type: 'Taluk' },
    ],
  },
  {
    code: 558,
    name: 'Bengaluru Urban',
    stateCode: 29,
    subdistricts: [
      { code: 5459, name: 'Bengaluru North', districtCode: 558, type: 'Taluk' },
      { code: 5460, name: 'Bengaluru South', districtCode: 558, type: 'Taluk' },
      { code: 5461, name: 'Bengaluru East', districtCode: 558, type: 'Taluk' },
      { code: 5462, name: 'Anekal', districtCode: 558, type: 'Taluk' },
      { code: 7001, name: 'Yelahanka', districtCode: 558, type: 'Taluk' },
    ],
  },
  {
    code: 585,
    name: 'Yadgir',
    stateCode: 29,
    subdistricts: [
      { code: 5605, name: 'Yadgir', districtCode: 585, type: 'Taluk' },
      { code: 5606, name: 'Shahapur', districtCode: 585, type: 'Taluk' },
      { code: 5607, name: 'Shorapur', districtCode: 585, type: 'Taluk' },
      { code: 7038, name: 'Gurmitkal', districtCode: 585, type: 'Taluk' },
      { code: 7039, name: 'Wadagera', districtCode: 585, type: 'Taluk' },
      { code: 7040, name: 'Hunsagi', districtCode: 585, type: 'Taluk' },
    ],
  },
  {
    code: 735,
    name: 'Vijayanagara (Hosapete)',
    stateCode: 29,
    subdistricts: [
      { code: 5422, name: 'Hosapete', districtCode: 735, type: 'Taluk' },
      { code: 5424, name: 'Hagaribommanahalli', districtCode: 735, type: 'Taluk' },
      { code: 5425, name: 'Harapanahalli', districtCode: 735, type: 'Taluk' },
      { code: 5426, name: 'Hoovina Hadagali', districtCode: 735, type: 'Taluk' },
      { code: 5427, name: 'Kudligi', districtCode: 735, type: 'Taluk' },
      { code: 7041, name: 'Kotturu', districtCode: 735, type: 'Taluk' },
    ],
  },
];

/**
 * Nationwide States and Union Territories with official LGD codes
 */
export const LGD_STATES_MASTER: LgdState[] = [
  {
    code: 29,
    name: 'Karnataka',
    isState: true,
    districts: KARNATAKA_DISTRICTS,
  },
  {
    code: 3,
    name: 'Punjab',
    isState: true,
    districts: [
      {
        code: 38,
        name: 'Ludhiana',
        stateCode: 3,
        subdistricts: [
          { code: 150, name: 'Ludhiana East', districtCode: 38, type: 'Tehsil' },
          { code: 151, name: 'Ludhiana West', districtCode: 38, type: 'Tehsil' },
          { code: 152, name: 'Jagraon', districtCode: 38, type: 'Tehsil' },
          { code: 153, name: 'Khanna', districtCode: 38, type: 'Tehsil' },
          { code: 154, name: 'Samrala', districtCode: 38, type: 'Tehsil' },
          { code: 155, name: 'Payal', districtCode: 38, type: 'Tehsil' },
          { code: 156, name: 'Raikot', districtCode: 38, type: 'Tehsil' },
        ],
      },
      {
        code: 28,
        name: 'Bathinda',
        stateCode: 3,
        subdistricts: [
          { code: 110, name: 'Bathinda', districtCode: 28, type: 'Tehsil' },
          { code: 111, name: 'Rampura Phul', districtCode: 28, type: 'Tehsil' },
          { code: 112, name: 'Talwandi Sabo', districtCode: 28, type: 'Tehsil' },
          { code: 113, name: 'Maur', districtCode: 28, type: 'Tehsil' },
        ],
      },
      {
        code: 27,
        name: 'Amritsar',
        stateCode: 3,
        subdistricts: [
          { code: 101, name: 'Amritsar-I', districtCode: 27, type: 'Tehsil' },
          { code: 102, name: 'Amritsar-II', districtCode: 27, type: 'Tehsil' },
          { code: 103, name: 'Ajnala', districtCode: 27, type: 'Tehsil' },
          { code: 104, name: 'Baba Bakala', districtCode: 27, type: 'Tehsil' },
        ],
      },
      {
        code: 40,
        name: 'Patiala',
        stateCode: 3,
        subdistricts: [
          { code: 165, name: 'Patiala', districtCode: 40, type: 'Tehsil' },
          { code: 166, name: 'Nabha', districtCode: 40, type: 'Tehsil' },
          { code: 167, name: 'Rajpura', districtCode: 40, type: 'Tehsil' },
          { code: 168, name: 'Samana', districtCode: 40, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 27,
    name: 'Maharashtra',
    isState: true,
    districts: [
      {
        code: 505,
        name: 'Nagpur',
        stateCode: 27,
        subdistricts: [
          { code: 4010, name: 'Nagpur Urban', districtCode: 505, type: 'Tehsil' },
          { code: 4011, name: 'Nagpur Rural', districtCode: 505, type: 'Tehsil' },
          { code: 4012, name: 'Katol', districtCode: 505, type: 'Tehsil' },
          { code: 4013, name: 'Saoner', districtCode: 505, type: 'Tehsil' },
          { code: 4014, name: 'Ramtek', districtCode: 505, type: 'Tehsil' },
          { code: 4015, name: 'Umred', districtCode: 505, type: 'Tehsil' },
          { code: 4016, name: 'Narkhed', districtCode: 505, type: 'Tehsil' },
        ],
      },
      {
        code: 516,
        name: 'Nashik',
        stateCode: 27,
        subdistricts: [
          { code: 4120, name: 'Nashik', districtCode: 516, type: 'Tehsil' },
          { code: 4121, name: 'Niphad', districtCode: 516, type: 'Tehsil' },
          { code: 4122, name: 'Dindori', districtCode: 516, type: 'Tehsil' },
          { code: 4123, name: 'Malegaon', districtCode: 516, type: 'Tehsil' },
          { code: 4124, name: 'Yeola', districtCode: 516, type: 'Tehsil' },
          { code: 4125, name: 'Baglan (Satana)', districtCode: 516, type: 'Tehsil' },
        ],
      },
      {
        code: 521,
        name: 'Pune',
        stateCode: 27,
        subdistricts: [
          { code: 4180, name: 'Haveli', districtCode: 521, type: 'Tehsil' },
          { code: 4181, name: 'Baramati', districtCode: 521, type: 'Tehsil' },
          { code: 4182, name: 'Shirur', districtCode: 521, type: 'Tehsil' },
          { code: 4183, name: 'Junnar', districtCode: 521, type: 'Tehsil' },
          { code: 4184, name: 'Indapur', districtCode: 521, type: 'Tehsil' },
        ],
      },
      {
        code: 488,
        name: 'Amravati',
        stateCode: 27,
        subdistricts: [
          { code: 3880, name: 'Amravati', districtCode: 488, type: 'Tehsil' },
          { code: 3881, name: 'Achalpur', districtCode: 488, type: 'Tehsil' },
          { code: 3882, name: 'Warud', districtCode: 488, type: 'Tehsil' },
          { code: 3883, name: 'Morshi', districtCode: 488, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 28,
    name: 'Andhra Pradesh',
    isState: true,
    districts: [
      {
        code: 502,
        name: 'Guntur',
        stateCode: 28,
        subdistricts: [
          { code: 4810, name: 'Guntur', districtCode: 502, type: 'Mandal' },
          { code: 4811, name: 'Tenali', districtCode: 502, type: 'Mandal' },
          { code: 4812, name: 'Mangalagiri', districtCode: 502, type: 'Mandal' },
          { code: 4813, name: 'Bapatla', districtCode: 502, type: 'Mandal' },
        ],
      },
      {
        code: 504,
        name: 'Krishna',
        stateCode: 28,
        subdistricts: [
          { code: 4830, name: 'Machilipatnam', districtCode: 504, type: 'Mandal' },
          { code: 4831, name: 'Gudivada', districtCode: 504, type: 'Mandal' },
          { code: 4832, name: 'Vijayawada Rural', districtCode: 504, type: 'Mandal' },
        ],
      },
    ],
  },
  {
    code: 24,
    name: 'Gujarat',
    isState: true,
    districts: [
      {
        code: 468,
        name: 'Rajkot',
        stateCode: 24,
        subdistricts: [
          { code: 3710, name: 'Rajkot', districtCode: 468, type: 'Tehsil' },
          { code: 3711, name: 'Gondal', districtCode: 468, type: 'Tehsil' },
          { code: 3712, name: 'Jetpur', districtCode: 468, type: 'Tehsil' },
          { code: 3713, name: 'Dhoraji', districtCode: 468, type: 'Tehsil' },
        ],
      },
      {
        code: 472,
        name: 'Surat',
        stateCode: 24,
        subdistricts: [
          { code: 3750, name: 'Chorasi', districtCode: 472, type: 'Tehsil' },
          { code: 3751, name: 'Bardoli', districtCode: 472, type: 'Tehsil' },
          { code: 3752, name: 'Olpad', districtCode: 472, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 6,
    name: 'Haryana',
    isState: true,
    districts: [
      {
        code: 68,
        name: 'Karnal',
        stateCode: 6,
        subdistricts: [
          { code: 340, name: 'Karnal', districtCode: 68, type: 'Tehsil' },
          { code: 341, name: 'Indri', districtCode: 68, type: 'Tehsil' },
          { code: 342, name: 'Assandh', districtCode: 68, type: 'Tehsil' },
          { code: 343, name: 'Gharaunda', districtCode: 68, type: 'Tehsil' },
        ],
      },
      {
        code: 67,
        name: 'Hisar',
        stateCode: 6,
        subdistricts: [
          { code: 330, name: 'Hisar', districtCode: 67, type: 'Tehsil' },
          { code: 331, name: 'Hansi', districtCode: 67, type: 'Tehsil' },
          { code: 332, name: 'Barwala', districtCode: 67, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 9,
    name: 'Uttar Pradesh',
    isState: true,
    districts: [
      {
        code: 196,
        name: 'Varanasi',
        stateCode: 9,
        subdistricts: [
          { code: 970, name: 'Varanasi', districtCode: 196, type: 'Tehsil' },
          { code: 971, name: 'Pindra', districtCode: 196, type: 'Tehsil' },
          { code: 972, name: 'Raja Talab', districtCode: 196, type: 'Tehsil' },
        ],
      },
      {
        code: 154,
        name: 'Kanpur Nagar',
        stateCode: 9,
        subdistricts: [
          { code: 750, name: 'Kanpur Sadar', districtCode: 154, type: 'Tehsil' },
          { code: 751, name: 'Ghatampur', districtCode: 154, type: 'Tehsil' },
          { code: 752, name: 'Bilhore', districtCode: 154, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 23,
    name: 'Madhya Pradesh',
    isState: true,
    districts: [
      {
        code: 420,
        name: 'Indore',
        stateCode: 23,
        subdistricts: [
          { code: 3310, name: 'Indore', districtCode: 420, type: 'Tehsil' },
          { code: 3311, name: 'Mhow (Dr. Ambedkar Nagar)', districtCode: 420, type: 'Tehsil' },
          { code: 3312, name: 'Sanwer', districtCode: 420, type: 'Tehsil' },
          { code: 3313, name: 'Depalpur', districtCode: 420, type: 'Tehsil' },
        ],
      },
      {
        code: 440,
        name: 'Ujjain',
        stateCode: 23,
        subdistricts: [
          { code: 3450, name: 'Ujjain', districtCode: 440, type: 'Tehsil' },
          { code: 3451, name: 'Nagda', districtCode: 440, type: 'Tehsil' },
          { code: 3452, name: 'Badnagar', districtCode: 440, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 8,
    name: 'Rajasthan',
    isState: true,
    districts: [
      {
        code: 104,
        name: 'Jaipur',
        stateCode: 8,
        subdistricts: [
          { code: 510, name: 'Jaipur', districtCode: 104, type: 'Tehsil' },
          { code: 511, name: 'Chomu', districtCode: 104, type: 'Tehsil' },
          { code: 512, name: 'Kotputli', districtCode: 104, type: 'Tehsil' },
        ],
      },
      {
        code: 100,
        name: 'Ganganagar',
        stateCode: 8,
        subdistricts: [
          { code: 490, name: 'Ganganagar', districtCode: 100, type: 'Tehsil' },
          { code: 491, name: 'Suratgarh', districtCode: 100, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 33,
    name: 'Tamil Nadu',
    isState: true,
    districts: [
      {
        code: 615,
        name: 'Thanjavur (Cauvery Delta)',
        stateCode: 33,
        subdistricts: [
          { code: 5790, name: 'Thanjavur', districtCode: 615, type: 'Taluk' },
          { code: 5791, name: 'Kumbakonam', districtCode: 615, type: 'Taluk' },
          { code: 5792, name: 'Papanasam', districtCode: 615, type: 'Taluk' },
        ],
      },
      {
        code: 605,
        name: 'Coimbatore',
        stateCode: 33,
        subdistricts: [
          { code: 5720, name: 'Coimbatore North', districtCode: 605, type: 'Taluk' },
          { code: 5721, name: 'Pollachi', districtCode: 605, type: 'Taluk' },
        ],
      },
    ],
  },
  {
    code: 19,
    name: 'West Bengal',
    isState: true,
    districts: [
      {
        code: 308,
        name: 'Purba Bardhaman',
        stateCode: 19,
        subdistricts: [
          { code: 2380, name: 'Bardhaman Sadar North', districtCode: 308, type: 'Subdivision' },
          { code: 2381, name: 'Kalna', districtCode: 308, type: 'Subdivision' },
          { code: 2382, name: 'Katwa', districtCode: 308, type: 'Subdivision' },
        ],
      },
    ],
  },
  {
    code: 36,
    name: 'Telangana',
    isState: true,
    districts: [
      {
        code: 680,
        name: 'Warangal',
        stateCode: 36,
        subdistricts: [
          { code: 6210, name: 'Warangal', districtCode: 680, type: 'Mandal' },
          { code: 6211, name: 'Narsampet', districtCode: 680, type: 'Mandal' },
        ],
      },
    ],
  },
  {
    code: 10,
    name: 'Bihar',
    isState: true,
    districts: [
      {
        code: 230,
        name: 'Patna',
        stateCode: 10,
        subdistricts: [
          { code: 1450, name: 'Patna Sadar', districtCode: 230, type: 'Subdivision' },
          { code: 1451, name: 'Barh', districtCode: 230, type: 'Subdivision' },
        ],
      },
    ],
  },
  {
    code: 21,
    name: 'Odisha',
    isState: true,
    districts: [
      {
        code: 350,
        name: 'Cuttack',
        stateCode: 21,
        subdistricts: [
          { code: 2810, name: 'Cuttack Sadar', districtCode: 350, type: 'Tehsil' },
          { code: 2811, name: 'Salepur', districtCode: 350, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 32,
    name: 'Kerala',
    isState: true,
    districts: [
      {
        code: 560,
        name: 'Palakkad (Granary of Kerala)',
        stateCode: 32,
        subdistricts: [
          { code: 5410, name: 'Palakkad', districtCode: 560, type: 'Taluk' },
          { code: 5411, name: 'Chittur', districtCode: 560, type: 'Taluk' },
          { code: 5412, name: 'Alathur', districtCode: 560, type: 'Taluk' },
        ],
      },
    ],
  },
  {
    code: 22,
    name: 'Chhattisgarh',
    isState: true,
    districts: [
      {
        code: 380,
        name: 'Raipur',
        stateCode: 22,
        subdistricts: [
          { code: 3100, name: 'Raipur', districtCode: 380, type: 'Tehsil' },
          { code: 3101, name: 'Arang', districtCode: 380, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 20,
    name: 'Jharkhand',
    isState: true,
    districts: [
      {
        code: 320,
        name: 'Ranchi',
        stateCode: 20,
        subdistricts: [
          { code: 2510, name: 'Ranchi', districtCode: 320, type: 'Subdivision' },
        ],
      },
    ],
  },
  {
    code: 18,
    name: 'Assam',
    isState: true,
    districts: [
      {
        code: 280,
        name: 'Kamrup',
        stateCode: 18,
        subdistricts: [
          { code: 2150, name: 'Kamrup Sadar', districtCode: 280, type: 'Subdivision' },
        ],
      },
    ],
  },
  {
    code: 2,
    name: 'Himachal Pradesh',
    isState: true,
    districts: [
      {
        code: 15,
        name: 'Kangra',
        stateCode: 2,
        subdistricts: [
          { code: 75, name: 'Dharamsala', districtCode: 15, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 5,
    name: 'Uttarakhand',
    isState: true,
    districts: [
      {
        code: 50,
        name: 'Dehradun',
        stateCode: 5,
        subdistricts: [
          { code: 250, name: 'Dehradun', districtCode: 50, type: 'Tehsil' },
        ],
      },
    ],
  },
  {
    code: 30,
    name: 'Goa',
    isState: true,
    districts: [
      {
        code: 540,
        name: 'North Goa',
        stateCode: 30,
        subdistricts: [
          { code: 5210, name: 'Tiswadi (Panaji)', districtCode: 540, type: 'Taluk' },
        ],
      },
    ],
  },
  {
    code: 12,
    name: 'Arunachal Pradesh',
    isState: true,
    districts: [
      {
        code: 210,
        name: 'Papum Pare',
        stateCode: 12,
        subdistricts: [{ code: 1710, name: 'Itanagar', districtCode: 210, type: 'Subdivision' }],
      },
    ],
  },
  {
    code: 14,
    name: 'Manipur',
    isState: true,
    districts: [
      {
        code: 240,
        name: 'Imphal West',
        stateCode: 14,
        subdistricts: [{ code: 1850, name: 'Lamphelpat', districtCode: 240, type: 'Subdivision' }],
      },
    ],
  },
  {
    code: 17,
    name: 'Meghalaya',
    isState: true,
    districts: [
      {
        code: 260,
        name: 'East Khasi Hills',
        stateCode: 17,
        subdistricts: [{ code: 2010, name: 'Shillong', districtCode: 260, type: 'Subdivision' }],
      },
    ],
  },
  {
    code: 15,
    name: 'Mizoram',
    isState: true,
    districts: [
      {
        code: 250,
        name: 'Aizawl',
        stateCode: 15,
        subdistricts: [{ code: 1910, name: 'Aizawl', districtCode: 250, type: 'Subdivision' }],
      },
    ],
  },
  {
    code: 13,
    name: 'Nagaland',
    isState: true,
    districts: [
      {
        code: 220,
        name: 'Kohima',
        stateCode: 13,
        subdistricts: [{ code: 1780, name: 'Kohima', districtCode: 220, type: 'Subdivision' }],
      },
    ],
  },
  {
    code: 11,
    name: 'Sikkim',
    isState: true,
    districts: [
      {
        code: 200,
        name: 'East Sikkim (Gangtok)',
        stateCode: 11,
        subdistricts: [{ code: 1650, name: 'Gangtok', districtCode: 200, type: 'Subdivision' }],
      },
    ],
  },
  {
    code: 16,
    name: 'Tripura',
    isState: true,
    districts: [
      {
        code: 255,
        name: 'West Tripura',
        stateCode: 16,
        subdistricts: [{ code: 1950, name: 'Agartala', districtCode: 255, type: 'Subdivision' }],
      },
    ],
  },
  // Union Territories
  {
    code: 7,
    name: 'Delhi (NCT)',
    isState: false,
    districts: [
      {
        code: 90,
        name: 'North West Delhi',
        stateCode: 7,
        subdistricts: [{ code: 450, name: 'Alipur', districtCode: 90, type: 'Subdivision' }],
      },
    ],
  },
  {
    code: 1,
    name: 'Jammu & Kashmir',
    isState: false,
    districts: [
      {
        code: 10,
        name: 'Jammu',
        stateCode: 1,
        subdistricts: [{ code: 50, name: 'Jammu', districtCode: 10, type: 'Tehsil' }],
      },
      {
        code: 12,
        name: 'Srinagar',
        stateCode: 1,
        subdistricts: [{ code: 60, name: 'Srinagar', districtCode: 12, type: 'Tehsil' }],
      },
    ],
  },
  {
    code: 37,
    name: 'Ladakh',
    isState: false,
    districts: [
      {
        code: 690,
        name: 'Leh',
        stateCode: 37,
        subdistricts: [{ code: 6300, name: 'Leh', districtCode: 690, type: 'Tehsil' }],
      },
    ],
  },
  {
    code: 34,
    name: 'Puducherry',
    isState: false,
    districts: [
      {
        code: 625,
        name: 'Puducherry',
        stateCode: 34,
        subdistricts: [{ code: 5910, name: 'Puducherry', districtCode: 625, type: 'Taluk' }],
      },
    ],
  },
  {
    code: 4,
    name: 'Chandigarh',
    isState: false,
    districts: [
      {
        code: 45,
        name: 'Chandigarh',
        stateCode: 4,
        subdistricts: [{ code: 200, name: 'Chandigarh', districtCode: 45, type: 'Tehsil' }],
      },
    ],
  },
  {
    code: 35,
    name: 'Andaman & Nicobar Islands',
    isState: false,
    districts: [
      {
        code: 630,
        name: 'South Andaman',
        stateCode: 35,
        subdistricts: [{ code: 6010, name: 'Port Blair', districtCode: 630, type: 'Tehsil' }],
      },
    ],
  },
  {
    code: 38,
    name: 'Dadra & Nagar Haveli and Daman & Diu',
    isState: false,
    districts: [
      {
        code: 495,
        name: 'Daman',
        stateCode: 38,
        subdistricts: [{ code: 3950, name: 'Daman', districtCode: 495, type: 'Taluk' }],
      },
    ],
  },
  {
    code: 31,
    name: 'Lakshadweep',
    isState: false,
    districts: [
      {
        code: 550,
        name: 'Lakshadweep',
        stateCode: 31,
        subdistricts: [{ code: 5310, name: 'Kavaratti', districtCode: 550, type: 'Subdivision' }],
      },
    ],
  },
];

/**
 * Returns all States and UTs sorted with Karnataka first, then alphabetically
 */
export function getAllStates(): LgdState[] {
  return [...LGD_STATES_MASTER].sort((a, b) => {
    if (a.code === KARNATAKA_STATE_LGD_CODE) return -1;
    if (b.code === KARNATAKA_STATE_LGD_CODE) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function getStateByCode(code: number): LgdState | undefined {
  return LGD_STATES_MASTER.find(s => s.code === code);
}

export function getDistrictsByState(stateCode: number): LgdDistrict[] {
  const state = getStateByCode(stateCode);
  return state ? state.districts : [];
}

export function getDistrictByCode(stateCode: number, districtCode: number): LgdDistrict | undefined {
  const state = getStateByCode(stateCode);
  return state?.districts.find(d => d.code === districtCode);
}

export function getSubdistrictsByDistrict(
  stateCode: number,
  districtCode: number
): LgdSubdistrict[] {
  const district = getDistrictByCode(stateCode, districtCode);
  return district ? district.subdistricts : [];
}

/**
 * Checks whether the state is Karnataka (LGD Code 29)
 */
export function isKarnataka(stateCode: number | null | undefined): boolean {
  return stateCode === KARNATAKA_STATE_LGD_CODE;
}

/**
 * In Karnataka, label the third dropdown 'Taluk'. In other states, label 'Subdistrict / Tehsil'
 */
export function getSubdistrictLabel(stateCode: number | null | undefined): 'Taluk' | 'Subdistrict / Tehsil' {
  return isKarnataka(stateCode) ? 'Taluk' : 'Subdistrict / Tehsil';
}

/**
 * Representative official LGD villages indexed by subdistrict code
 */
export const OFFICIAL_LGD_VILLAGES_BY_SUBDISTRICT: Record<number, LgdVillage[]> = {
  // Mandya Taluk (5508)
  5508: [
    { code: 614210, name: 'Kothathi', subdistrictCode: 5508, districtCode: 567 },
    { code: 614211, name: 'Dudda', subdistrictCode: 5508, districtCode: 567 },
    { code: 614212, name: 'Basaralu', subdistrictCode: 5508, districtCode: 567 },
    { code: 614213, name: 'Keragodu', subdistrictCode: 5508, districtCode: 567 },
    { code: 614214, name: 'Mangala', subdistrictCode: 5508, districtCode: 567 },
  ],
  // Maddur Taluk (5509)
  5509: [
    { code: 614230, name: 'Koppa', subdistrictCode: 5509, districtCode: 567 },
    { code: 614231, name: 'Athagur', subdistrictCode: 5509, districtCode: 567 },
    { code: 614232, name: 'Chikkarasinakere', subdistrictCode: 5509, districtCode: 567 },
  ],
  // Pandavapura (5511)
  5511: [
    { code: 614250, name: 'Melukote', subdistrictCode: 5511, districtCode: 567 },
    { code: 614251, name: 'Chinya', subdistrictCode: 5511, districtCode: 567 },
    { code: 614252, name: 'Kyathanahalli', subdistrictCode: 5511, districtCode: 567 },
  ],
  // Dharwad Taluk (5440)
  5440: [
    { code: 602310, name: 'Garag', subdistrictCode: 5440, districtCode: 556 },
    { code: 602311, name: 'Mugad', subdistrictCode: 5440, districtCode: 556 },
    { code: 602312, name: 'Hebballi', subdistrictCode: 5440, districtCode: 556 },
  ],
  // Chikkodi (5430)
  5430: [
    { code: 598120, name: 'Examba', subdistrictCode: 5430, districtCode: 555 },
    { code: 598121, name: 'Kallol', subdistrictCode: 5430, districtCode: 555 },
    { code: 598122, name: 'Kabbur', subdistrictCode: 5430, districtCode: 555 },
  ],
  // Ludhiana West (128)
  128: [
    { code: 34101, name: 'Ayali Kalan', subdistrictCode: 128, districtCode: 34 },
    { code: 34102, name: 'Baddowal', subdistrictCode: 128, districtCode: 34 },
    { code: 34103, name: 'Barewal Awana', subdistrictCode: 128, districtCode: 34 },
  ],
  // Nagpur Rural (4012)
  4012: [
    { code: 535210, name: 'Wadi', subdistrictCode: 4012, districtCode: 505 },
    { code: 535211, name: 'Hingna Rural', subdistrictCode: 4012, districtCode: 505 },
    { code: 535212, name: 'Bori', subdistrictCode: 4012, districtCode: 505 },
  ],
  // Guntur Mandal (5041)
  5041: [
    { code: 589410, name: 'Pedakakani', subdistrictCode: 5041, districtCode: 543 },
    { code: 589411, name: 'Tadikonda', subdistrictCode: 5041, districtCode: 543 },
    { code: 589412, name: 'Prathipadu', subdistrictCode: 5041, districtCode: 543 },
  ],
};

export function getVillagesBySubdistrict(
  _stateCode: number,
  _districtCode: number,
  subdistrictCode: number
): LgdVillage[] {
  if (OFFICIAL_LGD_VILLAGES_BY_SUBDISTRICT[subdistrictCode]) {
    return OFFICIAL_LGD_VILLAGES_BY_SUBDISTRICT[subdistrictCode];
  }
  return [
    { code: subdistrictCode * 100 + 1, name: 'Gram Panchayat East', subdistrictCode, districtCode: _districtCode },
    { code: subdistrictCode * 100 + 2, name: 'Agri Settlement Central', subdistrictCode, districtCode: _districtCode },
    { code: subdistrictCode * 100 + 3, name: 'Krishi Village West', subdistrictCode, districtCode: _districtCode },
  ];
}

