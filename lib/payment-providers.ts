export type PaymentMode = "direct" | "menu" | "custom";
export type PaymentVerification = "verified" | "unverified";

export type PaymentProvider = {
  id: string;
  name: string;
  prefix: string;
  mode: PaymentMode;
  verification?: PaymentVerification;
  template?: string;
  currency?: string;
};

export type PaymentCountry = {
  code: string;
  name: string;
  flag: string;
  providers: PaymentProvider[];
};

/**
 * Mobile-money / USSD directory used by SkanMakery.
 * Verified entries are based on provider-published USSD information.
 * Users can still edit a verified code/template before creating a QR.
 * Unverified entries are never guessed as direct number+amount flows.
 */
export const PAYMENT_COUNTRIES: PaymentCountry[] = [
  {code:"SO",name:"Somalia",flag:"🇸🇴",providers:[
    {id:"evc",name:"Hormuud EVC Plus",prefix:"*770#",mode:"menu",verification:"unverified",currency:"USD"},
    {id:"zaad-usd",name:"ZAAD Dollar — Personal",prefix:"*880*",mode:"direct",verification:"verified",template:"*880*{number}*{amount}#",currency:"USD"},
    {id:"zaad-merchant-usd",name:"ZAAD Dollar — Merchant",prefix:"*883*",mode:"direct",verification:"verified",template:"*883*{number}*{amount}#",currency:"USD"},
    {id:"zaad-sls",name:"ZAAD Shilling — Merchant",prefix:"*223*",mode:"direct",verification:"verified",template:"*223*{number}*{amount}#",currency:"SLS"},
    {id:"sahal",name:"Sahal",prefix:"*888#",mode:"menu",verification:"verified",currency:"USD"},
  ]},
  {code:"ET",name:"Ethiopia",flag:"🇪🇹",providers:[
    {id:"telebirr",name:"Telebirr",prefix:"*127#",mode:"menu",verification:"unverified",currency:"ETB"},
    {id:"mpesa-et",name:"M-PESA",prefix:"*733#",mode:"menu",verification:"unverified",currency:"ETB"},
  ]},
  {code:"KE",name:"Kenya",flag:"🇰🇪",providers:[
    {id:"mpesa-ke",name:"M-PESA",prefix:"*334#",mode:"menu",verification:"unverified",currency:"KES"},
    {id:"airtel-ke",name:"Airtel Money",prefix:"*334#",mode:"menu",verification:"unverified",currency:"KES"},
    {id:"sasapay",name:"SasaPay",prefix:"*626#",mode:"menu",verification:"unverified",currency:"KES"},
  ]},
  {code:"TZ",name:"Tanzania",flag:"🇹🇿",providers:[
    {id:"mixx",name:"Mixx by Yas",prefix:"*150*01#",mode:"menu",verification:"unverified",currency:"TZS"},
    {id:"mpesa-tz",name:"M-PESA",prefix:"*150*00#",mode:"menu",verification:"unverified",currency:"TZS"},
    {id:"airtel-tz",name:"Airtel Money",prefix:"*150*60#",mode:"menu",verification:"unverified",currency:"TZS"},
  ]},
  {code:"UG",name:"Uganda",flag:"🇺🇬",providers:[
    {id:"mtn-ug",name:"MTN MoMo",prefix:"*165#",mode:"menu",verification:"unverified",currency:"UGX"},
    {id:"airtel-ug",name:"Airtel Money",prefix:"*185#",mode:"menu",verification:"unverified",currency:"UGX"},
  ]},
  {code:"GH",name:"Ghana",flag:"🇬🇭",providers:[
    {id:"mtn-gh",name:"MTN MoMo",prefix:"*170#",mode:"menu",verification:"unverified",currency:"GHS"},
    {id:"telecel-gh",name:"Telecel Cash",prefix:"*110#",mode:"menu",verification:"unverified",currency:"GHS"},
    {id:"at-gh",name:"AT Money",prefix:"*500#",mode:"menu",verification:"unverified",currency:"GHS"},
  ]},
  {code:"NG",name:"Nigeria",flag:"🇳🇬",providers:[
    {id:"mtn-momo-ng",name:"MTN MoMo",prefix:"*671#",mode:"menu",verification:"unverified",currency:"NGN"},
    {id:"opay-ng",name:"OPay",prefix:"*955#",mode:"menu",verification:"unverified",currency:"NGN"},
    {id:"paga-ng",name:"Paga",prefix:"*242#",mode:"menu",verification:"unverified",currency:"NGN"},
  ]},
  {code:"ZA",name:"South Africa",flag:"🇿🇦",providers:[
    {id:"vodapay-za",name:"Vodapay",prefix:"*120*2272#",mode:"menu",verification:"unverified",currency:"ZAR"},
    {id:"standard-za",name:"Standard Bank",prefix:"*120*2345#",mode:"menu",verification:"unverified",currency:"ZAR"},
  ]},
  {code:"ZM",name:"Zambia",flag:"🇿🇲",providers:[
    {id:"mtn-zm",name:"MTN MoMo",prefix:"*303#",mode:"menu",verification:"unverified",currency:"ZMW"},
    {id:"airtel-zm",name:"Airtel Money",prefix:"*778#",mode:"menu",verification:"unverified",currency:"ZMW"},
  ]},
  {code:"MW",name:"Malawi",flag:"🇲🇼",providers:[
    {id:"airtel-mw",name:"Airtel Money",prefix:"*211#",mode:"menu",verification:"unverified",currency:"MWK"},
    {id:"tnm-mw",name:"TNM Mpamba",prefix:"*444#",mode:"menu",verification:"unverified",currency:"MWK"},
  ]},
  {code:"RW",name:"Rwanda",flag:"🇷🇼",providers:[
    {id:"mtn-rw",name:"MTN MoMo",prefix:"*182#",mode:"menu",verification:"unverified",currency:"RWF"},
    {id:"airtel-rw",name:"Airtel Money",prefix:"*500#",mode:"menu",verification:"unverified",currency:"RWF"},
  ]},
  {code:"BI",name:"Burundi",flag:"🇧🇮",providers:[
    {id:"lumicash",name:"Lumicash",prefix:"*163#",mode:"menu",verification:"unverified",currency:"BIF"},
    {id:"ecocash-bi",name:"EcoCash",prefix:"*300#",mode:"menu",verification:"unverified",currency:"BIF"},
  ]},
  {code:"CD",name:"DR Congo",flag:"🇨🇩",providers:[
    {id:"mpesa-cd",name:"M-Pesa",prefix:"*1122#",mode:"menu",verification:"unverified",currency:"CDF"},
    {id:"orange-cd",name:"Orange Money",prefix:"*144#",mode:"menu",verification:"unverified",currency:"CDF"},
    {id:"airtel-cd",name:"Airtel Money",prefix:"*501#",mode:"menu",verification:"unverified",currency:"CDF"},
  ]},
  {code:"CG",name:"Republic of the Congo",flag:"🇨🇬",providers:[
    {id:"airtel-cg",name:"Airtel Money",prefix:"*128#",mode:"menu",verification:"unverified",currency:"XAF"},
    {id:"mtm-cg",name:"MTN Mobile Money",prefix:"*105#",mode:"menu",verification:"unverified",currency:"XAF"},
  ]},
  {code:"CM",name:"Cameroon",flag:"🇨🇲",providers:[
    {id:"mtn-cm",name:"MTN MoMo",prefix:"*126#",mode:"menu",verification:"unverified",currency:"XAF"},
    {id:"orange-cm",name:"Orange Money",prefix:"#150#",mode:"menu",verification:"unverified",currency:"XAF"},
  ]},
  {code:"CI",name:"Côte d’Ivoire",flag:"🇨🇮",providers:[
    {id:"mtn-ci",name:"MTN MoMo",prefix:"*133#",mode:"menu",verification:"unverified",currency:"XOF"},
    {id:"moov-ci",name:"Moov Money",prefix:"*155#",mode:"menu",verification:"unverified",currency:"XOF"},
    {id:"orange-ci",name:"Orange Money",prefix:"#144#",mode:"menu",verification:"unverified",currency:"XOF"},
    {id:"wave-ci",name:"Wave",prefix:"*404#",mode:"menu",verification:"unverified",currency:"XOF"},
  ]},
  {code:"SN",name:"Senegal",flag:"🇸🇳",providers:[
    {id:"orange-sn",name:"Orange Money",prefix:"#144#",mode:"menu",verification:"unverified",currency:"XOF"},
    {id:"wave-sn",name:"Wave",prefix:"*217#",mode:"menu",verification:"unverified",currency:"XOF"},
  ]},
  {code:"ML",name:"Mali",flag:"🇲🇱",providers:[
    {id:"orange-ml",name:"Orange Money",prefix:"#144#",mode:"menu",verification:"unverified",currency:"XOF"},
    {id:"moov-ml",name:"Moov Money",prefix:"*166#",mode:"menu",verification:"unverified",currency:"XOF"},
  ]},
  {code:"BF",name:"Burkina Faso",flag:"🇧🇫",providers:[
    {id:"orange-bf",name:"Orange Money",prefix:"*144#",mode:"menu",verification:"unverified",currency:"XOF"},
    {id:"moov-bf",name:"Moov Money",prefix:"*555#",mode:"menu",verification:"unverified",currency:"XOF"},
  ]},
  {code:"BJ",name:"Benin",flag:"🇧🇯",providers:[
    {id:"mtn-bj",name:"MTN MoMo",prefix:"*840#",mode:"menu",verification:"unverified",currency:"XOF"},
    {id:"moov-bj",name:"Moov Money",prefix:"*855#",mode:"menu",verification:"unverified",currency:"XOF"},
  ]},
  {code:"TG",name:"Togo",flag:"🇹🇬",providers:[
    {id:"tmoney-tg",name:"T-Money",prefix:"*145#",mode:"menu",verification:"unverified",currency:"XOF"},
    {id:"moov-tg",name:"Moov Money",prefix:"*155#",mode:"menu",verification:"unverified",currency:"XOF"},
  ]},
  {code:"GN",name:"Guinea",flag:"🇬🇳",providers:[
    {id:"orange-gn",name:"Orange Money",prefix:"#144#",mode:"menu",verification:"unverified",currency:"GNF"},
    {id:"mtn-gn",name:"MTN Mobile Money",prefix:"*111#",mode:"menu",verification:"unverified",currency:"GNF"},
  ]},
  {code:"SL",name:"Sierra Leone",flag:"🇸🇱",providers:[
    {id:"orange-sl",name:"Orange Money",prefix:"*134#",mode:"menu",verification:"unverified",currency:"SLE"},
    {id:"africell-sl",name:"Afrimoney",prefix:"*161#",mode:"menu",verification:"unverified",currency:"SLE"},
  ]},
  {code:"LR",name:"Liberia",flag:"🇱🇷",providers:[
    {id:"lonestar-lr",name:"Lonestar Cell MTN Mobile Money",prefix:"*156#",mode:"menu",verification:"unverified",currency:"LRD"},
    {id:"orange-lr",name:"Orange Money",prefix:"*144#",mode:"menu",verification:"unverified",currency:"LRD"},
  ]},
  {code:"NA",name:"Namibia",flag:"🇳🇦",providers:[{id:"easywallet-na",name:"EasyWallet",prefix:"*140#",mode:"menu",verification:"unverified",currency:"NAD"}]},
  {code:"BW",name:"Botswana",flag:"🇧🇼",providers:[
    {id:"orange-bw",name:"Orange Money",prefix:"*145#",mode:"menu",verification:"unverified",currency:"BWP"},
    {id:"myzaka-bw",name:"MyZaka",prefix:"*130#",mode:"menu",verification:"unverified",currency:"BWP"},
  ]},
  {code:"SZ",name:"Eswatini",flag:"🇸🇿",providers:[{id:"mtn-eswatini",name:"MTN MoMo",prefix:"*131#",mode:"menu",verification:"unverified",currency:"SZL"}]},
  {code:"LS",name:"Lesotho",flag:"🇱🇸",providers:[
    {id:"mpesa-ls",name:"M-Pesa",prefix:"*200#",mode:"menu",verification:"unverified",currency:"LSL"},
    {id:"econet-ls",name:"EcoCash",prefix:"*134#",mode:"menu",verification:"unverified",currency:"LSL"},
  ]},
  {code:"MZ",name:"Mozambique",flag:"🇲🇿",providers:[
    {id:"mpesa-mz",name:"M-Pesa",prefix:"*150#",mode:"menu",verification:"unverified",currency:"MZN"},
    {id:"mkesh-mz",name:"mKesh",prefix:"*500#",mode:"menu",verification:"unverified",currency:"MZN"},
  ]},
  {code:"MG",name:"Madagascar",flag:"🇲🇬",providers:[
    {id:"mvola-mg",name:"MVola",prefix:"#111#",mode:"menu",verification:"unverified",currency:"MGA"},
    {id:"orange-mg",name:"Orange Money",prefix:"#144#",mode:"menu",verification:"unverified",currency:"MGA"},
    {id:"airtel-mg",name:"Airtel Money",prefix:"*436#",mode:"menu",verification:"unverified",currency:"MGA"},
  ]},
  {code:"MU",name:"Mauritius",flag:"🇲🇺",providers:[{id:"myt-money",name:"my.t money",prefix:"*400#",mode:"menu",verification:"unverified",currency:"MUR"}]},
  {code:"EG",name:"Egypt",flag:"🇪🇬",providers:[
    {id:"vodafone-cash-eg",name:"Vodafone Cash",prefix:"*9#",mode:"menu",verification:"unverified",currency:"EGP"},
    {id:"etisalat-cash-eg",name:"e& money",prefix:"*777#",mode:"menu",verification:"unverified",currency:"EGP"},
  ]},
  {code:"MA",name:"Morocco",flag:"🇲🇦",providers:[{id:"orange-money-ma",name:"Orange Money",prefix:"#144#",mode:"menu",verification:"unverified",currency:"MAD"}]},
  {code:"AF",name:"Afghanistan",flag:"🇦🇫",providers:[
    {id:"m-paisa-af",name:"M-Paisa",prefix:"*778#",mode:"menu",verification:"unverified",currency:"AFN"},
    {id:"etisalat-af",name:"Etisalat mHawala",prefix:"*711#",mode:"menu",verification:"unverified",currency:"AFN"},
  ]},
  {code:"PK",name:"Pakistan",flag:"🇵🇰",providers:[
    {id:"easypaisa-pk",name:"Easypaisa",prefix:"*786#",mode:"menu",verification:"unverified",currency:"PKR"},
    {id:"jazzcash-pk",name:"JazzCash",prefix:"*786#",mode:"menu",verification:"unverified",currency:"PKR"},
  ]},
  {code:"BD",name:"Bangladesh",flag:"🇧🇩",providers:[
    {id:"bkash-bd",name:"bKash",prefix:"*247#",mode:"menu",verification:"unverified",currency:"BDT"},
    {id:"nagad-bd",name:"Nagad",prefix:"*167#",mode:"menu",verification:"unverified",currency:"BDT"},
  ]},
  {code:"LK",name:"Sri Lanka",flag:"🇱🇰",providers:[{id:"dialog-genie",name:"Dialog Genie",prefix:"#678#",mode:"menu",verification:"unverified",currency:"LKR"}]},
  {code:"PH",name:"Philippines",flag:"🇵🇭",providers:[{id:"gcash-ph",name:"GCash",prefix:"*143#",mode:"menu",verification:"unverified",currency:"PHP"}]},
  {code:"ID",name:"Indonesia",flag:"🇮🇩",providers:[{id:"dana-id",name:"DANA",prefix:"*141#",mode:"menu",verification:"unverified",currency:"IDR"}]},
  {code:"MY",name:"Malaysia",flag:"🇲🇾",providers:[{id:"tng-my",name:"Touch ’n Go eWallet",prefix:"*150#",mode:"menu",verification:"unverified",currency:"MYR"}]},
  {code:"IN",name:"India",flag:"🇮🇳",providers:[{id:"upi-in",name:"UPI",prefix:"*99#",mode:"menu",verification:"unverified",currency:"INR"}]},
  {code:"FJ",name:"Fiji",flag:"🇫🇯",providers:[{id:"vodafone-mpaisa-fj",name:"Vodafone M-Paisa",prefix:"*181#",mode:"menu",verification:"unverified",currency:"FJD"}]},
  {code:"PG",name:"Papua New Guinea",flag:"🇵🇬",providers:[{id:"bsp-pg",name:"BSP Mobile Banking",prefix:"*131#",mode:"menu",verification:"unverified",currency:"PGK"}]},
  {code:"WS",name:"Samoa",flag:"🇼🇸",providers:[{id:"digicel-mmoney-ws",name:"Digicel MyCash",prefix:"*164#",mode:"menu",verification:"unverified",currency:"WST"}]},
  {code:"TO",name:"Tonga",flag:"🇹🇴",providers:[{id:"digicel-tonga",name:"Digicel Mobile Money",prefix:"*123#",mode:"menu",verification:"unverified",currency:"TOP"}]},
  {code:"VU",name:"Vanuatu",flag:"🇻🇺",providers:[{id:"vodafone-mpaisa-vu",name:"Vodafone M-Paisa",prefix:"*111#",mode:"menu",verification:"unverified",currency:"VUV"}]},
  {code:"SB",name:"Solomon Islands",flag:"🇸🇧",providers:[{id:"bmobile-sb",name:"bmobile Money",prefix:"*777#",mode:"menu",verification:"unverified",currency:"SBD"}]},
  {code:"KI",name:"Kiribati",flag:"🇰🇮",providers:[{id:"bweb-money-ki",name:"Bwebwenato Money",prefix:"*123#",mode:"menu",verification:"unverified",currency:"AUD"}]},
];

export const UNIQUE_PAYMENT_COUNTRIES = PAYMENT_COUNTRIES.filter(
  (country, index, all) => all.findIndex((x) => x.code === country.code) === index
);

export function getPaymentCountry(code: string) {
  return UNIQUE_PAYMENT_COUNTRIES.find((x) => x.code === code);
}

export function getPaymentProvider(countryCode: string, providerId: string) {
  return getPaymentCountry(countryCode)?.providers.find((x) => x.id === providerId);
}
