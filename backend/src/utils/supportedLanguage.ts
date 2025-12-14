export const SUPPORTED_LANGUAGES: { [key: string]: string } = {
  // A
  ace: "ace_Latn", // Acehnese
  acm: "acm_Arab", // Mesopotamian Arabic
  acq: "acq_Arab", // Ta'izzi-Adeni Arabic
  aeb: "aeb_Arab", // Tunisian Arabic
  af: "afr_Latn",  // Afrikaans
  ajp: "ajp_Arab", // South Levantine Arabic
  ak: "aka_Latn",  // Akan
  am: "amh_Ethi",  // Amharic
  apc: "apc_Arab", // North Levantine Arabic
  ar: "arb_Arab",  // Modern Standard Arabic
  ars: "ars_Arab", // Najdi Arabic
  ary: "ary_Arab", // Moroccan Arabic
  arz: "arz_Arab", // Egyptian Arabic
  as: "asm_Beng",  // Assamese
  ast: "ast_Latn", // Asturian
  awa: "awa_Deva", // Awadhi
  ayr: "ayr_Latn", // Central Aymara
  az: "azb_Arab",  // South Azerbaijani
  azj: "azj_Latn", // North Azerbaijani
  
  // B
  ba: "bak_Cyrl",  // Bashkir
  bm: "bam_Latn",  // Bambara
  ban: "ban_Latn", // Balinese
  be: "bel_Cyrl",  // Belarusian
  bem: "bem_Latn", // Bemba
  bn: "ben_Beng",  // Bengali
  bho: "bho_Deva", // Bhojpuri
  bjn: "bjn_Latn", // Banjar
  bo: "bod_Tibt",  // Tibetan
  bs: "bos_Latn",  // Bosnian
  bug: "bug_Latn", // Buginese
  bg: "bul_Cyrl",  // Bulgarian
  
  // C
  ca: "cat_Latn",  // Catalan
  ceb: "ceb_Latn", // Cebuano
  cs: "ces_Latn",  // Czech
  cjk: "cjk_Latn", // Chokwe
  ckb: "ckb_Arab", // Central Kurdish
  crh: "crh_Latn", // Crimean Tatar
  cy: "cym_Latn",  // Welsh
  
  // D
  da: "dan_Latn",  // Danish
  de: "deu_Latn",  // German
  dik: "dik_Latn", // Southwestern Dinka
  dyu: "dyu_Latn", // Dyula
  dz: "dzo_Tibt",  // Dzongkha
  
  // E
  el: "ell_Grek",  // Greek
  en: "eng_Latn",  // English
  eo: "epo_Latn",  // Esperanto
  et: "est_Latn",  // Estonian
  eu: "eus_Latn",  // Basque
  ee: "ewe_Latn",  // Ewe
  
  // F
  fo: "fao_Latn",  // Faroese
  fj: "fij_Latn",  // Fijian
  fi: "fin_Latn",  // Finnish
  fon: "fon_Latn", // Fon
  fr: "fra_Latn",  // French
  fur: "fur_Latn", // Friulian
  fuv: "fuv_Latn", // Nigerian Fulfulde
  
  // G
  gaz: "gaz_Latn", // West Central Oromo
  gl: "glg_Latn",  // Galician
  gn: "grn_Latn",  // Guarani
  gu: "guj_Gujr",  // Gujarati
  
  // H
  ht: "hat_Latn",  // Haitian Creole
  ha: "hau_Latn",  // Hausa
  he: "heb_Hebr",  // Hebrew
  hi: "hin_Deva",  // Hindi
  hne: "hne_Deva", // Chhattisgarhi
  hr: "hrv_Latn",  // Croatian
  hu: "hun_Latn",  // Hungarian
  hy: "hye_Armn",  // Armenian
  
  // I
  ig: "ibo_Latn",  // Igbo
  ilo: "ilo_Latn", // Ilocano
  id: "ind_Latn",  // Indonesian
  is: "isl_Latn",  // Icelandic
  it: "ita_Latn",  // Italian
  
  // J
  jv: "jav_Latn",  // Javanese
  ja: "jpn_Jpan",  // Japanese
  
  // K
  kab: "kab_Latn", // Kabyle
  kac: "kac_Latn", // Jingpho
  kam: "kam_Latn", // Kamba
  kn: "kan_Knda",  // Kannada
  ks: "kas_Arab",  // Kashmiri (Arabic)
  ksd: "kas_Deva", // Kashmiri (Devanagari)
  ka: "kat_Geor",  // Georgian
  kk: "kaz_Cyrl",  // Kazakh
  kbp: "kbp_Latn", // Kabiyè
  kea: "kea_Latn", // Kabuverdianu
  km: "khm_Khmr",  // Khmer
  ki: "kik_Latn",  // Kikuyu
  rw: "kin_Latn",  // Kinyarwanda
  ky: "kir_Cyrl",  // Kyrgyz
  kmb: "kmb_Latn", // Kimbundu
  kmr: "kmr_Latn", // Northern Kurdish
  knl: "knc_Latn",  // Central Kanuri
  ko: "kor_Hang",  // Korean
  
  // L
  lo: "lao_Laoo",  // Lao
  lij: "lij_Latn", // Ligurian
  li: "lim_Latn",  // Limburgish
  ln: "lin_Latn",  // Lingala
  lt: "lit_Latn",  // Lithuanian
  lmo: "lmo_Latn", // Lombard
  ltg: "ltg_Latn", // Latgalian
  lb: "ltz_Latn",  // Luxembourgish
  lua: "lua_Latn", // Luba-Kasai
  lg: "lug_Latn",  // Ganda
  luo: "luo_Latn", // Luo
  lus: "lus_Latn", // Mizo
  lv: "lvs_Latn",  // Standard Latvian
  
  // M
  mag: "mag_Deva", // Magahi
  mai: "mai_Deva", // Maithili
  ml: "mal_Mlym",  // Malayalam
  mr: "mar_Deva",  // Marathi
  min: "min_Latn", // Minangkabau
  mk: "mkd_Cyrl",  // Macedonian
  mt: "mlt_Latn",  // Maltese
  mni: "mni_Beng", // Meitei (Bengali)
  mos: "mos_Latn", // Mossi
  mi: "mri_Latn",  // Maori
  ms: "zsm_Latn",  // Standard Malay
  my: "mya_Mymr",  // Burmese
  
  // N
  nl: "nld_Latn",  // Dutch
  nn: "nno_Latn",  // Norwegian Nynorsk
  nb: "nob_Latn",  // Norwegian Bokmål
  ne: "npi_Deva",  // Nepali
  nso: "nso_Latn", // Northern Sotho
  nus: "nus_Latn", // Nuer
  ny: "nya_Latn",  // Nyanja
  
  // O
  oc: "oci_Latn",  // Occitan
  or: "ory_Orya",  // Odia
  
  // P
  pag: "pag_Latn", // Pangasinan
  pa: "pan_Guru",  // Eastern Panjabi
  pap: "pap_Latn", // Papiamento
  ps: "pbt_Arab",  // Southern Pashto
  fa: "pes_Arab",  // Western Persian
  pl: "pol_Latn",  // Polish
  pt: "por_Latn",  // Portuguese
  prs: "prs_Arab", // Dari
  
  // Q
  qu: "quy_Latn",  // Ayacucho Quechua
  
  // R
  ro: "ron_Latn",  // Romanian
  rn: "run_Latn",  // Rundi
  ru: "rus_Cyrl",  // Russian
  
  // S
  sg: "sag_Latn",  // Sango
  sa: "san_Deva",  // Sanskrit
  sat: "sat_Beng", // Santali
  scn: "scn_Latn", // Sicilian
  shn: "shn_Mymr", // Shan
  si: "sin_Sinh",  // Sinhala
  sk: "slk_Latn",  // Slovak
  sl: "slv_Latn",  // Slovenian
  sm: "smo_Latn",  // Samoan
  sn: "sna_Latn",  // Shona
  sd: "snd_Arab",  // Sindhi
  so: "som_Latn",  // Somali
  st: "sot_Latn",  // Southern Sotho
  es: "spa_Latn",  // Spanish
  sq: "als_Latn",  // Albanian
  sc: "srd_Latn",  // Sardinian
  sr: "srp_Cyrl",  // Serbian
  ss: "ssw_Latn",  // Swati
  su: "sun_Latn",  // Sundanese
  sv: "swe_Latn",  // Swedish
  sw: "swh_Latn",  // Swahili
  szl: "szl_Latn", // Silesian
  
  // T
  ta: "tam_Taml",  // Tamil
  taq: "taq_Latn", // Tamasheq
  tt: "tat_Cyrl",  // Tatar
  te: "tel_Telu",  // Telugu
  tg: "tgk_Cyrl",  // Tajik
  tl: "tgl_Latn",  // Tagalog
  th: "tha_Thai",  // Thai
  ti: "tir_Ethi",  // Tigrinya
  tpi: "tpi_Latn", // Tok Pisin
  tn: "tsn_Latn",  // Tswana
  ts: "tso_Latn",  // Tsonga
  tk: "tuk_Latn",  // Turkmen
  tum: "tum_Latn", // Tumbuka
  tr: "tur_Latn",  // Turkish
  tw: "twi_Latn",  // Twi
  tzm: "tzm_Tfng", // Central Atlas Tamazight
  
  // U
  ug: "uig_Arab",  // Uyghur
  uk: "ukr_Cyrl",  // Ukrainian
  umb: "umb_Latn", // Umbundu
  ur: "urd_Arab",  // Urdu
  uz: "uzn_Latn",  // Northern Uzbek
  
  // V
  vec: "vec_Latn", // Venetian
  vi: "vie_Latn",  // Vietnamese
  
  // W
  war: "war_Latn", // Waray
  wo: "wol_Latn",  // Wolof
  
  // X
  xh: "xho_Latn",  // Xhosa
  
  // Y
  yi: "ydd_Hebr",  // Eastern Yiddish
  yo: "yor_Latn",  // Yoruba
  
  // Z
  zh: "zho_Hans",  // Chinese (Simplified)
  zht: "zho_Hant", // Chinese (Traditional)
  zu: "zul_Latn",  // Zulu
};