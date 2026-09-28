import QRCode from "qrcode";

function wifiEscape(value:string){
  return String(value||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/:/g,"\\:");
}

export async function makeQrDataUrl(value:string){
  return QRCode.toDataURL(value,{width:1200,margin:4,errorCorrectionLevel:"H"});
}

export function makeTarget(type:string,form:Record<string,string>){
  switch(type){
    case "url":{let u=(form.url||"").trim();if(u&&!/^https?:\/\//i.test(u))u="https://"+u;return u;}
    case "text":return form.text||"";
    case "phone":{const p=(form.phone||"").trim();return "tel:"+(p.startsWith("*")?p.replace(/#$/,"%23"):p);}
    case "email":return "mailto:"+(form.email||"").trim();
    case "whatsapp":return "https://wa.me/"+(form.whatsapp||"").replace(/\D/g,"");
    case "wifi":return `WIFI:T:${form.security||"WPA"};S:${wifiEscape(form.ssid||"")};P:${wifiEscape(form.password||"")};H:${form.hidden==="true"?"true":"false"};;`;
    case "location":return "geo:"+(form.lat||"0")+","+(form.lng||"0");
    case "contact":return "MECARD:N:"+(form.name||"")+";TEL:"+(form.contactPhone||"")+";EMAIL:"+(form.contactEmail||"")+";;";
    default:return "";
  }
}