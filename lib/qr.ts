import QRCode from "qrcode";

function wifiEscape(value:string){return String(value||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/:/g,"\\:");}

export async function makeQrDataUrl(value:string,design:any={}){
 const dark=/^#[0-9a-fA-F]{6}$/.test(String(design.dark||""))?String(design.dark):"#111827";
 const light=/^#[0-9a-fA-F]{6}$/.test(String(design.light||""))?String(design.light):"#FFFFFF";
 const logo=String(design.logoDataUrl||"");
 if(logo&&logo.length<700000){
  let svg=await QRCode.toString(value,{type:"svg",width:1200,margin:4,errorCorrectionLevel:"H",color:{dark,light}});
  const safeLogo=logo.replace(/"/g,"&quot;").replace(/</g,"").replace(/>/g,"");
  const overlay="<g class=\"skanmakery-logo\"><circle cx=\"600\" cy=\"600\" r=\"118\" fill=\"#ffffff\"/><image href=\""+safeLogo+"\" x=\"500\" y=\"500\" width=\"200\" height=\"200\" preserveAspectRatio=\"xMidYMid meet\"/></g>";
  svg=svg.replace("</svg>",overlay+"</svg>");
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
 }
 return QRCode.toDataURL(value,{width:1200,margin:4,errorCorrectionLevel:"H",color:{dark,light}});
}

export function makeTarget(type:string,form:Record<string,string>){
 switch(type){
  case "url":{let u=(form.url||"").trim();if(u&&!/^https?:\/\//i.test(u))u="https://"+u;return u;}
  case "text":return form.text||"";
  case "phone":{const p=(form.phone||"").trim();return "tel:"+(p.startsWith("*")?p.replace(/#$/,"%23"):p);}
  case "email":return "mailto:"+(form.email||"").trim();
  case "whatsapp":return "https://wa.me/"+(form.whatsapp||"").replace(/\D/g,"");
  case "wifi":return "WIFI:T:"+(form.security||"WPA")+";S:"+wifiEscape(form.ssid||"")+";P:"+wifiEscape(form.password||"")+";H:"+(form.hidden==="true"?"true":"false")+";;";
  case "location":return "geo:"+(form.lat||"0")+","+(form.lng||"0");
  case "contact":return "MECARD:N:"+(form.name||"")+";TEL:"+(form.contactPhone||"")+";EMAIL:"+(form.contactEmail||"")+";;";
  default:return "";
 }
}