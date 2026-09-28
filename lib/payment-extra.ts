import type {PaymentCountry} from "./payment-providers";

export const EXTRA_PAYMENT_COUNTRIES: PaymentCountry[] = [
 {code:"ZW",name:"Zimbabwe",flag:"🇿🇼",providers:[
  {id:"ecocash-zw",name:"EcoCash",prefix:"*151#",mode:"menu",verification:"unverified",currency:"ZWG"},
  {id:"one-money-zw",name:"OneMoney",prefix:"*111#",mode:"menu",verification:"unverified",currency:"ZWG"}
 ]},
 {code:"KH",name:"Cambodia",flag:"🇰🇭",providers:[
  {id:"wing-kh",name:"Wing",prefix:"*170#",mode:"menu",verification:"unverified",currency:"KHR"}
 ]}
];