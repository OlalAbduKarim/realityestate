/**
 * Consolidated Ugandan Districts and Neighborhoods Reference Module
 *
 * NOTE FOR BACKEND / DATA VERIFICATION:
 * This module consolidates the regional district groupings and popular residential,
 * commercial, and peri-urban neighborhoods used by the frontend discovery filters.
 * Currently contains 133 district entries across the 4 administrative regions.
 * Before enforcing strict foreign-key or enum constraints in production PostgreSQL,
 * verify and reconcile this list against the latest gazetted Uganda Bureau of
 * Statistics (UBOS) / Ministry of Local Government administrative register.
 */

export interface UgandaRegion {
  name: string;
  districts: string[];
}

export const UGANDAN_REGIONS: UgandaRegion[] = [
  {
    name: 'Central Region',
    districts: [
      'Kampala',
      'Wakiso',
      'Mukono',
      'Buikwe',
      'Bukomansimbi',
      'Butambala',
      'Buvuma',
      'Gomba',
      'Kalangala',
      'Kalungu',
      'Kasanda',
      'Kayunga',
      'Kiboga',
      'Kyankwanzi',
      'Kyotera',
      'Luwero',
      'Lwengo',
      'Lyantonde',
      'Masaka',
      'Mityana',
      'Mpigi',
      'Mubende',
      'Nakaseke',
      'Nakasongola',
      'Rakai',
      'Sembabule'
    ]
  },
  {
    name: 'Eastern Region',
    districts: [
      'Jinja',
      'Mbale',
      'Soroti',
      'Tororo',
      'Amuria',
      'Budaka',
      'Bududa',
      'Bugiri',
      'Bugweri',
      'Bukedea',
      'Bukwo',
      'Bulambuli',
      'Busia',
      'Butaleja',
      'Butebo',
      'Buyende',
      'Iganga',
      'Kaberamaido',
      'Kalaki',
      'Kaliro',
      'Kamuli',
      'Kapchorwa',
      'Kapelebyong',
      'Katakwi',
      'Kibuku',
      'Kumi',
      'Kween',
      'Luuka',
      'Manafwa',
      'Mayuge',
      'Namayingo',
      'Namisindwa',
      'Namutumba',
      'Ngora',
      'Pallisa',
      'Serere',
      'Sironko'
    ]
  },
  {
    name: 'Western Region',
    districts: [
      'Mbarara',
      'Kabarole',
      'Kasese',
      'Hoima',
      'Buhweju',
      'Buliisa',
      'Bundibugyo',
      'Bunyangabu',
      'Bushenyi',
      'Ibanda',
      'Isingiro',
      'Kabale',
      'Kagadi',
      'Kakumiro',
      'Kamwenge',
      'Kanungu',
      'Kibaale',
      'Kikuube',
      'Kiruhura',
      'Kiryandongo',
      'Kisoro',
      'Kitagwenda',
      'Kyegegwa',
      'Kyenjojo',
      'Masindi',
      'Mitooma',
      'Ntoroko',
      'Ntungamo',
      'Rubanda',
      'Rubirizi',
      'Rukiga',
      'Rukungiri',
      'Rwampara',
      'Sheema'
    ]
  },
  {
    name: 'Northern Region',
    districts: [
      'Gulu',
      'Arua',
      'Lira',
      'Abim',
      'Adjumani',
      'Agago',
      'Alebtong',
      'Amolatar',
      'Amudat',
      'Amuru',
      'Apac',
      'Dokolo',
      'Kaabong',
      'Karenga',
      'Kitgum',
      'Koboko',
      'Kole',
      'Kotido',
      'Kwania',
      'Lamwo',
      'Madi-Okollo',
      'Maracha',
      'Moroto',
      'Moyo',
      'Nabilatuk',
      'Nakapiripirit',
      'Nwoya',
      'Obongi',
      'Omoro',
      'Otuke',
      'Oyam',
      'Pader',
      'Pakwach',
      'Terego',
      'Yumbe',
      'Zombo'
    ]
  }
];

// Flat sorted list of all unique Ugandan districts
export const ALL_UGANDAN_DISTRICTS: string[] = Array.from(
  new Set(UGANDAN_REGIONS.flatMap(r => r.districts))
).sort((a, b) => a.localeCompare(b));

// High-activity property market districts
export const TOP_MARKET_DISTRICTS: string[] = [
  'Kampala',
  'Wakiso',
  'Mukono',
  'Jinja',
  'Mbarara',
  'Gulu',
  'Masaka',
  'Kabarole',
  'Entebbe'
];

// Popular neighborhoods/suburbs across Uganda for quick typing suggestions & chips
export const POPULAR_NEIGHBORHOODS: string[] = [
  'Kololo',
  'Naguru',
  'Nakasero',
  'Bukoto',
  'Ntinda',
  'Muyenga',
  'Buziga',
  'Munyonyo',
  'Kira',
  'Najjera',
  'Kyanja',
  'Namugongo',
  'Lubowa',
  'Entebbe',
  'Bugolobi',
  'Naalya',
  'Mutungo',
  'Kansanga',
  'Rubaga',
  'Mengo',
  'Bunga',
  'Makindye',
  'Gayaza',
  'Kulambiro',
  'Kisaasi',
  'Kireka',
  'Bweyogerere',
  'Seguku',
  'Kajjansi',
  'Seeta',
  'Mukono Town',
  'Mbalala',
  'Jinja City',
  'Walukuba',
  'Njeru',
  'Mbarara City',
  'Kamukuzi',
  'Kakoba',
  'Gulu City',
  'Layibi',
  'Pece',
  'Fort Portal'
];
