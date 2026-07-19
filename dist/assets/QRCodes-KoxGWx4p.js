import{z as e}from"./index.esm-BPyY5c2Q.js";import{h as t,o as n,r}from"./config-Bv6D77EM.js";import{dt as i,lt as a,ot as o,v as s,vt as c,z as l}from"./index-Dyb8jvI6.js";import{t as u}from"./esm-CRZqIKvJ.js";var d=e(c(),1),f=i();function p(){let{user:e}=(0,d.useContext)(a),[i,c]=(0,d.useState)(null),[p,m]=(0,d.useState)(!0);(0,d.useEffect)(()=>{async function i(){if(!e?.shopId){m(!1);return}let i=await n(t(r,`shops`,e.shopId));i.exists()&&c({id:i.id,...i.data()}),m(!1)}i()},[e?.shopId]);let h=i?`${window.location.origin}/shop/${i.slug}`:``;function g(){let e=window.open(``,`_blank`);e.document.write(`
      <html><head><title>Shop QR - ${i?.name}</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .container { text-align: center; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        p { color: #666; margin-bottom: 20px; }
        .url { font-size: 12px; color: #999; margin-top: 16px; word-break: break-all; }
        @media print { body { padding: 40px; } }
      </style></head><body>
      <div class="container">
        <h1>${i?.name||`Shop`}</h1>
        <p>Scan to visit our shop</p>
        <div id="qr"></div>
        <p class="url">${h}</p>
      </div>
      <script>
        const svg = document.querySelector('#qr-container svg');
        if (svg) document.getElementById('qr').appendChild(svg.cloneNode(true));
      <\/script>
      </body></html>
    `),e.document.close();let t=document.querySelector(`.qr-print-area svg`);t&&(e.document.getElementById(`qr`).innerHTML=``,e.document.getElementById(`qr`).appendChild(t.cloneNode(!0))),setTimeout(()=>e.print(),300)}function _(){let e=document.querySelector(`.qr-print-area svg`);if(!e)return;let t=new XMLSerializer().serializeToString(e),n=document.createElement(`canvas`),r=n.getContext(`2d`),a=new Image;a.onload=()=>{n.width=a.width,n.height=a.height,r.fillStyle=`#fff`,r.fillRect(0,0,n.width,n.height),r.drawImage(a,0,0);let e=document.createElement(`a`);e.download=`${i?.name||`shop`}-qr.png`,e.href=n.toDataURL(`image/png`),e.click()},a.src=`data:image/svg+xml;base64,`+btoa(unescape(encodeURIComponent(t)))}return p?(0,f.jsx)(o,{}):i?(0,f.jsxs)(`div`,{className:`max-w-2xl`,children:[(0,f.jsx)(`h1`,{className:`text-2xl font-bold mb-6`,children:`QR Codes`}),(0,f.jsxs)(`div`,{className:`card text-center`,children:[(0,f.jsx)(`h2`,{className:`font-semibold mb-1`,children:`Shop QR`}),(0,f.jsx)(`p`,{className:`text-sm text-gray-500 mb-6`,children:`Scanning opens the correct page`}),(0,f.jsx)(`div`,{className:`qr-print-area inline-block bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200`,children:(0,f.jsx)(u,{value:h,size:200})}),(0,f.jsx)(`p`,{className:`text-sm text-gray-400 mt-4 break-all`,children:h}),(0,f.jsxs)(`div`,{className:`flex justify-center gap-3 mt-6`,children:[(0,f.jsxs)(`button`,{onClick:g,className:`btn-secondary flex items-center gap-2`,children:[(0,f.jsx)(l,{}),` Print QR`]}),(0,f.jsxs)(`button`,{onClick:_,className:`btn-secondary flex items-center gap-2`,children:[(0,f.jsx)(s,{}),` Download QR`]})]})]})]}):(0,f.jsx)(`p`,{children:`Shop not found`})}export{p as default};