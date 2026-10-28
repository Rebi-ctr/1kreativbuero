const fs=require('fs');const sharp=require('/Users/cpol-baumberger/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{const out=process.cwd()+'/output/logo-materials/';const svg=fs.readFileSync('/Users/cpol-baumberger/Downloads/1kreativbüro.svg','utf8');const els=[...svg.matchAll(/<(?:path|ellipse)\b[^>]*\/>/g)].map(m=>m[0]);
const groups=[[19],[8,16,17],[3],[7],[6],[9],[12],[10,14],[5,15,18],[11,13,1,2],[4],[0]];
const names=['01-1-silber','02-K-pluesch','03-R-latex','04-E-chrom','05-A-glas','06-T-beton','07-I-irisierend','08-V-harz','09-B-keramik','10-UE-gummi','11-R-holz','12-O-gold'];
const boxes=[[12,241,171,471],[166,242,333,470],[334,242,507,470],[510,241,683,470],[682,241,849,470],[846,241,1041,470],[1043,242,1125,470],[1118,241,1303,470],[1303,242,1489,470],[1480,184,1659,470],[1657,242,1832,470],[1827,242,2024,470]];
const composites=[];const w=3508,h=472;const src=out+'material-entwurf.png';
for(let i=0;i<groups.length;i++){const body=groups[i].map(j=>els[j].replace(/class="cls-\d"/,`fill="${j===18?'black':'white'}"`)).join('');const masksvg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 841.89 113.39"><defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="841.89" height="113.39">${body}</mask></defs><rect width="841.89" height="113.39" fill="white" mask="url(#m)"/></svg>`;
const mask=await sharp(Buffer.from(masksvg)).png().toBuffer();const {info}=await sharp(mask).trim().toBuffer({resolveWithObject:true});const left=-info.trimOffsetLeft,top=-info.trimOffsetTop;const b=boxes[i].map(v=>Math.round(v*2170/2048));const tex=await sharp(src).extract({left:b[0],top:b[1],width:b[2]-b[0],height:b[3]-b[1]}).resize(info.width,info.height,{fit:'fill'}).flatten({background:i===4?'#c6cdd2':'#888888'}).ensureAlpha().png().toBuffer();
const full=await sharp({create:{width:w,height:h,channels:4,background:'#00000000'}}).composite([{input:tex,left,top}]).png().toBuffer();const layer=await sharp(full).composite([{input:mask,blend:'dest-in'}]).png().toBuffer();fs.writeFileSync(out+names[i]+'.png',layer);composites.push({input:layer,left:0,top:0});}
await sharp({create:{width:w,height:h,channels:4,background:'#00000000'}}).composite(composites).png().toFile(out+'logo-material-exakte-konturen.png');
fs.copyFileSync('/Users/cpol-baumberger/Downloads/1kreativbüro.svg',out+'original.svg');
await sharp(out+'logo-material-exakte-konturen.png').flatten({background:'#f4f4f4'}).png().toFile(out+'vorschau.png');
})();
